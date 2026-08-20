import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  META_API_BASE,
  discoverWhatsAppAccounts,
  exchangeCodeForAccessToken,
  isRegisteredOnCloudApi,
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

    // Step 2: If phone_number_id was not provided by the frontend (e.g. sessionInfoListener
    // did not fire), auto-discover WABAs and phone numbers using the access token.
    // We use the App Access Token (app_id|app_secret) for debug_token, which is more
    // reliable than self-debugging with Embedded Signup user tokens.
    let resolvedPhoneNumberId = phone_number_id
    let resolvedWabaId = waba_id

    if (!resolvedPhoneNumberId && accessToken) {
      const appId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID
      const appSecret = process.env.META_APP_SECRET
      const metaBase = META_API_BASE

      // Strategy A: Use debug_token with App Access Token to find WABA IDs from granular scopes
      if (appId && appSecret) {
        try {
          const appAccessToken = `${appId}|${appSecret}`
          const debugUrl = `${metaBase}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`
          const debugRes = await fetch(debugUrl)

          if (debugRes.ok) {
            const debugData = await debugRes.json() as {
              data?: {
                granular_scopes?: Array<{ scope: string; target_ids?: string[] }>
              }
            }
            console.log('[embedded-signup] debug_token granular_scopes:', JSON.stringify(debugData.data?.granular_scopes))

            const scopes = debugData.data?.granular_scopes || []
            const wabaScope = scopes.find(
              (s) => s.scope === 'whatsapp_business_management' || s.scope === 'whatsapp_business_messaging'
            )
            const wabaIds = wabaScope?.target_ids || []

            for (const wabaId of wabaIds) {
              if (resolvedPhoneNumberId) break
              resolvedWabaId = resolvedWabaId || wabaId
              try {
                const phonesUrl = `${metaBase}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name`
                const phonesRes = await fetch(phonesUrl, {
                  headers: { Authorization: `Bearer ${accessToken}` },
                })
                if (phonesRes.ok) {
                  const phonesData = await phonesRes.json() as {
                    data?: Array<{ id: string; display_phone_number?: string; verified_name?: string }>
                  }
                  console.log(`[embedded-signup] WABA ${wabaId} phone_numbers:`, JSON.stringify(phonesData.data))
                  if (phonesData.data && phonesData.data.length > 0) {
                    resolvedPhoneNumberId = phonesData.data[0].id
                  }
                }
              } catch (phoneErr) {
                console.warn(`[embedded-signup] Failed to fetch phones for WABA ${wabaId}:`, phoneErr)
              }
            }
          } else {
            console.warn('[embedded-signup] debug_token failed:', debugRes.status, await debugRes.text())
          }
        } catch (debugErr) {
          console.warn('[embedded-signup] debug_token approach failed:', debugErr)
        }
      }

      // Strategy B: Fallback to discoverWhatsAppAccounts if debug_token didn't yield results
      if (!resolvedPhoneNumberId) {
        try {
          const discovered = await discoverWhatsAppAccounts({ accessToken })
          console.log('[embedded-signup] discoverWhatsAppAccounts result:', JSON.stringify(discovered.map(w => ({ id: w.id, phones: w.phone_numbers.length }))))
          if (discovered.length > 0) {
            const firstWaba = discovered[0]
            resolvedWabaId = resolvedWabaId || firstWaba.id
            if (firstWaba.phone_numbers && firstWaba.phone_numbers.length > 0) {
              resolvedPhoneNumberId = firstWaba.phone_numbers[0].id
            }
          }
        } catch (discoverErr) {
          console.warn('[embedded-signup] discoverWhatsAppAccounts fallback failed:', discoverErr)
        }
      }

      console.log('[embedded-signup] Resolved phone_number_id:', resolvedPhoneNumberId, 'waba_id:', resolvedWabaId)
    }

    if (!accessToken || !resolvedPhoneNumberId) {
      return NextResponse.json(
        { error: 'access_token (or OAuth code) and phone_number_id are required' },
        { status: 400 }
      )
    }

    // Reject if another account has already claimed this phone_number_id
    const { data: claimed, error: claimedError } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('account_id')
      .eq('phone_number_id', resolvedPhoneNumberId)
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

    // Verify credentials with Meta
    let phoneInfo
    try {
      phoneInfo = await verifyPhoneNumber({
        phoneNumberId: resolvedPhoneNumberId,
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
          phoneNumberId: resolvedPhoneNumberId,
          accessToken,
          pin: pin.trim(),
        })
        registeredAt = new Date().toISOString()
      } catch (err) {
        registrationError = err instanceof Error ? err.message : 'Registration failed'
        console.error('[embedded-signup POST] Phone registration failed:', registrationError)
      }
    } else if (isRegisteredOnCloudApi(phoneInfo)) {
      // One-click onboarding never asks for a PIN: Meta registers the
      // number itself during Embedded Signup. Trust Meta's own phone
      // metadata rather than recording "never registered" on a number
      // that is already live — a stale flag would show the operator a
      // warning that contradicts a working connection (FH-41.11).
      registeredAt = new Date().toISOString()
    } else {
      registrationSkipped = true
    }

    // Subscribe WABA to app
    let subscribedAppsAt: string | null = null
    if (resolvedWabaId) {
      try {
        await subscribeWabaToApp({
          wabaId: resolvedWabaId,
          accessToken,
        })
        subscribedAppsAt = new Date().toISOString()
      } catch (err) {
        console.warn('[embedded-signup POST] WABA subscribe failed (non-fatal):', err)
      }
    }

    // Upsert whatsapp_config row
    const baseRow = {
      phone_number_id: resolvedPhoneNumberId,
      waba_id: resolvedWabaId || null,
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
      .eq('phone_number_id', resolvedPhoneNumberId)
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
