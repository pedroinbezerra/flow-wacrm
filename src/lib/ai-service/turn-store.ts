/**
 * Acesso ao estado do turno conversacional.
 *
 * Toda transição atômica vive em RPC (migration 069) — este módulo é a
 * fronteira tipada sobre elas. Nenhuma regra de corrida é decidida em
 * TypeScript: o que protege a invariante é o lock de linha do Postgres,
 * e o que chega aqui é apenas o veredito.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { TurnMessage } from './response-planner'

export interface AppendMessageArgs {
  accountId: string
  conversationId: string
  contactId: string
  /** UUID interno da linha em `messages` — não o id da Meta. */
  messageId: string
  messageCreatedAt: string
  /** Janela ociosa enquanto o turno ainda é uma mensagem só. */
  inactivityMs: number
  /** Janela ociosa depois que o turno virou rajada. */
  burstInactivityMs: number
  maxWaitMs: number
}

export interface AppendMessageResult {
  turnId: string
  status: string
  generation: number
  messageCount: number
  closesAt: string
  wasCreated: boolean
  /** Replay do webhook: a mensagem já pertencia a um turno. */
  wasDuplicate: boolean
}

export async function appendMessageToTurn(
  supabase: SupabaseClient,
  args: AppendMessageArgs,
): Promise<AppendMessageResult | null> {
  const { data, error } = await supabase.rpc('ai_turn_append_message', {
    p_account_id: args.accountId,
    p_conversation_id: args.conversationId,
    p_contact_id: args.contactId,
    p_message_id: args.messageId,
    p_message_created_at: args.messageCreatedAt,
    p_inactivity_ms: args.inactivityMs,
    p_max_wait_ms: args.maxWaitMs,
    p_burst_inactivity_ms: args.burstInactivityMs,
  })

  if (error) {
    console.error('[ai-turns] ai_turn_append_message falhou:', error.message)
    return null
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null

  return {
    turnId: row.turn_id,
    status: row.status,
    generation: row.generation,
    messageCount: row.message_count,
    closesAt: row.closes_at,
    wasCreated: row.was_created,
    wasDuplicate: row.was_duplicate,
  }
}

export interface ClaimedTurn {
  turnId: string
  accountId: string
  conversationId: string
  contactId: string
  /** Autoriza publicar. Sem ele, nenhuma mensagem sai. */
  claimToken: string
  claimedGeneration: number
  messageCount: number
  firstMessageAt: string
  lastMessageAt: string
  attemptCount: number
}

export async function claimDueTurns(
  supabase: SupabaseClient,
  opts: { limit: number; leaseMs: number; maxAttempts: number },
): Promise<ClaimedTurn[]> {
  const { data, error } = await supabase.rpc('ai_turn_claim_due', {
    p_limit: opts.limit,
    p_lease_ms: opts.leaseMs,
    p_max_attempts: opts.maxAttempts,
  })

  if (error) {
    console.error('[ai-turns] ai_turn_claim_due falhou:', error.message)
    return []
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
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
  }))
}

/**
 * Adquire o direito de publicar. Chamado imediatamente antes de cada
 * envio ao WhatsApp — inclusive antes da mensagem de presença.
 *
 * `false` significa que o turno foi invalidado (a pessoa falou de novo)
 * ou que o lease venceu. Nos dois casos, a resposta em mãos está velha
 * e não deve sair.
 */
export async function beginPublish(
  supabase: SupabaseClient,
  turnId: string,
  claimToken: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('ai_turn_begin_publish', {
    p_turn_id: turnId,
    p_claim_token: claimToken,
  })

  if (error) {
    console.error('[ai-turns] ai_turn_begin_publish falhou:', error.message)
    return false
  }
  return data === true
}

export async function recordTurnPlan(
  supabase: SupabaseClient,
  turnId: string,
  claimToken: string,
  plan: unknown,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('ai_turn_record_plan', {
    p_turn_id: turnId,
    p_claim_token: claimToken,
    p_plan: plan,
  })
  if (error) {
    console.error('[ai-turns] ai_turn_record_plan falhou:', error.message)
    return false
  }
  return data === true
}

export async function finishTurn(
  supabase: SupabaseClient,
  args: {
    turnId: string
    claimToken: string
    status: 'completed' | 'failed'
    outcome?: string
    error?: string
    plan?: unknown
    /**
     * A resposta final chegou ao cliente. Falso deixa as mensagens do
     * turno em aberto — elas entram no contexto do turno seguinte.
     */
    responsePublished?: boolean
  },
): Promise<boolean> {
  const { data, error } = await supabase.rpc('ai_turn_finish', {
    p_turn_id: args.turnId,
    p_claim_token: args.claimToken,
    p_status: args.status,
    p_outcome: args.outcome ?? null,
    p_error: args.error ?? null,
    p_plan: args.plan ?? null,
    p_response_published: args.responsePublished ?? false,
  })
  if (error) {
    console.error('[ai-turns] ai_turn_finish falhou:', error.message)
    return false
  }
  return data === true
}

/**
 * Encerra o que estiver acumulado para a conversa. Usado quando a
 * conversa deixa de ser da IA — handoff, injeção de prompt, operador
 * assumindo.
 */
export async function cancelOpenTurns(
  supabase: SupabaseClient,
  conversationId: string,
  reason: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('ai_turn_cancel_open', {
    p_conversation_id: conversationId,
    p_reason: reason,
  })
  if (error) {
    console.error('[ai-turns] ai_turn_cancel_open falhou:', error.message)
    return 0
  }
  return typeof data === 'number' ? data : 0
}

export interface EffectiveTurnContext {
  messages: TurnMessage[]
  /** Quantas vieram de turnos anteriores que ficaram sem resposta. */
  carriedOverCount: number
}

/**
 * Carrega o CONTEXTO EFETIVO do turno, na granularidade original.
 *
 * Não é só o que o turno contém. Um turno invalidado não some da
 * conversa: as mensagens dele nunca receberam resposta, e continuam
 * fazendo parte do que a pessoa disse. `ai_turn_effective_messages`
 * devolve as mensagens do turno mais as de todo turno anterior encerrado
 * sem resposta publicada, até a última resposta que de fato saiu.
 *
 * Duas consultas em vez de um join: `messages` é particionada por
 * `created_at` e a RPC devolve apenas os vínculos. O lote é pequeno por
 * construção.
 */
export async function loadEffectiveTurnContext(
  supabase: SupabaseClient,
  turnId: string,
): Promise<EffectiveTurnContext> {
  const empty: EffectiveTurnContext = { messages: [], carriedOverCount: 0 }

  const { data: links, error: linkErr } = await supabase.rpc('ai_turn_effective_messages', {
    p_turn_id: turnId,
  })

  if (linkErr) {
    console.error('[ai-turns] ai_turn_effective_messages falhou:', linkErr.message)
    return empty
  }

  const rows = (links ?? []) as Record<string, unknown>[]
  if (rows.length === 0) return empty

  // A ordem vem da RPC (cronológica, atravessando turnos). `seq` é único
  // apenas dentro de um turno, então não serve como ordenação global —
  // usamos a posição devolvida.
  const orderById = new Map<string, number>()
  const carriedById = new Map<string, boolean>()
  rows.forEach((row, index) => {
    const id = String(row.message_id)
    orderById.set(id, index + 1)
    carriedById.set(id, row.carried_over === true)
  })

  const { data: messageRows, error: msgErr } = await supabase
    .from('messages')
    .select(
      'id, created_at, content_type, content_text, media_url, media_mime_type, message_id, interactive_reply_id, reply_to_message_id',
    )
    .in('id', Array.from(orderById.keys()))

  if (msgErr || !messageRows) {
    console.error('[ai-turns] leitura das mensagens do turno falhou:', msgErr?.message)
    return empty
  }

  const messages = (messageRows as Record<string, unknown>[])
    .map((row) => ({
      id: row.id as string,
      seq: orderById.get(row.id as string) ?? 0,
      createdAt: row.created_at as string,
      contentType: (row.content_type as string) ?? 'text',
      contentText: (row.content_text as string | null) ?? null,
      mediaUrl: (row.media_url as string | null) ?? null,
      mediaMimeType: (row.media_mime_type as string | null) ?? null,
      metaMessageId: (row.message_id as string | null) ?? null,
      interactiveReplyId: (row.interactive_reply_id as string | null) ?? null,
      replyToMessageId: (row.reply_to_message_id as string | null) ?? null,
    }))
    .sort((a, b) => a.seq - b.seq)

  const carriedOverCount = messages.filter((m) => carriedById.get(m.id) === true).length

  return { messages, carriedOverCount }
}

/**
 * Reivindica um turno específico, mas só se ele ainda for aquele que o
 * chamador esperava.
 *
 * É o caminho rápido do despertador pós-webhook. Um despertador criado
 * para a geração 2 de um turno que já está na geração 6 nasceu obsoleto:
 * esta chamada devolve `null` e ele encerra sem acordar nada.
 *
 * `expectedClosesAt` DEVE ser a string devolvida pelo append, repassada
 * sem conversão. Um `new Date(...).toISOString()` no caminho truncaria os
 * microssegundos, nenhuma reivindicação casaria, e o caminho rápido
 * morreria em silêncio — parecendo funcionar, porque o cron de
 * recuperação cobriria tudo alguns segundos depois.
 */
export async function claimTurnIfDue(
  supabase: SupabaseClient,
  args: {
    turnId: string
    expectedGeneration: number
    expectedClosesAt: string
    leaseMs: number
  },
): Promise<ClaimedTurn | null> {
  const { data, error } = await supabase.rpc('ai_turn_claim_if_due', {
    p_turn_id: args.turnId,
    p_expected_generation: args.expectedGeneration,
    p_expected_closes_at: args.expectedClosesAt,
    p_lease_ms: args.leaseMs,
  })

  if (error) {
    console.error('[ai-turns] ai_turn_claim_if_due falhou:', error.message)
    return null
  }

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined
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

/**
 * Autoriza a mensagem de presença.
 *
 * Confere que o turno ainda vale E torna a presença no-máximo-uma-vez,
 * inclusive entre tentativas — um turno recuperado não repete o
 * reconhecimento que o cliente já leu. Não congela o turno: mandar um
 * reconhecimento não dá o direito de publicar uma resposta velha depois.
 */
export async function markPresenceSent(
  supabase: SupabaseClient,
  turnId: string,
  claimToken: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('ai_turn_mark_presence_sent', {
    p_turn_id: turnId,
    p_claim_token: claimToken,
  })

  if (error) {
    console.error('[ai-turns] ai_turn_mark_presence_sent falhou:', error.message)
    return false
  }
  return data === true
}

/**
 * Marca a primeira tentativa de chamada ao WhatsApp.
 *
 * É o verdadeiro ponto de não-retorno — `publishing` é decisão interna,
 * isto é consequência no mundo. `false` significa que o turno foi
 * invalidado entre a autorização e a chamada: nada deve ser enviado.
 */
export async function markExternalAttempt(
  supabase: SupabaseClient,
  turnId: string,
  claimToken: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('ai_turn_mark_external_attempt', {
    p_turn_id: turnId,
    p_claim_token: claimToken,
  })

  if (error) {
    console.error('[ai-turns] ai_turn_mark_external_attempt falhou:', error.message)
    return false
  }
  return data === true
}

/**
 * Libera a reivindicação de um turno quando o executor atual não possui
 * orçamento serverless suficiente para concluir a execução com segurança.
 *
 * Expira o lease imediatamente (`claim_expires_at = NOW() - 1s`), mantendo
 * `status = 'processing'` e `external_attempt_at IS NULL`.
 * O despachante de recuperação (pg_cron a cada 5s) reivindica o turno
 * em uma NOVA invocação limpa com 60s novos de orçamento.
 */
export async function yieldTurnClaim(
  supabase: SupabaseClient,
  turnId: string,
  claimToken: string,
  reason?: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('ai_conversation_turns')
    .update({
      claim_expires_at: new Date(Date.now() - 1000).toISOString(),
      error_message: reason ?? 'Yield por falta de orçamento na invocação',
      updated_at: new Date().toISOString(),
    })
    .eq('id', turnId)
    .eq('claim_token', claimToken)
    .eq('status', 'processing')
    .is('external_attempt_at', null)

  if (error) {
    console.error('[ai-turns] yieldTurnClaim falhou:', error.message)
    return false
  }
  return true
}
