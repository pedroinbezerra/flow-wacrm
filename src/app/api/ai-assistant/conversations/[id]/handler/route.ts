import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/automations/admin-client'
import { cancelOpenTurns } from '@/lib/ai-service/turn-store'

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

    // Operador assumiu: o que a IA vinha acumulando deixa de ser assunto
    // dela na hora. Sem isto, um turno aberto fecharia depois da tomada
    // de posse e a IA responderia por cima do atendimento humano.
    //
    // Service role porque `ai_turn_cancel_open` atravessa as conversas do
    // tenant; a autorizacao ja foi feita acima, pelo filtro de account_id
    // no UPDATE que retornou `data`.
    if (status === 'human') {
      await cancelOpenTurns(supabaseAdmin(), conversationId, 'human_takeover').catch(
        (turnErr) => {
          console.error('[ai-service] falha ao encerrar turnos abertos:', turnErr)
        }
      )
    }

    return NextResponse.json({ conversation: data })
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }
}
