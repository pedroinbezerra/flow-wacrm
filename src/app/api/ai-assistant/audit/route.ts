import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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
    // 1. Fetch recent execution logs (last 50)
    const { data: logsData, error: logsErr } = await supabase
      .from('ai_execution_logs')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (logsErr) {
      return NextResponse.json({ error: logsErr.message }, { status: 500 })
    }

    const logs = logsData ?? []

    // 2. Fetch security events (last 20)
    const { data: securityData, error: secErr } = await supabase
      .from('ai_security_events')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (secErr) {
      return NextResponse.json({ error: secErr.message }, { status: 500 })
    }

    const securityEvents = securityData ?? []

    // 3. Compute Aggregated Metrics
    const totalExecutions = logs.length
    let totalTokens = 0
    let totalLatencyMs = 0
    let handoffCount = 0

    logs.forEach((log) => {
      totalTokens += log.total_tokens || 0
      totalLatencyMs += log.execution_time_ms || 0
      if (log.handoff_triggered) handoffCount++
    })

    const avgLatencyMs = totalExecutions > 0 ? Math.round(totalLatencyMs / totalExecutions) : 0
    const handoffRate = totalExecutions > 0 ? Math.round((handoffCount / totalExecutions) * 100) : 0

    return NextResponse.json({
      logs,
      securityEvents,
      metrics: {
        totalExecutions,
        totalTokens,
        avgLatencyMs,
        handoffCount,
        handoffRate,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar dados de auditoria.' },
      { status: 500 }
    )
  }
}
