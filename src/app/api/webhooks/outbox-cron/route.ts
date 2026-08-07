import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/automations/admin-client'

/**
 * Safety Net Cron to drain any pending or failed webhook events from inbound_webhooks.
 * Runs on schedule to guarantee zero message loss even if serverless function crashes.
 */
export async function GET(request: Request) {
  const expected = process.env.AUTOMATION_CRON_SECRET || process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'cron not configured' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.substring(7).trim()
    : ''
  const supplied = request.headers.get('x-cron-secret') || bearerSecret
  const suppliedBuf = Buffer.from(supplied)
  const expectedBuf = Buffer.from(expected)

  if (
    suppliedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(suppliedBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = supabaseAdmin()
  const nowIso = new Date().toISOString()
  const lockUntilIso = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5-minute lease lock

  const { data: pendingEvents, error } = await admin
    .from('inbound_webhooks')
    .select('*')
    .or('status.eq.pending,status.eq.failed')
    .lte('next_retry_at', nowIso)
    .or(`locked_until.is.null,locked_until.lte.${nowIso}`)
    .order('created_at', { ascending: true })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!pendingEvents || pendingEvents.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0
  for (const event of pendingEvents) {
    // Atomic lease lock: set locked_until to prevent concurrent cron pick-up
    const { data: claim } = await admin
      .from('inbound_webhooks')
      .update({
        status: 'processing',
        locked_until: lockUntilIso,
        retry_count: (event.retry_count || 0) + 1,
      })
      .eq('id', event.id)
      .select('id')
      .maybeSingle()

    if (!claim) continue

    try {
      const originUrl = new URL(request.url).origin
      const res = await fetch(`${originUrl}/api/whatsapp/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-outbox-internal-retry': 'true',
        },
        body: JSON.stringify(event.payload),
      })

      if (res.ok) {
        await admin
          .from('inbound_webhooks')
          .update({
            status: 'completed',
            locked_until: null,
            processed_at: new Date().toISOString(),
          })
          .eq('id', event.id)
        processed++
      } else {
        const retryCount = (event.retry_count || 0) + 1
        const backoffMinutes = Math.pow(2, retryCount) // 2m, 4m, 8m...
        const nextRetryIso = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()

        await admin
          .from('inbound_webhooks')
          .update({
            status: retryCount >= 5 ? 'failed' : 'pending',
            locked_until: null,
            next_retry_at: nextRetryIso,
            error_message: `HTTP ${res.status}`,
          })
          .eq('id', event.id)
      }
    } catch (err: any) {
      const retryCount = (event.retry_count || 0) + 1
      const backoffMinutes = Math.pow(2, retryCount)
      const nextRetryIso = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()

      await admin
        .from('inbound_webhooks')
        .update({
          status: retryCount >= 5 ? 'failed' : 'pending',
          locked_until: null,
          next_retry_at: nextRetryIso,
          error_message: err?.message || 'Internal processing error',
        })
        .eq('id', event.id)
    }
  }

  return NextResponse.json({ processed })
}
