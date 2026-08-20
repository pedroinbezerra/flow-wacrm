import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  registerPhoneNumber,
  subscribeWabaToApp,
  verifyPhoneNumber,
} from '@/lib/whatsapp/meta-api'
import { encrypt, decrypt } from '@/lib/whatsapp/encryption'
import { tApiError } from '@/lib/i18n/api-errors'
import { checkAccountLimit } from '@/lib/plans/limits'

/**
 * Resolve the caller's account_id from their profile.
 */
async function resolveAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data?.account_id) return null
  return data.account_id as string
}

// Lazy-initialised service-role client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      )
    }
    _adminClient = createAdminClient(url, key, {
      auth: { persistSession: false },
    })
  }
  return _adminClient
}

/**
 * GET /api/whatsapp/config
 * Returns all WhatsApp configurations for the caller's account + limit check info.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          connected: false,
          reason: 'unauthorized',
          message: 'User is not authenticated.',
        },
        { status: 401 },
      )
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json(
        {
          connected: false,
          reason: 'no_account',
          message: 'Your profile is not linked to an account.',
        },
        { status: 200 },
      )
    }

    // Fetch all WhatsApp configs for this account
    const { data: configs, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (configError) {
      console.error('Error fetching whatsapp_config list:', configError)
      return NextResponse.json(
        { connected: false, reason: 'db_error', message: 'Failed to fetch configurations' },
        { status: 200 }
      )
    }

    // Check account plan limit for WhatsApp connections
    const limitCheck = await checkAccountLimit(supabase, accountId, 'max_whatsapp_connections')

    const configList = (configs || []).map((cfg) => ({
      ...cfg,
      access_token: MASKED_TOKEN,
    }))

    const defaultConfig = configs && configs.length > 0 ? configs[0] : null

    return NextResponse.json({
      connected: (configs || []).length > 0,
      configs: configList,
      primary_config: defaultConfig,
      limit_info: {
        allowed: limitCheck.allowed,
        current: limitCheck.current ?? configs?.length ?? 0,
        max: limitCheck.limit ?? 1,
        reason: limitCheck.reason,
      },
    })
  } catch (error) {
    console.error('Error in WhatsApp config GET:', error)
    return NextResponse.json(
      { connected: false, reason: 'unknown', message: 'Internal server error' },
      { status: 500 },
    )
  }
}

const MASKED_TOKEN = '••••••••••••••••'

/**
 * POST /api/whatsapp/config
 *
 * Saves or updates the WhatsApp config for the authenticated user.
 * Verifies credentials with Meta first, then encrypts and stores.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json(
        { error: 'Your profile is not linked to an account.' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { phone_number_id, waba_id, access_token, verify_token, pin } = body

    if (!phone_number_id) {
      return NextResponse.json(
        { error: 'phone_number_id is required' },
        { status: 400 }
      )
    }

    // Common setup mistake: filling WABA ID with the Phone Number ID.
    // The IDs can look similar, but are different resources in Meta.
    if (waba_id && waba_id === phone_number_id) {
      return NextResponse.json(
        {
          error: tApiError(request, 'whatsapp.wabaEqualsPhoneNumber'),
        },
        { status: 400 }
      )
    }

    if (pin !== undefined && pin !== null && pin !== '') {
      if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
        return NextResponse.json(
          { error: 'PIN must be exactly 6 digits.' },
          { status: 400 }
        )
      }
    }

    // Reject if another account has already claimed this phone_number_id.
    // flowhub is single-tenant-per-WhatsApp-number — letting two accounts
    // bind the same number causes the webhook's `.single()` lookup to
    // throw PGRST116 ("multiple rows"), silently dropping every
    // inbound message. See issue #136. Post-multi-user we key on
    // account_id (not user_id) since teammates inside the same account
    // all share one config; the conflict is between accounts.
    const { data: claimed, error: claimedError } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('account_id')
      .eq('phone_number_id', phone_number_id)
      .neq('account_id', accountId)
      .maybeSingle()

    if (claimedError) {
      console.error('Error checking phone_number_id ownership:', claimedError)
      return NextResponse.json(
        { error: 'Failed to validate configuration' },
        { status: 500 }
      )
    }

    if (claimed) {
      return NextResponse.json(
        {
          error:
            'This WhatsApp phone number is already linked to another account on this instance. Each phone number can only be connected to one flowhub user.',
        },
        { status: 409 }
      )
    }

    // Look up any pre-existing row for this account and phone_number_id
    const { data: existing } = await supabase
      .from('whatsapp_config')
      .select('id, registered_at, phone_number_id, is_default, access_token, verify_token')
      .eq('account_id', accountId)
      .eq('phone_number_id', phone_number_id)
      .maybeSingle()

    // Resolve active access token: use provided access_token, or fall back to decrypting the existing one
    let activeAccessToken = access_token
    const isMasked = activeAccessToken === '••••••••••••••••' || activeAccessToken === 'MASKED_TOKEN'
    if (!activeAccessToken || isMasked) {
      if (existing?.access_token) {
        try {
          activeAccessToken = decrypt(existing.access_token)
        } catch (decryptErr) {
          console.error('Failed to decrypt existing access token:', decryptErr)
          return NextResponse.json(
            { error: 'Failed to retrieve existing credentials. Please provide access_token again.' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'access_token and phone_number_id are required' },
          { status: 400 }
        )
      }
    }

    // Verify credentials with Meta BEFORE saving
    let phoneInfo
    try {
      phoneInfo = await verifyPhoneNumber({
        phoneNumberId: phone_number_id,
        accessToken: activeAccessToken,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Meta API error'
      console.error('Meta API verification failed during save:', message)
      return NextResponse.json(
        { error: `Meta API error: ${message}` },
        { status: 400 }
      )
    }

    // Encrypt sensitive tokens before storing
    let encryptedAccessToken: string
    let encryptedVerifyToken: string | null
    try {
      encryptedAccessToken = encrypt(activeAccessToken)
      // Sem campo no payload, preserva o que ja esta gravado: salvar a
      // conexao por outro motivo nao pode apagar um segredo em silencio.
      encryptedVerifyToken = verify_token
        ? encrypt(verify_token)
        : ((existing?.verify_token as string | null) ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown encryption error'
      console.error('Encryption failed:', message)
      return NextResponse.json(
        {
          error:
            'Failed to encrypt token. Check that ENCRYPTION_KEY is a valid 64-character hex string in your environment variables.',
        },
        { status: 500 }
      )
    }

    // If this is a NEW connection, check the account's plan limit for WhatsApp connections
    if (!existing) {
      const limitCheck = await checkAccountLimit(supabase, accountId, 'max_whatsapp_connections')
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.reason || 'Limite de conexões de WhatsApp atingido para o plano da empresa. Faça upgrade para conectar mais números.' },
          { status: 403 }
        )
      }
    }

    const { count: existingCount } = await supabase
      .from('whatsapp_config')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId)

    const isDefault = existing ? existing.is_default : (existingCount === 0 || body?.is_default === true)

    const sameNumber =
      existing?.phone_number_id === phone_number_id &&
      existing?.registered_at != null

    let registeredAt: string | null = existing?.registered_at ?? null
    let registrationError: string | null = null
    let registrationSkipped = false

    const needsRegistration = !sameNumber || (typeof pin === 'string' && pin.length > 0)
    if (needsRegistration) {
      if (!pin) {
        registrationSkipped = true
      } else {
        try {
          await registerPhoneNumber({
            phoneNumberId: phone_number_id,
            accessToken: activeAccessToken,
            pin,
          })
          registeredAt = new Date().toISOString()
        } catch (err) {
          registrationError =
            err instanceof Error ? err.message : 'Unknown Meta API error'
          console.error('Phone number /register failed:', registrationError)
        }
      }
    }

    let subscribedAppsAt: string | null = null
    if (waba_id) {
      try {
        await subscribeWabaToApp({
          wabaId: waba_id,
          accessToken: activeAccessToken,
        })
        subscribedAppsAt = new Date().toISOString()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.warn('WABA subscribed_apps failed (non-fatal):', message)
      }
    }

    const label = body?.label ? String(body.label).trim() : (phoneInfo?.display_phone_number ? `WhatsApp (${phoneInfo.display_phone_number})` : 'Conexão API WhatsApp')

    const baseRow = {
      phone_number_id,
      waba_id: waba_id || null,
      access_token: encryptedAccessToken,
      verify_token: encryptedVerifyToken,
      status: registrationError ? 'disconnected' : 'connected',
      connected_at: registrationError ? null : new Date().toISOString(),
      registered_at: registrationError ? null : registeredAt,
      subscribed_apps_at: subscribedAppsAt ?? null,
      last_registration_error: registrationError,
      label,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('whatsapp_config')
        .update(baseRow)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating whatsapp_config:', updateError)
        return NextResponse.json(
          { error: 'Failed to update configuration' },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabase
        .from('whatsapp_config')
        .insert({
          account_id: accountId,
          user_id: user.id,
          ...baseRow,
        })

      if (insertError) {
        console.error('Error inserting whatsapp_config:', insertError)
        return NextResponse.json(
          { error: 'Failed to save configuration' },
          { status: 500 }
        )
      }
    }

    if (registrationError) {
      return NextResponse.json({
        success: false,
        saved: true,
        registered: false,
        registration_error: registrationError,
        phone_info: phoneInfo,
      })
    }

    return NextResponse.json({
      success: true,
      saved: true,
      registered: registeredAt != null,
      registration_skipped: registrationSkipped,
      phone_info: phoneInfo,
    })
  } catch (error) {
    console.error('Error in WhatsApp config POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/whatsapp/config
 * Updates label or sets a connection as primary (is_default).
 */
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json({ error: 'No account linked' }, { status: 400 })
    }

    const body = await req.json()
    const { config_id, phone_number_id, action, label } = body || {}

    const targetQuery = supabase.from('whatsapp_config').select('id').eq('account_id', accountId)
    if (config_id) {
      targetQuery.eq('id', config_id)
    } else if (phone_number_id) {
      targetQuery.eq('phone_number_id', phone_number_id)
    }

    const { data: target } = await targetQuery.maybeSingle()
    if (!target) {
      return NextResponse.json({ error: 'Conexão não encontrada.' }, { status: 404 })
    }

    if (action === 'set_default') {
      // Unset default on all numbers of account
      await supabase
        .from('whatsapp_config')
        .update({ is_default: false })
        .eq('account_id', accountId)

      // Set default on target
      await supabase
        .from('whatsapp_config')
        .update({ is_default: true })
        .eq('id', target.id)

      return NextResponse.json({ success: true, message: 'Número definido como principal com sucesso!' })
    }

    if (action === 'update_label' && label) {
      await supabase
        .from('whatsapp_config')
        .update({ label: String(label).trim() })
        .eq('id', target.id)

      return NextResponse.json({ success: true, message: 'Rótulo atualizado com sucesso!' })
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
  } catch (err) {
    console.error('Error in WhatsApp config PATCH:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/whatsapp/config
 * Removes a specific WhatsApp configuration row (or default row if not specified).
 */
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json({ error: 'No account linked' }, { status: 400 })
    }

    const url = new URL(req.url)
    const configId = url.searchParams.get('id')
    const phoneNumberId = url.searchParams.get('phone_number_id')

    let deleteQuery = supabase.from('whatsapp_config').delete().eq('account_id', accountId)

    if (configId) {
      deleteQuery = deleteQuery.eq('id', configId)
    } else if (phoneNumberId) {
      deleteQuery = deleteQuery.eq('phone_number_id', phoneNumberId)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      console.error('Error deleting whatsapp_config:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      )
    }

    // Check if any remaining configs exist and make sure at least one is default
    const { data: remaining } = await supabase
      .from('whatsapp_config')
      .select('id, is_default')
      .eq('account_id', accountId)
      .order('created_at', { ascending: true })

    if (remaining && remaining.length > 0) {
      const hasDefault = remaining.some((r) => r.is_default)
      if (!hasDefault) {
        await supabase
          .from('whatsapp_config')
          .update({ is_default: true })
          .eq('id', remaining[0].id)
      }
    }

    return NextResponse.json({ success: true, message: 'Conexão de WhatsApp removida com sucesso.' })
  } catch (error) {
    console.error('Error in WhatsApp config DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
