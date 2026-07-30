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

  try {
    const body = await request.json()
    const { messageText, history = [] } = body

    if (!messageText || typeof messageText !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida.' }, { status: 400 })
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
      { role: 'user', content: messageText },
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

    // 5. Parse Output
    const parsed = parseAIResponse(completionRes.content)

    // Match media details for attached media IDs
    const attachedMedia = parsed.mediaIdsToSend
      .map((id) => mediaItems.find((m) => m.id === id))
      .filter((m): m is AIMediaItem => Boolean(m))

    return NextResponse.json({
      text: parsed.cleanText,
      handoffRequested: parsed.handoffRequested,
      handoffReason: parsed.handoffReason,
      attachedMedia,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro na simulação do assistente.' },
      { status: 500 }
    )
  }
}
