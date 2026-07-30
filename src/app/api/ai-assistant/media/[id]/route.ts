import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAccountUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, status: 401, body: { error: 'Unauthorized' } }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.account_id) {
    return { ok: false as const, status: 400, body: { error: 'Sem conta vinculada.' } }
  }

  return { ok: true as const, userId: user.id, accountId: profile.account_id, supabase }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard
  const { id } = await params

  try {
    const body = await request.json()
    const { title, description, is_active } = body

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof title === 'string') updatePayload.title = title.trim()
    if (typeof description === 'string') updatePayload.description = description.trim()
    if (typeof is_active === 'boolean') updatePayload.is_active = is_active

    const { data, error } = await supabase
      .from('ai_media_library')
      .update(updatePayload)
      .eq('id', id)
      .eq('account_id', accountId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard
  const { id } = await params

  const { error } = await supabase
    .from('ai_media_library')
    .delete()
    .eq('id', id)
    .eq('account_id', accountId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
