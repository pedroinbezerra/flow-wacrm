import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { assertAccountOperationalAccess } from '@/lib/auth/account'
import { detectPromptInjection } from './prompt-builder'
import { resolveTurnTiming, TURN_CLAIM_LEASE_MS } from './turn-config'
import { appendMessageToTurn, cancelOpenTurns, type ClaimedTurn } from './turn-store'
import { runTurn } from './turn-runner'
import type { TurnWaiterTicket } from './turn-waiter'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function getSupabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

export interface ProcessInboundAIArgs {
  accountId: string
  conversationId: string
  contactId: string
  senderPhone: string
  inboundMessageText: string
  metaMessageId?: string
  /**
   * UUID da linha recém-inserida em `messages`. É por ele que a mensagem
   * entra no turno; sem ele não há o que agregar e o serviço declina.
   */
  internalMessageId?: string
  /** `created_at` da mesma linha, para preservar a ordem real do turno. */
  messageCreatedAt?: string
}

export interface ProcessInboundAIResult {
  handled: boolean
  reason?: string
  /** A mensagem entrou em um turno e a IA vai responder quando ele fechar. */
  enqueued?: boolean
  turnId?: string
  responseSent?: boolean
  handoffTriggered?: boolean
  mediaSentCount?: number
  securityEventLogged?: boolean
  /**
   * Bilhete do despertador pós-webhook, quando há um a armar.
   *
   * Devolvido em vez de agendado aqui de propósito: `after()` só existe
   * dentro de um contexto de requisição, e este módulo também roda em
   * teste e a partir do drenador. Quem arma é a rota do webhook.
   */
  waiter?: TurnWaiterTicket
}

/**
 * Recebe uma mensagem do WhatsApp para o Atendimento Inteligente.
 *
 * Esta função NÃO responde. Ela decide se a mensagem é da IA e, sendo,
 * a anexa ao turno aberto da conversa — abrindo um se não houver. Quem
 * responde é `runTurn`, depois que o turno fechar.
 *
 * A separação é o ponto do trabalho: recebimento é evento de transporte,
 * resposta é ato de conversa. Antes disso, seis mensagens seguidas
 * produziam seis execuções e seis respostas a pedaços de uma fala só.
 *
 * O retorno continua dizendo `handled: true` quando a IA assumiu a
 * mensagem — é o que o webhook usa para não disparar as automações de
 * conteúdo em cima do mesmo texto.
 */
export async function processInboundWithAIService(
  args: ProcessInboundAIArgs
): Promise<ProcessInboundAIResult> {
  const {
    accountId,
    conversationId,
    contactId,
    inboundMessageText,
    internalMessageId,
    messageCreatedAt,
  } = args

  try {
    await assertAccountOperationalAccess(accountId, { isWriteOperation: true })
  } catch (accErr) {
    const message = accErr instanceof Error ? accErr.message : String(accErr)
    console.warn(`[ai-service] conta ${accountId} restrita/suspensa: ${message}`)
    return { handled: false, reason: 'account_restricted' }
  }

  const supabase: SupabaseClient = getSupabaseAdmin()

  const { data: config, error: configErr } = await supabase
    .from('ai_service_config')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (configErr) {
    console.error('[ai-service] erro ao ler a configuração do serviço:', configErr)
    return { handled: false, reason: 'config_fetch_error' }
  }
  if (!config || !config.enabled) return { handled: false, reason: 'ai_service_disabled' }
  if (!config.openai_api_key) {
    console.warn('[ai-service] chave BYOK ausente na conta:', accountId)
    return { handled: false, reason: 'byok_key_missing' }
  }

  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id, ai_handler_status')
    .eq('id', conversationId)
    .single()

  if (convErr || !conv) {
    console.error('[ai-service] conversa não encontrada:', convErr)
    return { handled: false, reason: 'conversation_not_found' }
  }
  if (conv.ai_handler_status === 'human') {
    return { handled: false, reason: 'human_handler_active' }
  }

  // Injeção de prompt é barrada na porta: a conversa vai para atendimento
  // humano e o que estava acumulado é descartado — não faz sentido a IA
  // continuar montando um turno que ela não vai responder.
  //
  // A mesma checagem roda de novo sobre o turno inteiro em `runTurn`:
  // aqui pega a mensagem isolada, lá pega a tentativa fatiada em várias.
  const injection = detectPromptInjection(inboundMessageText)
  if (injection.isInjection) {
    console.warn('[ai-service] injeção de prompt detectada:', injection.reason)

    await supabase.from('ai_security_events').insert({
      account_id: accountId,
      conversation_id: conversationId,
      event_type: 'prompt_injection_detected',
      severity: 'warning',
      details: `Tentativa de injeção de prompt: ${injection.reason}. Texto: "${inboundMessageText.slice(0, 100)}"`,
    })

    await supabase
      .from('conversations')
      .update({
        ai_handler_status: 'human',
        ai_handoff_at: new Date().toISOString(),
        ai_handoff_reason: `Segurança: ${injection.reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    await cancelOpenTurns(supabase, conversationId, 'security_handoff')

    return {
      handled: true,
      handoffTriggered: true,
      securityEventLogged: true,
      reason: 'injection_blocked',
    }
  }

  if (!internalMessageId || !messageCreatedAt) {
    // Chamador legado que não passa a linha persistida. Sem o id não há
    // como amarrar a mensagem ao turno de forma idempotente, e inventar
    // um id aqui quebraria a proteção contra replay de webhook.
    console.warn('[ai-service] mensagem sem id interno; turno não pôde ser formado')
    return { handled: false, reason: 'internal_message_id_missing' }
  }

  const timing = resolveTurnTiming(config)

  const appended = await appendMessageToTurn(supabase, {
    accountId,
    conversationId,
    contactId,
    messageId: internalMessageId,
    messageCreatedAt,
    inactivityMs: timing.inactivityMs,
    burstInactivityMs: timing.burstInactivityMs,
    maxWaitMs: timing.maxWaitMs,
  })

  if (!appended) {
    return { handled: false, reason: 'turn_append_failed' }
  }

  // Replay do webhook: a mensagem já estava no turno. Ela continua sendo
  // da IA, mas nada foi acrescentado e nada precisa ser reprocessado.
  if (appended.wasDuplicate) {
    return {
      handled: true,
      enqueued: true,
      turnId: appended.turnId,
      reason: 'duplicate_inbound_ignored',
    }
  }

  // Agregação desligada devolve o comportamento antigo — uma resposta por
  // mensagem — sem criar um segundo caminho de execução: o turno fecha
  // aqui mesmo e o mesmo runner responde.
  if (!timing.aggregationEnabled) {
    const claimed = await claimTurnNow(supabase, appended.turnId)
    if (!claimed) {
      return { handled: true, enqueued: true, turnId: appended.turnId, reason: 'claim_lost' }
    }
    const result = await runTurn(supabase, claimed)
    return {
      handled: true,
      turnId: result.turnId,
      reason: result.outcome,
      responseSent: result.responseSent,
      handoffTriggered: result.handoffTriggered,
      mediaSentCount: result.mediaSentCount,
    }
  }

  return {
    handled: true,
    enqueued: true,
    turnId: appended.turnId,
    reason: appended.wasCreated ? 'turn_opened' : 'turn_extended',
    // O caminho rápido. `closesAt` vai como a string que o banco
    // devolveu — converter aqui quebraria a reivindicação.
    waiter: {
      turnId: appended.turnId,
      expectedGeneration: appended.generation,
      expectedClosesAt: appended.closesAt,
      accountId,
      conversationId,
    },
  }
}

async function claimTurnNow(
  supabase: SupabaseClient,
  turnId: string
): Promise<ClaimedTurn | null> {
  const { data, error } = await supabase.rpc('ai_turn_claim_one', {
    p_turn_id: turnId,
    p_lease_ms: TURN_CLAIM_LEASE_MS,
  })

  if (error) {
    console.error('[ai-service] ai_turn_claim_one falhou:', error.message)
    return null
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null

  return {
    turnId: String(row.turn_id),
    accountId: String(row.account_id),
    conversationId: String(row.conversation_id),
    contactId: String(row.contact_id),
    claimToken: String(row.claim_token),
    claimedGeneration: Number(row.claimed_generation ?? 0),
    messageCount: Number(row.message_count ?? 0),
    firstMessageAt: String(row.first_message_at),
    lastMessageAt: String(row.last_message_at),
    attemptCount: Number(row.attempt_count ?? 0),
  }
}
