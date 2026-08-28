import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/whatsapp/encryption'
import { TURN_TIMING_BOUNDS, TURN_TIMING_DEFAULTS } from '@/lib/ai-service/turn-config'

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
    .from('ai_service_config')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({
      config: {
        account_id: accountId,
        enabled: false,
        company_name: '',
        business_segment: '',
        service_goal: '',
        communication_style: '',
        service_rules: '',
        limitations: '',
        handoff_instructions: '',
        openai_api_key_masked: '',
        has_key: false,
        openai_api_url: 'https://api.openai.com/v1',
        openai_model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 500,
        turn_aggregation_enabled: TURN_TIMING_DEFAULTS.aggregationEnabled,
        turn_inactivity_ms: TURN_TIMING_DEFAULTS.inactivityMs,
        turn_max_wait_ms: TURN_TIMING_DEFAULTS.maxWaitMs,
        presence_enabled: TURN_TIMING_DEFAULTS.presenceEnabled,
        presence_threshold_ms: TURN_TIMING_DEFAULTS.presenceThresholdMs,
        progress_updates_enabled: TURN_TIMING_DEFAULTS.progressUpdatesEnabled,
      },
    })
  }

  let hasKey = false
  let maskedKey = ''
  if (data.openai_api_key) {
    hasKey = true
    try {
      const rawKey = decrypt(data.openai_api_key)
      if (rawKey.length > 8) {
        maskedKey = `${rawKey.slice(0, 3)}...${rawKey.slice(-4)}`
      } else {
        maskedKey = '••••••••'
      }
    } catch {
      maskedKey = '••••••••'
    }
  }

  // Omit raw encrypted key in response
  const { openai_api_key, ...safeConfig } = data

  return NextResponse.json({
    config: {
      ...safeConfig,
      openai_api_key_masked: maskedKey,
      has_key: hasKey,
    },
  })
}

export async function PUT(request: Request) {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard

  try {
    const body = await request.json()

    const {
      enabled,
      company_name,
      business_segment,
      service_goal,
      communication_style,
      service_rules,
      limitations,
      handoff_instructions,
      openai_api_key,
      openai_api_url,
      openai_model,
      temperature,
      max_tokens,
      turn_aggregation_enabled,
      turn_inactivity_ms,
      turn_max_wait_ms,
      presence_enabled,
      presence_threshold_ms,
      progress_updates_enabled,
    } = body

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof enabled === 'boolean') updatePayload.enabled = enabled
    if (typeof company_name === 'string') updatePayload.company_name = company_name
    if (typeof business_segment === 'string') updatePayload.business_segment = business_segment
    if (typeof service_goal === 'string') updatePayload.service_goal = service_goal
    if (typeof communication_style === 'string') updatePayload.communication_style = communication_style
    if (typeof service_rules === 'string') updatePayload.service_rules = service_rules
    if (typeof limitations === 'string') updatePayload.limitations = limitations
    if (typeof handoff_instructions === 'string') updatePayload.handoff_instructions = handoff_instructions
    if (typeof openai_api_url === 'string') updatePayload.openai_api_url = openai_api_url
    if (typeof openai_model === 'string') updatePayload.openai_model = openai_model
    if (typeof temperature === 'number') updatePayload.temperature = temperature
    if (typeof max_tokens === 'number') updatePayload.max_tokens = max_tokens

    // Janelas do turno conversacional. Validadas aqui e no CHECK da
    // migration 069: um valor fora de faixa vira 400 explicito em vez de
    // um comportamento temporal estranho que ninguem consegue explicar.
    if (typeof turn_aggregation_enabled === 'boolean') {
      updatePayload.turn_aggregation_enabled = turn_aggregation_enabled
    }
    if (typeof presence_enabled === 'boolean') {
      updatePayload.presence_enabled = presence_enabled
    }
    if (typeof progress_updates_enabled === 'boolean') {
      updatePayload.progress_updates_enabled = progress_updates_enabled
    }

    const rangedFields: [string, unknown, { min: number; max: number }][] = [
      ['turn_inactivity_ms', turn_inactivity_ms, TURN_TIMING_BOUNDS.inactivityMs],
      ['turn_max_wait_ms', turn_max_wait_ms, TURN_TIMING_BOUNDS.maxWaitMs],
      ['presence_threshold_ms', presence_threshold_ms, TURN_TIMING_BOUNDS.presenceThresholdMs],
    ]
    for (const [field, value, bounds] of rangedFields) {
      if (value === undefined) continue
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return NextResponse.json(
          { error: `${field} deve ser um numero em milissegundos.` },
          { status: 400 }
        )
      }
      if (value < bounds.min || value > bounds.max) {
        return NextResponse.json(
          { error: `${field} deve estar entre ${bounds.min} e ${bounds.max} ms.` },
          { status: 400 }
        )
      }
      updatePayload[field] = Math.round(value)
    }



    // Criptografa a API Key caso um novo valor não vazio seja enviado
    if (typeof openai_api_key === 'string' && openai_api_key.trim().length > 0) {
      updatePayload.openai_api_key = encrypt(openai_api_key.trim())
    }

    const { data: existing } = await supabase
      .from('ai_service_config')
      .select('id, turn_inactivity_ms')
      .eq('account_id', accountId)
      .maybeSingle()

    // Um teto menor que a janela de inatividade fecharia todo turno na
    // primeira mensagem — a agregacao existiria no papel e nao no uso.
    // Comparado contra o valor que VAI valer: o enviado agora, ou o que
    // ja estava gravado quando so um dos dois campos veio no payload.
    const effectiveInactivity = Number(
      updatePayload.turn_inactivity_ms ??
        existing?.turn_inactivity_ms ??
        TURN_TIMING_DEFAULTS.inactivityMs
    )
    const effectiveMaxWait = updatePayload.turn_max_wait_ms
    if (typeof effectiveMaxWait === 'number' && effectiveMaxWait < effectiveInactivity) {
      return NextResponse.json(
        { error: 'turn_max_wait_ms nao pode ser menor que turn_inactivity_ms.' },
        { status: 400 }
      )
    }

    let upsertErr: unknown = null
    if (existing) {
      const { error } = await supabase
        .from('ai_service_config')
        .update(updatePayload)
        .eq('account_id', accountId)
      upsertErr = error
    } else {
      const { error } = await supabase
        .from('ai_service_config')
        .insert({
          account_id: accountId,
          ...updatePayload,
        })
      upsertErr = error
    }

    if (upsertErr) {
      return NextResponse.json({ error: (upsertErr as { message?: string }).message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }
}
