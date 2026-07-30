import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/whatsapp/encryption'
import { sendTextMessage, sendMediaMessage } from '@/lib/whatsapp/meta-api'
import { formatConversationPreview } from '@/lib/conversation-preview'
import {
  createChatCompletion,
  ChatMessage,
} from './openai-client'
import {
  buildSystemPrompt,
  parseAIResponse,
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
}

/**
 * Handles incoming WhatsApp messages via Smart AI Service.
 */
export async function processInboundWithAIService(
  args: ProcessInboundAIArgs
): Promise<ProcessInboundAIResult> {
  const {
    accountId,
    conversationId,
    senderPhone,
    inboundMessageText,
    metaMessageId,
  } = args

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

  // 3. Decrypt BYOK API Key
  let apiKey = ''
  try {
    apiKey = decrypt(config.openai_api_key)
  } catch (err) {
    console.error('[ai-service] Failed to decrypt OpenAI API key:', err)
    return { handled: false, reason: 'key_decryption_failed' }
  }

  // 4. Fetch WhatsApp config for sending outbound messages
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

  // 5. Fetch Active Knowledge Base items
  const { data: knowledgeRows } = await supabase
    .from('ai_knowledge_base')
    .select('id, category, title, content')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const knowledgeItems: AIKnowledgeItem[] = knowledgeRows || []

  // 6. Fetch Active Media Library items
  const { data: mediaRows } = await supabase
    .from('ai_media_library')
    .select('id, title, media_type, media_url, description')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const mediaItems: AIMediaItem[] = mediaRows || []

  // 7. Fetch Conversation History (last 10 messages)
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

  // 8. Build System Prompt & Messages payload
  const systemPrompt = buildSystemPrompt(config, knowledgeItems, mediaItems)
  const llmMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
  ]

  // If the latest message in history isn't equal to inboundMessageText, append it
  if (
    historyMessages.length === 0 ||
    historyMessages[historyMessages.length - 1].content !== inboundMessageText
  ) {
    llmMessages.push({ role: 'user', content: inboundMessageText })
  }

  // 9. Call OpenAI / BYOK LLM Provider
  let llmOutput = ''
  try {
    const result = await createChatCompletion({
      apiKey,
      baseUrl: config.openai_api_url || 'https://api.openai.com/v1',
      model: config.openai_model || 'gpt-4o-mini',
      messages: llmMessages,
      temperature: Number(config.temperature ?? 0.3),
      maxTokens: Number(config.max_tokens ?? 500),
    })
    llmOutput = result.content
  } catch (err) {
    console.error('[ai-service] LLM call failed:', err)
    return { handled: false, reason: 'llm_api_error' }
  }

  if (!llmOutput) {
    return { handled: false, reason: 'empty_llm_response' }
  }

  // 10. Parse LLM Output for text, handoff, and media triggers
  const parsed = parseAIResponse(llmOutput)

  // 11. Send Text Response via WhatsApp API (if cleanText is non-empty)
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

      // Insert message row in DB
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'bot',
        content_type: 'text',
        content_text: parsed.cleanText,
        message_id: sendRes.messageId,
        status: 'delivered',
      })

      // Update conversation last message preview
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

  // 12. Send Media Items if requested by AI
  let mediaSentCount = 0
  if (parsed.mediaIdsToSend.length > 0) {
    for (const mediaId of parsed.mediaIdsToSend) {
      const mediaItem = mediaItems.find((m) => m.id === mediaId)
      if (!mediaItem) continue

      try {
        const mediaSendRes = await sendMediaMessage({
          phoneNumberId: waConfig.phone_number_id,
          accessToken: decryptedAccessToken,
          to: senderPhone,
          kind: mediaItem.media_type,
          link: mediaItem.media_url,
          caption: mediaItem.title,
        })

        // Insert media message row in DB
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
      } catch (mediaErr) {
        console.error('[ai-service] Failed to send media via WhatsApp:', mediaErr)
      }
    }
  }

  // 13. Handle Transfer to Human Handoff if requested
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

    if (updErr) {
      console.error('[ai-service] Error updating handoff status on conversation:', updErr)
    } else {
      handoffTriggered = true
    }
  }

  return {
    handled: true,
    responseSent,
    handoffTriggered,
    mediaSentCount,
  }
}
