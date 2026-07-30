import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id: conversationId } = await params

  try {
    const body = await request.json()
    const { status } = body

    if (!['ai', 'human'].includes(status)) {
      return NextResponse.json({ error: 'Status deve ser "ai" ou "human".' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {
      ai_handler_status: status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'human') {
      updatePayload.ai_handoff_at = new Date().toISOString()
      updatePayload.ai_handoff_reason = 'Atendimento assumido manualmente pelo operador'
    } else {
      updatePayload.ai_handoff_reason = null
    }

    const { data, error } = await supabase
      .from('conversations')
      .update(updatePayload)
      .eq('id', conversationId)
      .eq('account_id', profile.account_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversation: data })
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }
}
