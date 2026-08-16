import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)))
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    // 1. Fetch paginated execution logs with exact count
    const { data: logsData, error: logsErr, count } = await supabase
      .from('ai_execution_logs')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (logsErr) {
      return NextResponse.json({ error: logsErr.message }, { status: 500 })
    }

    const logs = logsData ?? []
    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    // 2. Fetch security events
    const { data: securityData, error: secErr } = await supabase
      .from('ai_security_events')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (secErr) {
      return NextResponse.json({ error: secErr.message }, { status: 500 })
    }

    const securityEvents = securityData ?? []

    // 3. Correlate security events with execution logs & format high-level security flags
    const logsWithSecurity = logs.map((log) => {
      const matchingEvent = securityEvents.find(
        (evt) => evt.conversation_id && evt.conversation_id === log.conversation_id
      )

      let securityLabel = null
      let highLevelDesc = null

      if (matchingEvent) {
        if (matchingEvent.event_type === 'prompt_injection_detected') {
          securityLabel = 'Tentativa de Injeção de Instruções'
          highLevelDesc = 'Identificado padrão de texto tentando ignorar as regras de atendimento da empresa. O sistema conteve a tentativa com segurança.'
        } else if (matchingEvent.event_type === 'jailbreak_attempt') {
          securityLabel = 'Tentativa de Quebra de Segurança'
          highLevelDesc = 'Identificada tentativa de personificação ou desvio das diretrizes operacionais. O atendimento foi preservado dentro dos limites.'
        } else if (matchingEvent.event_type === 'rate_limit_exceeded') {
          securityLabel = 'Limite Operacional Excedido'
          highLevelDesc = 'A conversa ultrapassou o volume máximo de respostas por hora permitido para proteção do canal. Hand-off humano ativado.'
        } else if (matchingEvent.event_type === 'unauthorized_action_attempt') {
          securityLabel = 'Acesso Não Autorizado'
          highLevelDesc = 'Tentativa de obter informações restritas ou realizar ação fora do escopo do assistente.'
        } else {
          securityLabel = 'Alerta de Segurança'
          highLevelDesc = 'Evento de segurança registrado e prevenido pela camada de governança do sistema.'
        }
      }

      return {
        ...log,
        security_flag: matchingEvent
          ? {
              severity: matchingEvent.severity || 'warning',
              label: securityLabel,
              description: highLevelDesc,
            }
          : null,
      }
    })

    // 4. Compute Aggregated Metrics
    const totalExecutions = total
    let pageTokens = 0
    let pageLatencyMs = 0
    let pageHandoffCount = 0

    logs.forEach((log) => {
      pageTokens += log.total_tokens || 0
      pageLatencyMs += log.execution_time_ms || 0
      if (log.handoff_triggered) pageHandoffCount++
    })

    const avgLatencyMs = logs.length > 0 ? Math.round(pageLatencyMs / logs.length) : 0
    const handoffRate = logs.length > 0 ? Math.round((pageHandoffCount / logs.length) * 100) : 0

    return NextResponse.json({
      logs: logsWithSecurity,
      securityEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      metrics: {
        totalExecutions,
        totalTokens: pageTokens,
        avgLatencyMs,
        handoffCount: pageHandoffCount,
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
