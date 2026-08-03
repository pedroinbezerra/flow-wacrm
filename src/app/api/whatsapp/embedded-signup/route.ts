import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  exchangeCodeForAccessToken,
  registerPhoneNumber,
  subscribeWabaToApp,
  verifyPhoneNumber,
} from '@/lib/whatsapp/meta-api'
import { encrypt } from '@/lib/whatsapp/encryption'
import { checkAccountLimit } from '@/lib/plans/limits'

async function resolveAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data?.account_id) return null
  return data.account_id as string
}

let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

/**
 * POST /api/whatsapp/embedded-signup
 *
 * Processes the callback payload from Meta Embedded Signup v4.
 * Exchanges the code for a long-lived access token, subscribes the WABA,
 * registers the phone number, and saves the configuration securely.
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
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, access_token: rawAccessToken, waba_id, phone_number_id, pin } = body

    let accessToken = rawAccessToken

    // Step 1: If an OAuth code was sent, exchange it for a long-lived access token
    if (code) {
      try {
        const exchangeRes = await exchangeCodeForAccessToken({ code })
        accessToken = exchangeRes.accessToken
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to exchange Meta code'
        console.error('[embedded-signup POST] Token exchange failed:', message)
        return NextResponse.json(
          { error: `Token exchange failed: ${message}` },
          { status: 400 }
        )
      }
    }

    if (!accessToken || !phone_number_id) {
      return NextResponse.json(
        { error: 'access_token (or OAuth code) and phone_number_id are required' },
        { status: 400 }
      )
    }

    // Reject if another account has already claimed this phone_number_id
    const { data: claimed, error: claimedError } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('account_id')
      .eq('phone_number_id', phone_number_id)
      .neq('account_id', accountId)
      .maybeSingle()

    if (claimedError) {
      console.error('Error checking phone_number_id ownership:', claimedError)
      return NextResponse.json(
        { error: 'Failed to validate configuration ownership' },
        { status: 500 }
      )
    }

    if (claimed) {
      return NextResponse.json(
        {
          error:
            'This WhatsApp phone number is already linked to another account on this instance.',
        },
        { status: 409 }
      )
    }

    // Step 2: Verify credentials with Meta
    let phoneInfo
    try {
      phoneInfo = await verifyPhoneNumber({
        phoneNumberId: phone_number_id,
        accessToken,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Meta API error'
      console.error('[embedded-signup POST] Meta API verification failed:', message)
      return NextResponse.json(
        { error: `Meta API error: ${message}` },
        { status: 400 }
      )
    }

    // Step 3: Encrypt tokens
    let encryptedAccessToken: string
    try {
      encryptedAccessToken = encrypt(accessToken)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown encryption error'
      console.error('[embedded-signup POST] Token encryption failed:', message)
      return NextResponse.json(
        { error: 'Failed to encrypt access token. Verify ENCRYPTION_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Step 4: Register phone number for inbound webhooks (if PIN provided or optional)
    let registeredAt: string | null = null
    let registrationError: string | null = null
    let registrationSkipped = false

    if (pin && typeof pin === 'string' && pin.trim().length === 6) {
      try {
        await registerPhoneNumber({
          phoneNumberId: phone_number_id,
          accessToken,
          pin: pin.trim(),
        })
        registeredAt = new Date().toISOString()
      } catch (err) {
        registrationError = err instanceof Error ? err.message : 'Registration failed'
        console.error('[embedded-signup POST] Phone registration failed:', registrationError)
      }
    } else {
      registrationSkipped = true
    }

    // Step 5: Subscribe WABA to app
    let subscribedAppsAt: string | null = null
    if (waba_id) {
      try {
        await subscribeWabaToApp({
          wabaId: waba_id,
          accessToken,
        })
        subscribedAppsAt = new Date().toISOString()
      } catch (err) {
        console.warn('[embedded-signup POST] WABA subscribe failed (non-fatal):', err)
      }
    }

    // Step 6: Upsert whatsapp_config row
    const baseRow = {
      phone_number_id,
      waba_id: waba_id || null,
      access_token: encryptedAccessToken,
      status: registrationError ? 'disconnected' : 'connected',
      connected_at: registrationError ? null : new Date().toISOString(),
      registered_at: registrationError ? null : registeredAt,
      subscribed_apps_at: subscribedAppsAt ?? null,
      last_registration_error: registrationError,
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from('whatsapp_config')
      .select('id, is_default')
      .eq('account_id', accountId)
      .eq('phone_number_id', phone_number_id)
      .maybeSingle()

    if (!existing) {
      const limitCheck = await checkAccountLimit(supabase, accountId, 'max_whatsapp_connections')
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.reason || 'Limite de conexões de WhatsApp atingido para a conta.' },
          { status: 403 }
        )
      }
    }

    const { count: existingCount } = await supabase
      .from('whatsapp_config')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId)

    const isDefault = existing ? existing.is_default : (existingCount === 0)
    const label = phoneInfo?.display_phone_number ? `WhatsApp (${phoneInfo.display_phone_number})` : 'Conexão Meta'

    const baseRowWithMeta = {
      ...baseRow,
      label,
      is_default: isDefault,
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('whatsapp_config')
        .update(baseRowWithMeta)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating whatsapp_config:', updateError)
        return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
      }
    } else {
      const { error: insertError } = await supabase
        .from('whatsapp_config')
        .insert({
          account_id: accountId,
          user_id: user.id,
          ...baseRowWithMeta,
        })

      if (insertError) {
        console.error('Error inserting whatsapp_config:', insertError)
        return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      saved: true,
      registered: registeredAt != null,
      registration_skipped: registrationSkipped,
      phone_info: phoneInfo,
    })
  } catch (error) {
    console.error('Error in embedded-signup POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
