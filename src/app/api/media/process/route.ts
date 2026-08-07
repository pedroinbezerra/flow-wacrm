import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { drainPendingMediaQueue } from '@/lib/media/media-processor'

/**
 * Domain-neutral background worker endpoint to process pending media items
 * and recover expired worker leases. Protected via CRON_SECRET / AUTOMATION_CRON_SECRET.
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

  try {
    const { processed, recovered } = await drainPendingMediaQueue(20)
    return NextResponse.json({
      success: true,
      processed,
      recovered,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[media-process-route] Error processing queue:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to process media queue' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
