import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/whatsapp/encryption'

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

  const FALLBACK_MODELS = [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'deepseek-chat',
    'deepseek-coder',
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768',
  ]

  try {
    const body = await request.json().catch(() => ({}))
    let apiKey = body.openai_api_key || ''
    const baseUrl = body.openai_api_url || 'https://api.openai.com/v1'

    if (!apiKey) {
      const { data: config } = await supabase
        .from('ai_service_config')
        .select('openai_api_key, openai_api_url')
        .eq('account_id', profile.account_id)
        .maybeSingle()

      if (config?.openai_api_key) {
        try {
          apiKey = decrypt(config.openai_api_key)
        } catch {
          // fallback
        }
      }
    }

    if (!apiKey) {
      return NextResponse.json({ success: true, models: FALLBACK_MODELS })
    }

    const sanitizedBaseUrl = baseUrl.replace(/\/+$/, '')
    const endpoint = `${sanitizedBaseUrl}/models`

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ success: true, models: FALLBACK_MODELS })
    }

    const data = await response.json()
    if (Array.isArray(data?.data)) {
      const fetchedModels = data.data
        .map((m: { id?: string }) => m.id)
        .filter((id?: string): id is string => Boolean(id))
        .sort((a: string, b: string) => a.localeCompare(b))

      if (fetchedModels.length > 0) {
        return NextResponse.json({ success: true, models: fetchedModels })
      }
    }

    return NextResponse.json({ success: true, models: FALLBACK_MODELS })
  } catch {
    return NextResponse.json({ success: true, models: FALLBACK_MODELS })
  }
}
