import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/whatsapp/encryption'
import { createChatCompletion, ChatMessage } from '@/lib/ai-service/openai-client'
import {
  buildSystemPrompt,
  parseAIResponse,
  AIKnowledgeItem,
  AIMediaItem,
} from '@/lib/ai-service/prompt-builder'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'Sem conta vinculada.' }, { status: 400 })
  }

  const accountId = profile.account_id
  const startTime = Date.now()

  try {
    const body = await request.json()
    const messageText = body.messageText || body.message || body.text || ''
    const history = body.history || []

    if (!messageText || typeof messageText !== 'string' || !messageText.trim()) {
      return NextResponse.json({ error: 'Mensagem inválida ou vazia.' }, { status: 400 })
    }

    // 1. Fetch AI Config
    const { data: config } = await supabase
      .from('ai_service_config')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    if (!config?.openai_api_key) {
      return NextResponse.json(
        { error: 'Chave de API (BYOK) não configurada no assistente.' },
        { status: 400 }
      )
    }

    let apiKey = ''
    try {
      apiKey = decrypt(config.openai_api_key)
    } catch {
      return NextResponse.json(
        { error: 'Falha ao descriptografar a chave de API.' },
        { status: 400 }
      )
    }

    // 2. Fetch Knowledge Base & Media Library
    const { data: knowledgeRows } = await supabase
      .from('ai_knowledge_base')
      .select('id, category, title, content')
      .eq('account_id', accountId)
      .eq('is_active', true)

    const { data: mediaRows } = await supabase
      .from('ai_media_library')
      .select('id, title, media_type, media_url, description')
      .eq('account_id', accountId)
      .eq('is_active', true)

    const knowledgeItems: AIKnowledgeItem[] = knowledgeRows || []
    const mediaItems: AIMediaItem[] = mediaRows || []

    // 3. Build System Prompt & Messages
    const systemPrompt = buildSystemPrompt(config, knowledgeItems, mediaItems)

    const formattedHistory: ChatMessage[] = (history || []).map(
      (h: { sender: 'user' | 'bot'; text: string }) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      })
    )

    const llmMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: messageText.trim() },
    ]

    // 4. Execute Completion
    const completionRes = await createChatCompletion({
      apiKey,
      baseUrl: config.openai_api_url || 'https://api.openai.com/v1',
      model: config.openai_model || 'gpt-4o-mini',
      messages: llmMessages,
      temperature: Number(config.temperature ?? 0.3),
      maxTokens: Number(config.max_tokens ?? 500),
    })

    const latencyMs = Date.now() - startTime

    // 5. Parse Output
    const parsed = parseAIResponse(completionRes.content)

    // Match media details for attached media IDs
    const attachedMedia = parsed.mediaIdsToSend
      .map((id) => mediaItems.find((m) => m.id === id))
      .filter((m): m is AIMediaItem => Boolean(m))

    const promptTokens = completionRes.usage?.prompt_tokens || Math.floor(systemPrompt.length / 4)
    const completionTokens = completionRes.usage?.completion_tokens || Math.floor(parsed.cleanText.length / 4)
    const tokensUsed = completionRes.usage?.total_tokens || (promptTokens + completionTokens)
    const maxTokensConfigured = Number(config.max_tokens ?? 500)
    const sourcesUsed = knowledgeItems.length > 0
      ? knowledgeItems.map((k) => k.title)
      : ['Instruções & Personalidade do Assistente']

    // 6. Record persistent simulation log with config snapshot
    const configSnapshot = {
      company_name: config.company_name || config.assistant_name || 'Atendente IA',
      business_segment: config.business_segment || config.business_niche || null,
      communication_style: config.communication_style || config.tone_of_voice || 'Profissional',
      service_goal: config.service_goal || null,
      service_rules: config.service_rules || null,
      limitations: config.limitations || null,
      handoff_instructions: config.handoff_instructions || null,
      openai_model: config.openai_model || 'gpt-4o-mini',
      temperature: Number(config.temperature ?? 0.3),
      max_tokens: Number(config.max_tokens ?? 500),
      knowledge_items_count: knowledgeItems.length,
      media_items_count: mediaItems.length,
    }

    try {
      await supabase.from('ai_simulation_logs').insert({
        account_id: accountId,
        user_id: user.id,
        inbound_message_text: messageText.trim(),
        outbound_text: parsed.cleanText,
        model_used: config.openai_model || 'gpt-4o-mini',
        temperature: Number(config.temperature ?? 0.3),
        max_tokens: Number(config.max_tokens ?? 500),
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: tokensUsed,
        latency_ms: latencyMs,
        config_snapshot: configSnapshot,
        knowledge_sources: sourcesUsed,
        attached_media: attachedMedia,
        handoff_requested: parsed.handoffRequested,
        handoff_reason: parsed.handoffReason,
      })
    } catch (logErr) {
      console.error('[ai_simulation_logs] Erro ao gravar log de simulação:', logErr)
    }

    return NextResponse.json({
      reply: parsed.cleanText,
      text: parsed.cleanText,
      handoffRequested: parsed.handoffRequested,
      handoffTriggered: parsed.handoffRequested,
      handoffReason: parsed.handoffReason,
      attachedMedia,
      sourcesUsed,
      tokensUsed,
      promptTokens,
      completionTokens,
      maxTokensConfigured,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro na simulação do assistente.' },
      { status: 500 }
    )
  }
}
