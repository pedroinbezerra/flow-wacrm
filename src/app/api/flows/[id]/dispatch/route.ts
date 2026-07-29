import { NextResponse } from 'next/server'

import { getCurrentAccount, toErrorResponse } from '@/lib/auth/account'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { dispatchManualFlowStart } from '@/lib/flows/engine'

/**
 * POST /api/flows/[id]/dispatch
 *
 * Manual start path for flows with trigger_type='manual'.
 *
 * Body:
 *   {
 *     contact_id: string,
 *     conversation_id?: string
 *   }
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  let accountId: string
  let userId: string
  try {
    const ctx = await getCurrentAccount()
    accountId = ctx.accountId
    userId = ctx.userId
  } catch (err) {
    return toErrorResponse(err)
  }

  const body = (await request.json().catch(() => null)) as
    | { contact_id?: string; conversation_id?: string | null }
    | null
  if (!body?.contact_id) {
    return NextResponse.json(
      { error: 'contact_id is required' },
      { status: 400 },
    )
  }

  const admin = supabaseAdmin()

  const { data: flow } = await admin
    .from('flows')
    .select('id, trigger_type, status, entry_node_id, account_id')
    .eq('id', id)
    .eq('account_id', accountId)
    .maybeSingle()
  if (!flow) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (flow.trigger_type !== 'manual') {
    return NextResponse.json(
      { error: 'Only manual-trigger flows can be dispatched manually.' },
      { status: 409 },
    )
  }
  if (flow.status !== 'active') {
    return NextResponse.json(
      { error: 'Flow must be active before manual dispatch.' },
      { status: 409 },
    )
  }
  if (!flow.entry_node_id) {
    return NextResponse.json(
      { error: 'Flow has no entry node configured.' },
      { status: 422 },
    )
  }

  const [{ data: contact }, { data: activeRun }] =
    await Promise.all([
      admin
        .from('contacts')
        .select('id')
        .eq('id', body.contact_id)
        .eq('account_id', accountId)
        .maybeSingle(),
      admin
        .from('flow_runs')
        .select('id')
        .eq('account_id', accountId)
        .eq('contact_id', body.contact_id)
        .eq('status', 'active')
        .maybeSingle(),
    ])

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  }
  if (activeRun?.id) {
    return NextResponse.json(
      {
        error: 'This contact already has an active flow run.',
        flow_run_id: activeRun.id,
      },
      { status: 409 },
    )
  }

  let conversationId = body.conversation_id ?? null
  if (conversationId) {
    const { data: conversation } = await admin
      .from('conversations')
      .select('id, contact_id')
      .eq('id', conversationId)
      .eq('account_id', accountId)
      .maybeSingle()
    if (!conversation || conversation.contact_id !== body.contact_id) {
      return NextResponse.json(
        { error: 'Conversation does not belong to the informed contact.' },
        { status: 400 },
      )
    }
  } else {
    const { data: existingConversations } = await admin
      .from('conversations')
      .select('id')
      .eq('account_id', accountId)
      .eq('contact_id', body.contact_id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(1)

    conversationId = (existingConversations?.[0] as { id: string } | undefined)?.id ?? null
    if (!conversationId) {
      const { data: created, error: createErr } = await admin
        .from('conversations')
        .insert({
          user_id: userId,
          account_id: accountId,
          contact_id: body.contact_id,
          status: 'open',
          unread_count: 0,
        })
        .select('id')
        .single()
      if (createErr || !created) {
        return NextResponse.json(
          { error: createErr?.message ?? 'Failed to open conversation.' },
          { status: 500 },
        )
      }
      conversationId = created.id as string
    }
  }

  const result = await dispatchManualFlowStart({
    flowId: id,
    accountId,
    userId,
    contactId: body.contact_id,
    conversationId,
  })

  if (!result.consumed) {
    return NextResponse.json(
      { error: 'Unable to start flow run for this contact.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    flow_run_id: result.flow_run_id ?? null,
    outcome: result.outcome,
  })
}
