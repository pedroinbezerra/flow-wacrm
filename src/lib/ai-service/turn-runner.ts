/**
 * Execução de um turno conversacional.
 *
 * O fluxo antigo era `mensagem → LLM → resposta`. Aqui ele é
 * `turno → compreensão → planejamento → execução → comunicação`.
 *
 * O runner é chamado depois que o turno já fechou e foi reivindicado —
 * ele nunca decide sozinho que é hora de falar. E antes de qualquer
 * envio ao WhatsApp ele pede o direito de publicar: se o cliente
 * escreveu de novo enquanto isto rodava, a resposta em mãos ficou velha
 * e morre aqui, sem sair.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { assertAccountOperationalAccess } from '@/lib/auth/account'
import { decrypt } from '@/lib/whatsapp/encryption'
import { sendTextMessage, sendMediaMessage } from '@/lib/whatsapp/meta-api'
import { resolveSendableMediaLink } from '@/lib/storage/media-access'
import { formatConversationPreview } from '@/lib/conversation-preview'
import { recordUsageEvent } from '@/lib/consumption/engine'
import { createChatCompletion, type ChatMessage } from './openai-client'
import {
  buildAgentBrief,
  buildSystemPrompt,
  detectPromptInjection,
  parseAIResponse,
  type AIKnowledgeItem,
  type AIMediaItem,
} from './prompt-builder'
import {
  buildPlannerPrompt,
  buildTurnTranscript,
  composeIntermediateMessage,
  parseResponsePlan,
  FALLBACK_PLAN,
  type ResponsePlan,
} from './response-planner'
import { resolveTurnTiming } from './turn-config'
import {
  beginPublish,
  finishTurn,
  loadEffectiveTurnContext,
  markExternalAttempt,
  markPresenceSent,
  recordTurnPlan,
  yieldTurnClaim,
  type ClaimedTurn,
} from './turn-store'

/** Respostas da IA por conversa, por hora, antes do handoff automático. */
const AI_MESSAGES_PER_HOUR_LIMIT = 15

/** Mensagens anteriores ao turno usadas como histórico. */
const HISTORY_WINDOW = 10

/** Teto de saída do planejador: ele devolve um JSON curto, não prosa. */
const PLANNER_MAX_TOKENS = 400

export interface RunTurnResult {
  turnId: string
  outcome: string
  responseSent: boolean
  intermediateSent: boolean
  handoffTriggered: boolean
  mediaSentCount: number
}

export interface RunTurnOptions {
  /** Timestamp (ms) em que a invocação serverless atual começou */
  invocationStartedAt?: number
  /** Teto total de duração da Function na plataforma (padrão 60s) */
  maxDurationMs?: number
}

interface LlmOutcome {
  ok: boolean
  content: string
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  error?: string
}

const EMPTY_USAGE = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

function terminal(turnId: string, outcome: string): RunTurnResult {
  return {
    turnId,
    outcome,
    responseSent: false,
    intermediateSent: false,
    handoffTriggered: false,
    mediaSentCount: 0,
  }
}

async function moveToHuman(
  supabase: SupabaseClient,
  conversationId: string,
  reason: string,
): Promise<void> {
  await supabase
    .from('conversations')
    .update({
      ai_handler_status: 'human',
      ai_handoff_at: new Date().toISOString(),
      ai_handoff_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
}

const PLANNER_TIMEOUT_MS = 8_000
const DEFAULT_FUNCTION_MAX_DURATION_MS = 60_000
const SAFETY_MARGIN_MS = 5_000
const MIN_SAFE_GENERATION_BUDGET_MS = 3_000
const OPERATIONAL_MAX_GENERATION_TIMEOUT_MS = 25_000

async function callLlm(args: {
  apiKey: string
  baseUrl: string
  model: string
  messages: ChatMessage[]
  temperature: number
  maxTokens: number
  timeoutMs?: number
  signal?: AbortSignal
}): Promise<LlmOutcome> {
  try {
    const result = await createChatCompletion({
      apiKey: args.apiKey,
      baseUrl: args.baseUrl,
      model: args.model,
      messages: args.messages,
      temperature: args.temperature,
      maxTokens: args.maxTokens,
      timeoutMs: args.timeoutMs,
      signal: args.signal,
    })
    return { ok: true, content: result.content, usage: result.usage ?? EMPTY_USAGE }
  } catch (err) {
    return {
      ok: false,
      content: '',
      usage: EMPTY_USAGE,
      error: err instanceof Error ? err.message : 'Falha na chamada ao provedor de IA',
    }
  }
}

/**
 * Executa um turno já reivindicado.
 *
 * Nunca lança: o drenador processa vários turnos em sequência e a falha
 * de um não pode derrubar os outros. O desfecho vai para o próprio turno
 * e para `ai_execution_logs`.
 */
export async function runTurn(
  supabase: SupabaseClient,
  claimed: ClaimedTurn,
  options?: RunTurnOptions,
): Promise<RunTurnResult> {
  const startedAt = Date.now()
  const invocationStartedAt = options?.invocationStartedAt ?? startedAt
  const maxDurationMs = options?.maxDurationMs ?? DEFAULT_FUNCTION_MAX_DURATION_MS
  const { turnId, claimToken, accountId, conversationId } = claimed

  // Quanto tempo o turno passou acumulando antes de virar execução. É o
  // número que calibra `turn_inactivity_ms` com conversa real.
  const aggregationWaitMs = Math.max(
    0,
    startedAt - new Date(claimed.firstMessageAt).getTime(),
  )

  function getRemainingBudgetMs(): number {
    const elapsed = Date.now() - invocationStartedAt
    return maxDurationMs - elapsed - SAFETY_MARGIN_MS
  }

  const yieldToRecovery = async (reason: string): Promise<RunTurnResult> => {
    console.warn(`[ai-turns] Yield do turno ${turnId} para recovery cron: ${reason}`)
    await yieldTurnClaim(supabase, turnId, claimToken, reason)
    return terminal(turnId, 'yielded_to_recovery')
  }

  const fail = async (outcome: string, message?: string): Promise<RunTurnResult> => {
    await finishTurn(supabase, { turnId, claimToken, status: 'failed', outcome, error: message })
    return terminal(turnId, outcome)
  }

  const stop = async (outcome: string): Promise<RunTurnResult> => {
    await finishTurn(supabase, { turnId, claimToken, status: 'completed', outcome })
    return terminal(turnId, outcome)
  }

  try {
    await assertAccountOperationalAccess(accountId, { isWriteOperation: true, client: supabase })
  } catch (accErr) {
    const message = accErr instanceof Error ? accErr.message : String(accErr)
    console.warn(`[ai-turns] conta ${accountId} restrita/suspensa: ${message}`)
    return stop('account_restricted')
  }

  const { data: config, error: configErr } = await supabase
    .from('ai_service_config')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (configErr) return fail('config_fetch_error', configErr.message)
  if (!config || !config.enabled) return stop('ai_service_disabled')
  if (!config.openai_api_key) return stop('byok_key_missing')

  const timing = resolveTurnTiming(config)

  // A conversa pode ter passado para atendimento humano enquanto o turno
  // acumulava. O que estava acumulado deixa de ser assunto da IA.
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id, ai_handler_status')
    .eq('id', conversationId)
    .single()

  if (convErr || !conv) return fail('conversation_not_found', convErr?.message)
  if (conv.ai_handler_status === 'human') return stop('human_handler_active')

  // Contexto EFETIVO: as mensagens deste turno mais as de turnos
  // anteriores que ficaram sem resposta. Um turno invalidado não some da
  // conversa — "Quanto custa?" continua sendo uma pergunta em aberto
  // mesmo que o turno que a continha tenha sido descartado.
  const { messages: effectiveMessages, carriedOverCount } = await loadEffectiveTurnContext(
    supabase,
    turnId,
  )
  if (effectiveMessages.length === 0) return stop('empty_turn')

  const transcript = buildTurnTranscript(effectiveMessages)
  if (!transcript.trim()) return stop('no_textual_content')

  const lastTurnMetaMessageId =
    [...effectiveMessages].sort((a, b) => a.seq - b.seq).at(-1)?.metaMessageId ?? null

  // Injeção é avaliada sobre o turno inteiro: quem fatia a tentativa em
  // várias mensagens não deve escapar por isso.
  const injection = detectPromptInjection(transcript)
  if (injection.isInjection) {
    console.warn('[ai-turns] injeção de prompt detectada:', injection.reason)
    await supabase.from('ai_security_events').insert({
      account_id: accountId,
      conversation_id: conversationId,
      event_type: 'prompt_injection_detected',
      severity: 'warning',
      details: `Tentativa de injeção de prompt: ${injection.reason}. Turno: "${transcript.slice(0, 200)}"`,
    })
    await moveToHuman(supabase, conversationId, `Segurança: ${injection.reason}`)
    await finishTurn(supabase, {
      turnId,
      claimToken,
      status: 'completed',
      outcome: 'injection_blocked',
    })
    return { ...terminal(turnId, 'injection_blocked'), handoffTriggered: true }
  }

  // Limite por conversa. Contado em respostas efetivamente enviadas, e
  // não em mensagens recebidas — com turnos, seis linhas do cliente
  // consomem uma resposta, não seis.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: botMessagesInLastHour } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'bot')
    .gte('created_at', oneHourAgo)

  if ((botMessagesInLastHour ?? 0) >= AI_MESSAGES_PER_HOUR_LIMIT) {
    console.warn('[ai-turns] limite horário excedido na conversa:', conversationId)
    await supabase.from('ai_security_events').insert({
      account_id: accountId,
      conversation_id: conversationId,
      event_type: 'rate_limit_exceeded',
      severity: 'warning',
      details: `Limite de ${AI_MESSAGES_PER_HOUR_LIMIT} respostas da IA por hora excedido nesta conversa. Handoff automático ativado.`,
    })
    await moveToHuman(supabase, conversationId, 'Limite de mensagens automáticas por hora excedido')
    await finishTurn(supabase, {
      turnId,
      claimToken,
      status: 'completed',
      outcome: 'rate_limit_exceeded',
    })
    return { ...terminal(turnId, 'rate_limit_exceeded'), handoffTriggered: true }
  }

  let apiKey = ''
  try {
    apiKey = decrypt(config.openai_api_key)
  } catch (err) {
    return fail('key_decryption_failed', err instanceof Error ? err.message : undefined)
  }

  const { data: waConfig, error: waErr } = await supabase
    .from('whatsapp_config')
    .select('phone_number_id, access_token')
    .eq('account_id', accountId)
    .maybeSingle()

  if (waErr || !waConfig) return fail('whatsapp_config_missing', waErr?.message)

  let accessToken = ''
  try {
    accessToken = decrypt(waConfig.access_token)
  } catch (err) {
    return fail('whatsapp_token_decryption_failed', err instanceof Error ? err.message : undefined)
  }

  const { data: contact } = await supabase
    .from('contacts')
    .select('phone')
    .eq('id', claimed.contactId)
    .maybeSingle()

  const senderPhone = contact?.phone
  if (!senderPhone) return fail('contact_phone_missing')

  const { data: knowledgeRows } = await supabase
    .from('ai_knowledge_base')
    .select('id, category, title, content')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  const knowledgeItems: AIKnowledgeItem[] = knowledgeRows ?? []

  const { data: mediaRows } = await supabase
    .from('ai_media_library')
    .select('id, title, media_type, media_url, description')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  const mediaItems: AIMediaItem[] = mediaRows ?? []

  // Histórico é o que veio ANTES do contexto efetivo. O corte usa a
  // primeira mensagem EFETIVA, não a do turno: uma fala herdada de turno
  // invalidado é a fala atual do cliente, e apareceria duas vezes se
  // entrasse também como histórico.
  const firstEffectiveAt = effectiveMessages.reduce(
    (earliest, m) => (m.createdAt < earliest ? m.createdAt : earliest),
    effectiveMessages[0].createdAt,
  )

  const { data: historyRows } = await supabase
    .from('messages')
    .select('sender_type, content_text, created_at')
    .eq('conversation_id', conversationId)
    .lt('created_at', firstEffectiveAt)
    .order('created_at', { ascending: false })
    .limit(HISTORY_WINDOW)

  const history: ChatMessage[] = ((historyRows ?? []) as {
    sender_type: string
    content_text: string | null
  }[])
    .reverse()
    .filter((m) => m.content_text)
    .map((m) => ({
      role: m.sender_type === 'customer' ? ('user' as const) : ('assistant' as const),
      content: m.content_text ?? '',
    }))

  const baseUrl = config.openai_api_url || 'https://api.openai.com/v1'
  const model = config.openai_model || 'gpt-4o-mini'

  // ------------------------------------------------------------
  // Planejamento: o que vai ser preciso fazer para responder isto?
  // ------------------------------------------------------------
  const plannerBudget = getRemainingBudgetMs()
  if (plannerBudget < 2_000) {
    return yieldToRecovery('Orçamento insuficiente antes do planejamento')
  }
  const plannerTimeoutMs = Math.min(PLANNER_TIMEOUT_MS, plannerBudget)

  const planningStartedAt = Date.now()
  const plannerOutcome = await callLlm({
    apiKey,
    baseUrl,
    model,
    messages: buildPlannerPrompt({
      agentBrief: buildAgentBrief(config),
      transcript,
      knowledgeItems,
      mediaItems,
      history,
    }),
    // Planejamento é classificação, não redação: temperatura baixa.
    temperature: 0,
    maxTokens: PLANNER_MAX_TOKENS,
    timeoutMs: plannerTimeoutMs,
  })
  // O planejamento é uma inferência SERIAL antes da resposta: ele soma
  // latência que o cliente sente. Medido em separado justamente para que
  // dê para saber se está pagando o próprio custo.
  const planningMs = Date.now() - planningStartedAt

  // Planejamento que falha degrada para "responde já, sem intermediária".
  // O erro seguro é ficar calado até ter a resposta.
  const plan: ResponsePlan = plannerOutcome.ok
    ? parseResponsePlan(plannerOutcome.content)
    : { ...FALLBACK_PLAN }

  await recordTurnPlan(supabase, turnId, claimToken, plan as unknown as Record<string, unknown>)

  // ------------------------------------------------------------
  // Execução: a resposta final começa a ser produzida AGORA.
  //
  // Orçamento dinâmico de segurança: garante que a geração nunca receba
  // um timeout maior que o tempo restante real da invocação serverless.
  // Se não houver tempo suficiente, faz yield para o recovery cron em vez
  // de falhar terminalmente ou tomar SIGKILL da plataforma.
  // ------------------------------------------------------------
  const genBudget = getRemainingBudgetMs()
  if (genBudget < MIN_SAFE_GENERATION_BUDGET_MS) {
    return yieldToRecovery(`Orçamento insuficiente (${genBudget}ms restantes) antes da geração`)
  }

  const generationTimeoutMs = Math.min(OPERATIONAL_MAX_GENERATION_TIMEOUT_MS, genBudget)

  const executionMessages: ChatMessage[] = [
    {
      role: 'system',
      content: buildSystemPrompt(config, knowledgeItems, mediaItems, { turnAware: true }),
    },
    ...history,
    { role: 'user', content: transcript },
  ]

  const generationStartedAt = Date.now()
  const finalPromise = callLlm({
    apiKey,
    baseUrl,
    model,
    messages: executionMessages,
    temperature: Number(config.temperature ?? 0.3),
    maxTokens: Number(config.max_tokens ?? 500),
    timeoutMs: generationTimeoutMs,
  })

  let intermediateSent = false
  const intermediate = composeIntermediateMessage(plan)

  if (timing.presenceEnabled && intermediate.allowed) {
    // A presença é ancorada no silêncio percebido real desde a última mensagem
    // do cliente (claimed.lastMessageAt), descontando o tempo gasto na fila e no planner.
    const lastMsgMs = new Date(claimed.lastMessageAt).getTime()
    const silenceElapsedMs = Number.isFinite(lastMsgMs) ? Date.now() - lastMsgMs : Date.now() - startedAt
    const remainingPresenceDelayMs = Math.max(0, timing.presenceThresholdMs - silenceElapsedMs)

    let timer: ReturnType<typeof setTimeout> | undefined
    const threshold = new Promise<'threshold'>((resolve) => {
      timer = setTimeout(() => resolve('threshold'), remainingPresenceDelayMs)
    })

    const winner = await Promise.race([
      finalPromise.then(() => 'final' as const),
      threshold,
    ])
    if (timer) clearTimeout(timer)

    // Só falamos quando o silêncio já é perceptível de verdade. Se a
    // resposta final ganhou a corrida, ela vai sozinha.
    if (winner === 'threshold') {
      const presenceBudget = getRemainingBudgetMs()
      // Se não houver orçamento mínimo seguro para presença (>= 1.500ms),
      // simplesmente suprima a presença (skip) sem fazer yield nem atrasar a resposta final.
      if (presenceBudget >= 1_500) {
        const mayAcknowledge = await markPresenceSent(supabase, turnId, claimToken)
        if (mayAcknowledge) {
          try {
            const sent = await sendTextMessage({
              phoneNumberId: waConfig.phone_number_id,
              accessToken,
              to: senderPhone,
              text: intermediate.text,
              timeoutMs: Math.min(4_000, presenceBudget),
            })
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              sender_type: 'bot',
              content_type: 'text',
              content_text: intermediate.text,
              message_id: sent.messageId,
              status: 'delivered',
            })
            intermediateSent = true

            await supabase.from('ai_execution_logs').insert({
              account_id: accountId,
              conversation_id: conversationId,
              turn_id: turnId,
              stage: plan.strategy === 'partial_then_work' ? 'partial' : 'presence',
              inbound_message_text: transcript,
              outbound_text: intermediate.text,
              model_used: model,
              execution_time_ms: Date.now() - startedAt,
              planning_ms: planningMs,
              turn_message_count: effectiveMessages.length,
              carried_over_message_count: carriedOverCount,
              plan,
              aggregation_wait_ms: aggregationWaitMs,
            })
          } catch (sendErr) {
            // Falha aqui não invalida a resposta final — ela é o que
            // importa. Segue sem a intermediária.
            console.error('[ai-turns] envio da mensagem intermediária falhou:', sendErr)
          }
        }
      }
    }
  }

  const finalOutcome = await finalPromise
  const generationMs = Date.now() - generationStartedAt

  if (!finalOutcome.ok) return fail('llm_api_error', finalOutcome.error)
  if (!finalOutcome.content) return fail('empty_llm_response')

  const parsed = parseAIResponse(finalOutcome.content)

  // ------------------------------------------------------------
  // Comunicação: o ponto de não-retorno.
  //
  // Daqui em diante a resposta sai. Se o cliente escreveu de novo
  // enquanto isto rodava, o turno já foi invalidado e o UPDATE abaixo
  // não casa — a resposta obsoleta morre sem ser publicada, e o turno
  // novo responde considerando tudo.
  // ------------------------------------------------------------
  const hasSomethingToSend = Boolean(parsed.cleanText) || parsed.mediaIdsToSend.length > 0

  if (hasSomethingToSend) {
    const publishBudget = getRemainingBudgetMs()
    if (publishBudget < 2_000) {
      return yieldToRecovery(`Orçamento insuficiente (${publishBudget}ms restantes) antes de autorizar publicação`)
    }
  }

  const mayPublish = await beginPublish(supabase, turnId, claimToken)
  if (!mayPublish) {
    console.log('[ai-turns] resposta descartada por turno invalidado:', turnId)
    await supabase.from('ai_execution_logs').insert({
      account_id: accountId,
      conversation_id: conversationId,
      turn_id: turnId,
      stage: 'superseded',
      inbound_message_text: transcript,
      outbound_text: parsed.cleanText,
      model_used: model,
      prompt_tokens: finalOutcome.usage.prompt_tokens,
      completion_tokens: finalOutcome.usage.completion_tokens,
      total_tokens: finalOutcome.usage.total_tokens,
      execution_time_ms: Date.now() - startedAt,
      planning_ms: planningMs,
      generation_ms: generationMs,
      turn_message_count: effectiveMessages.length,
      carried_over_message_count: carriedOverCount,
      plan,
      aggregation_wait_ms: aggregationWaitMs,
      superseded: true,
    })
    return { ...terminal(turnId, 'superseded_before_publish'), intermediateSent }
  }

  // Ponto de não-retorno. `publishing` foi decisão interna; ESTA marca é
  // consequência no mundo, e o que a separa importa: um executor que
  // morre entre as duas ainda pode ser recuperado, porque nada saiu.
  //
  // Falha aqui significa invalidação entre a autorização e a chamada — a
  // pessoa escreveu de novo nesse intervalo, e a resposta em mãos morre
  // como qualquer outra obsoleta.
  if (hasSomethingToSend) {
    const remainingBeforeAttempt = getRemainingBudgetMs()
    if (remainingBeforeAttempt < 2_000) {
      return yieldToRecovery(`Orçamento insuficiente (${remainingBeforeAttempt}ms restantes) antes de registrar tentativa externa`)
    }

    const mayAttempt = await markExternalAttempt(supabase, turnId, claimToken)
    if (!mayAttempt) {
      console.log('[ai-turns] resposta descartada entre autorização e envio:', turnId)
      await supabase.from('ai_execution_logs').insert({
        account_id: accountId,
        conversation_id: conversationId,
        turn_id: turnId,
        stage: 'superseded',
        inbound_message_text: transcript,
        outbound_text: parsed.cleanText,
        model_used: model,
        prompt_tokens: finalOutcome.usage.prompt_tokens,
        completion_tokens: finalOutcome.usage.completion_tokens,
        total_tokens: finalOutcome.usage.total_tokens,
        execution_time_ms: Date.now() - startedAt,
        planning_ms: planningMs,
        generation_ms: generationMs,
        turn_message_count: effectiveMessages.length,
        carried_over_message_count: carriedOverCount,
        plan,
        aggregation_wait_ms: aggregationWaitMs,
        superseded: true,
      })
      return { ...terminal(turnId, 'superseded_before_publish'), intermediateSent }
    }
  }

  // Imediatamente após a fronteira irreversível de markExternalAttempt, o timeout
  // da chamada externa é exatamente o tempo restante da invocação, limitado pelo
  // teto operacional de 10s e NUNCA superior ao orçamento real.
  const remainingBeforeSend = getRemainingBudgetMs()
  const publishTimeoutMs = Math.max(0, Math.min(10_000, remainingBeforeSend))

  let responseSent = false
  let sendFailed = false
  if (parsed.cleanText) {
    try {
      const sendRes = await sendTextMessage({
        phoneNumberId: waConfig.phone_number_id,
        accessToken,
        to: senderPhone,
        text: parsed.cleanText,
        // Cita a ÚLTIMA mensagem do turno. Citar a primeira faria a
        // resposta parecer atrasada em relação ao que a pessoa acabou
        // de escrever.
        contextMessageId: lastTurnMetaMessageId ?? undefined,
        timeoutMs: publishTimeoutMs,
      })

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'bot',
        content_type: 'text',
        content_text: parsed.cleanText,
        message_id: sendRes.messageId,
        status: 'delivered',
      })

      await supabase
        .from('conversations')
        .update({
          last_message_text: formatConversationPreview(parsed.cleanText, 'text'),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)

      responseSent = true
    } catch (sendErr) {
      // Sem retentativa automática: o turno já está pós-markExternalAttempt,
      // e reexecutar arriscaria uma segunda resposta caso o envio tenha chegado à Meta
      // antes do erro/timeout. O desfecho fica registrado como 'external_result_unknown'.
      sendFailed = true
      console.error('[ai-turns] envio da resposta final falhou (resultado externo desconhecido):', sendErr)
    }
  }

  let mediaSentCount = 0
  const sentMediaIds: string[] = []
  for (const mediaId of parsed.mediaIdsToSend) {
    const mediaItem = mediaItems.find((m) => m.id === mediaId)
    if (!mediaItem) continue

    try {
      const sendableLink = await resolveSendableMediaLink(mediaItem.media_url)
      const mediaSendRes = await sendMediaMessage({
        phoneNumberId: waConfig.phone_number_id,
        accessToken,
        to: senderPhone,
        kind: mediaItem.media_type,
        link: sendableLink,
        caption: mediaItem.title,
        timeoutMs: publishTimeoutMs,
      })

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'bot',
        content_type: mediaItem.media_type,
        media_url: mediaItem.media_url,
        content_text: mediaItem.title,
        message_id: mediaSendRes.messageId,
        status: 'delivered',
      })

      mediaSentCount++
      sentMediaIds.push(mediaItem.id)
    } catch (mediaErr) {
      console.error('[ai-turns] envio de mídia falhou:', mediaErr)
    }
  }

  // Atualização de progresso — deliberadamente não emitida aqui.
  //
  // Progresso é etapa concluída, não tempo decorrido (`FH-46.04`). A
  // execução atual tem uma etapa só: a geração da resposta. Não existe
  // meio-caminho verdadeiro para narrar, e narrar mesmo assim produziria
  // exatamente o "ainda estou verificando" que este trabalho remove.
  // `validateProgressUpdate` (response-planner) é o contrato pronto para
  // quando houver camada de ferramentas: cada ferramenta concluída vira
  // uma etapa, e ele decide se vale dizer. `progress_updates_enabled`
  // existe para a conta declarar a intenção antes disso.

  let handoffTriggered = false
  if (parsed.handoffRequested) {
    const reason = parsed.handoffReason || 'Transferência solicitada pela IA'
    await moveToHuman(supabase, conversationId, reason)
    handoffTriggered = true
  }

  const executionTimeMs = Date.now() - startedAt
  const perceivedLatencyMs = Math.max(
    0,
    Date.now() - new Date(claimed.lastMessageAt).getTime(),
  )

  await supabase.from('ai_execution_logs').insert({
    account_id: accountId,
    conversation_id: conversationId,
    turn_id: turnId,
    stage: 'final',
    inbound_message_text: transcript,
    outbound_text: parsed.cleanText,
    model_used: model,
    prompt_tokens: finalOutcome.usage.prompt_tokens + plannerOutcome.usage.prompt_tokens,
    completion_tokens: finalOutcome.usage.completion_tokens + plannerOutcome.usage.completion_tokens,
    total_tokens: finalOutcome.usage.total_tokens + plannerOutcome.usage.total_tokens,
    execution_time_ms: executionTimeMs,
    planning_ms: planningMs,
    generation_ms: generationMs,
    carried_over_message_count: carriedOverCount,
    knowledge_item_ids: knowledgeItems.map((k) => k.id),
    media_item_ids: sentMediaIds,
    handoff_triggered: handoffTriggered,
    handoff_reason: parsed.handoffReason || null,
    turn_message_count: effectiveMessages.length,
    plan,
    aggregation_wait_ms: aggregationWaitMs,
    perceived_latency_ms: perceivedLatencyMs,
  })

  // Telemetria de consumo: uma execução por turno, não por mensagem.
  await recordUsageEvent(supabase, {
    accountId,
    resourceType: 'ai_execution',
    quantity: 1,
    metadata: {
      turn_id: turnId,
      conversation_id: conversationId,
      turn_message_count: effectiveMessages.length,
      total_tokens: finalOutcome.usage.total_tokens + plannerOutcome.usage.total_tokens,
      planning_ms: planningMs,
      generation_ms: generationMs,
      strategy: plan.strategy,
    },
  }).catch(() => undefined)

  // Mídia enviada também é resposta: o cliente pediu o catálogo e o
  // catálogo chegou, mesmo sem texto junto.
  const somethingReachedTheCustomer = responseSent || mediaSentCount > 0

  const outcome = responseSent
    ? 'responded'
    : mediaSentCount > 0
      ? 'responded_media_only'
      : sendFailed
        ? 'external_result_unknown'
        : 'no_outbound_text'

  await finishTurn(supabase, {
    turnId,
    claimToken,
    // `failed` quando nada chegou ao cliente — e não `completed` com um
    // outcome triste. O status é o que a regra de herança lê: um turno
    // `completed` é considerado coberto, e a pergunta da pessoa sumiria
    // do contexto do turno seguinte sem nunca ter sido respondida.
    //
    // `failed` aqui não provoca reexecução: a fila só devolve turno por
    // lease vencido E com external_attempt_at IS NULL. Com external_attempt_at
    // preenchido, a fila nunca mais retenta automaticamente.
    status: somethingReachedTheCustomer ? 'completed' : 'failed',
    outcome,
    error: sendFailed ? 'Tentativa externa realizada com resultado de entrega indeterminado' : undefined,
    plan: plan as unknown as Record<string, unknown>,
    // Só aqui as mensagens deste turno ficam marcadas como respondidas.
    responsePublished: somethingReachedTheCustomer,
  })

  return {
    turnId,
    outcome,
    responseSent,
    intermediateSent,
    handoffTriggered,
    mediaSentCount,
  }
}
