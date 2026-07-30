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

export async function GET() {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard

  const { data, error } = await supabase
    .from('ai_knowledge_base')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard

  try {
    const body = await request.json()
    const { category, title, content, is_active } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título e Conteúdo são obrigatórios.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ai_knowledge_base')
      .insert({
        account_id: accountId,
        category: category || 'Geral',
        title: title.trim(),
        content: content.trim(),
        is_active: typeof is_active === 'boolean' ? is_active : true,
      })
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
