import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/whatsapp/encryption'
import { testOpenAIConnection } from '@/lib/ai-service/openai-client'

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

  try {
    const body = await request.json().catch(() => ({}))
    let apiKey = body.openai_api_key || ''
    const baseUrl = body.openai_api_url || 'https://api.openai.com/v1'
    const model = body.openai_model || 'gpt-4o-mini'

    if (!apiKey) {
      // Tenta recuperar a chave já salva no banco
      const { data: config } = await supabase
        .from('ai_service_config')
        .select('openai_api_key, openai_api_url, openai_model')
        .eq('account_id', profile.account_id)
        .maybeSingle()

      if (!config?.openai_api_key) {
        return NextResponse.json(
          { success: false, message: 'Nenhuma chave de API fornecida nem configurada no banco.' },
          { status: 400 }
        )
      }

      try {
        apiKey = decrypt(config.openai_api_key)
      } catch {
        return NextResponse.json(
          { success: false, message: 'Falha ao descriptografar a chave salva.' },
          { status: 400 }
        )
      }
    }

    const testRes = await testOpenAIConnection(apiKey, baseUrl, model)

    if (testRes.success) {
      return NextResponse.json({ success: true, message: testRes.message })
    } else {
      return NextResponse.json({ success: false, message: testRes.message }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Erro ao processar teste de conexão.' },
      { status: 500 }
    )
  }
}
