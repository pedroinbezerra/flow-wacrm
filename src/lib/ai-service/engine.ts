import { createClient } from '@supabase/supabase-js'
import { assertAccountOperationalAccess } from '@/lib/auth/account'
import { decrypt } from '@/lib/whatsapp/encryption'
import { sendTextMessage, sendMediaMessage } from '@/lib/whatsapp/meta-api'
import { resolveSendableMediaLink } from '@/lib/storage/media-access'
import { formatConversationPreview } from '@/lib/conversation-preview'
import {
  createChatCompletion,
  ChatMessage,
} from './openai-client'
import {
  buildSystemPrompt,
  parseAIResponse,
  detectPromptInjection,
  AIKnowledgeItem,
  AIMediaItem,
} from './prompt-builder'

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
}

export interface ProcessInboundAIResult {
  handled: boolean
  reason?: string
  responseSent?: boolean
  handoffTriggered?: boolean
  mediaSentCount?: number
  securityEventLogged?: boolean
}

/**
 * Handles incoming WhatsApp messages via Smart AI Service.
 * Includes rate-limiting, prompt injection protection, race condition double-check, and audit logging.
 */
export async function processInboundWithAIService(
  args: ProcessInboundAIArgs
): Promise<ProcessInboundAIResult> {
  const startTime = Date.now()
  const {
    accountId,
    conversationId,
    senderPhone,
    inboundMessageText,
    metaMessageId,
  } = args

  try {
    await assertAccountOperationalAccess(accountId, { isWriteOperation: true })
  } catch (accErr: any) {
    console.warn(`[AI Engine] account ${accountId} is restricted/suspended: ${accErr.message}`)
    return { handled: false, reason: 'account_restricted' }
  }

  const supabase = getSupabaseAdmin()

  // 1. Fetch AI Service Configuration
  const { data: config, error: configErr } = await supabase
    .from('ai_service_config')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (configErr) {
    console.error('[ai-service] Error fetching AI service config:', configErr)
    return { handled: false, reason: 'config_fetch_error' }
  }

  if (!config || !config.enabled) {
    return { handled: false, reason: 'ai_service_disabled' }
  }

  if (!config.openai_api_key) {
    console.warn('[ai-service] BYOK API key missing for account:', accountId)
    return { handled: false, reason: 'byok_key_missing' }
  }

  // 2. Fetch Conversation to check handoff status
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id, ai_handler_status, user_id')
    .eq('id', conversationId)
    .single()

  if (convErr || !conv) {
    console.error('[ai-service] Error fetching conversation:', convErr)
    return { handled: false, reason: 'conversation_not_found' }
  }

  if (conv.ai_handler_status === 'human') {
    // Conversation has been taken over by human; AI stays silent.
    return { handled: false, reason: 'human_handler_active' }
  }

  // 3. Check for Prompt Injection / Jailbreak Attacks
  const injectionCheck = detectPromptInjection(inboundMessageText)
  if (injectionCheck.isInjection) {
    console.warn('[ai-service] Prompt injection detected:', injectionCheck.reason)

    // Log Security Event
    await supabase.from('ai_security_events').insert({
      account_id: accountId,
      conversation_id: conversationId,
      event_type: 'prompt_injection_detected',
      severity: 'warning',
      details: `Tentativa de injeção de prompt: ${injectionCheck.reason}. Texto: "${inboundMessageText.slice(0, 100)}"`,
    })

    // Trigger Handoff to Human
    await supabase
      .from('conversations')
      .update({
        ai_handler_status: 'human',
        ai_handoff_at: new Date().toISOString(),
        ai_handoff_reason: `Segurança: ${injectionCheck.reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return { handled: true, handoffTriggered: true, securityEventLogged: true, reason: 'injection_blocked' }
  }

  // 4. Rate Limiting Protection (Max 15 AI messages per conversation per 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: msgCountInLastHour } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'bot')
    .gte('created_at', oneHourAgo)

  if ((msgCountInLastHour ?? 0) >= 15) {
    console.warn('[ai-service] Rate limit exceeded for conversation:', conversationId)

    await supabase.from('ai_security_events').insert({
      account_id: accountId,
      conversation_id: conversationId,
      event_type: 'rate_limit_exceeded',
      severity: 'warning',
      details: 'Limite de 15 respostas da IA por hora excedido nesta conversa. Handoff automático ativado.',
    })

    await supabase
      .from('conversations')
      .update({
        ai_handler_status: 'human',
        ai_handoff_at: new Date().toISOString(),
        ai_handoff_reason: 'Limite de mensagens automáticas por hora excedido',
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return { handled: true, handoffTriggered: true, securityEventLogged: true, reason: 'rate_limit_exceeded' }
  }

  // 5. Decrypt BYOK API Key
  let apiKey = ''
  try {
    apiKey = decrypt(config.openai_api_key)
  } catch (err) {
    console.error('[ai-service] Failed to decrypt OpenAI API key:', err)
    return { handled: false, reason: 'key_decryption_failed' }
  }

  // 6. Fetch WhatsApp config for sending outbound messages
  const { data: waConfig, error: waErr } = await supabase
    .from('whatsapp_config')
    .select('phone_number_id, access_token')
    .eq('account_id', accountId)
    .maybeSingle()

  if (waErr || !waConfig) {
    console.error('[ai-service] WhatsApp config missing for account:', accountId)
    return { handled: false, reason: 'whatsapp_config_missing' }
  }

  const decryptedAccessToken = decrypt(waConfig.access_token)

  // 7. Fetch Active Knowledge Base items
  const { data: knowledgeRows } = await supabase
    .from('ai_knowledge_base')
    .select('id, category, title, content')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const knowledgeItems: AIKnowledgeItem[] = knowledgeRows || []

  // 8. Fetch Active Media Library items
  const { data: mediaRows } = await supabase
    .from('ai_media_library')
    .select('id, title, media_type, media_url, description')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const mediaItems: AIMediaItem[] = mediaRows || []

  // 9. Fetch Conversation History (last 10 messages)
  const { data: msgHistory } = await supabase
    .from('messages')
    .select('sender_type, content_text')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  const historyMessages: ChatMessage[] = ((msgHistory || []) as { sender_type: string; content_text: string }[])
    .reverse()
    .filter((m) => m.content_text)
    .map((m) => ({
      role: m.sender_type === 'customer' ? 'user' : 'assistant',
      content: m.content_text || '',
    }))

  // 10. Build System Prompt & Messages payload
  const systemPrompt = buildSystemPrompt(config, knowledgeItems, mediaItems)
  const llmMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
  ]

  if (
    historyMessages.length === 0 ||
    historyMessages[historyMessages.length - 1].content !== inboundMessageText
  ) {
    llmMessages.push({ role: 'user', content: inboundMessageText })
  }

  // 11. Call OpenAI / BYOK LLM Provider
  let llmOutput = ''
  let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  const modelUsed = config.openai_model || 'gpt-4o-mini'

  try {
    const result = await createChatCompletion({
      apiKey,
      baseUrl: config.openai_api_url || 'https://api.openai.com/v1',
      model: modelUsed,
      messages: llmMessages,
      temperature: Number(config.temperature ?? 0.3),
      maxTokens: Number(config.max_tokens ?? 500),
    })
    llmOutput = result.content
    if (result.usage) {
      usage = result.usage
    }
  } catch (err) {
    console.error('[ai-service] LLM call failed:', err)
    return { handled: false, reason: 'llm_api_error' }
  }

  if (!llmOutput) {
    return { handled: false, reason: 'empty_llm_response' }
  }

  // 12. DOUBLE-CHECK RACE CONDITION: Re-query conversation status before sending outbound message
  const { data: doubleCheckConv } = await supabase
    .from('conversations')
    .select('ai_handler_status')
    .eq('id', conversationId)
    .single()

  if (doubleCheckConv?.ai_handler_status === 'human') {
    console.warn('[ai-service] Race condition prevented: Operator assumed conversation during LLM completion.')
    return { handled: false, reason: 'human_takeover_during_llm_completion' }
  }

  // 13. Parse LLM Output for text, handoff, and media triggers
  const parsed = parseAIResponse(llmOutput)

  // 14. Send Text Response via WhatsApp API
  let responseSent = false
  if (parsed.cleanText) {
    try {
      const sendRes = await sendTextMessage({
        phoneNumberId: waConfig.phone_number_id,
        accessToken: decryptedAccessToken,
        to: senderPhone,
        text: parsed.cleanText,
        contextMessageId: metaMessageId,
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
      console.error('[ai-service] Failed to send text message via WhatsApp:', sendErr)
    }
  }

  // 15. Send Media Items if requested by AI
  let mediaSentCount = 0
  const sentMediaIds: string[] = []
  if (parsed.mediaIdsToSend.length > 0) {
    for (const mediaId of parsed.mediaIdsToSend) {
      const mediaItem = mediaItems.find((m) => m.id === mediaId)
      if (!mediaItem) continue

      try {
        const sendableLink = await resolveSendableMediaLink(mediaItem.media_url)
        const mediaSendRes = await sendMediaMessage({
          phoneNumberId: waConfig.phone_number_id,
          accessToken: decryptedAccessToken,
          to: senderPhone,
          kind: mediaItem.media_type,
          link: sendableLink,
          caption: mediaItem.title,
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
        console.error('[ai-service] Failed to send media via WhatsApp:', mediaErr)
      }
    }
  }

  // 16. Handle Transfer to Human Handoff if requested
  let handoffTriggered = false
  if (parsed.handoffRequested) {
    const reason = parsed.handoffReason || 'Transferência solicitada pela IA'

    const { error: updErr } = await supabase
      .from('conversations')
      .update({
        ai_handler_status: 'human',
        ai_handoff_at: new Date().toISOString(),
        ai_handoff_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    if (!updErr) {
      handoffTriggered = true
    }
  }

  // 17. AUDIT LOGGING: Insert execution log into `ai_execution_logs`
  const executionTimeMs = Date.now() - startTime
  const usedKnowledgeIds = knowledgeItems.map((k) => k.id)

  await supabase.from('ai_execution_logs').insert({
    account_id: accountId,
    conversation_id: conversationId,
    inbound_message_text: inboundMessageText,
    outbound_text: parsed.cleanText,
    model_used: modelUsed,
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
    execution_time_ms: executionTimeMs,
    knowledge_item_ids: usedKnowledgeIds,
    media_item_ids: sentMediaIds,
    handoff_triggered: handoffTriggered,
    handoff_reason: parsed.handoffReason || null,
  })

  return {
    handled: true,
    responseSent,
    handoffTriggered,
    mediaSentCount,
  }
}
