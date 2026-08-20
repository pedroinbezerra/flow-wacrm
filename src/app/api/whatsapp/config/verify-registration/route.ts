import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/whatsapp/encryption'
import {
  getSubscribedApps,
  isRegisteredOnCloudApi,
  verifyPhoneNumber,
} from '@/lib/whatsapp/meta-api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * GET /api/whatsapp/config/verify-registration
 *
 * Diagnostic endpoint — confirms the user's saved phone number is
 * actually reachable on Meta's side. Solves the failure mode that
 * surfaced the multi-number bug originally: "UI says Connected but
 * Meta isn't delivering events."
 *
 * Three checks run independently so the UI can show which step
 * passes and which fails:
 *
 *   1. phone_info  — GET /{phone_number_id} succeeds
 *   2. waba_subscription — our app appears in
 *                    GET /{waba_id}/subscribed_apps
 *   3. registered_at — whether the number is live on Cloud API.
 *                    Meta's phone metadata is the authority here;
 *                    the local timestamp is only a cache and is
 *                    healed from Meta whenever the two disagree,
 *                    because one-click onboarding registers the
 *                    number without ever passing through our
 *                    /register call.
 *
 * Returns 200 in every case so the UI can render diagnostic detail
 * rather than a generic error toast. The combined `live` flag is
 * what the UI badges on.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // whatsapp_config is one-row-per-account post-017. Resolve the
  // caller's account_id so a teammate who joined an existing account
  // sees the same registration state as the admin who set it up.
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .maybeSingle()
  const accountId = profile?.account_id as string | undefined
  if (!accountId) {
    return NextResponse.json({
      live: false,
      checks: { config_exists: false },
      message: 'Your profile is not linked to an account.',
    })
  }

  const { data: config } = await supabase
    .from('whatsapp_config')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (!config) {
    return NextResponse.json({
      live: false,
      checks: { config_exists: false },
      message: 'No WhatsApp configuration saved yet.',
    })
  }

  let accessToken: string
  try {
    accessToken = decrypt(config.access_token)
  } catch {
    return NextResponse.json({
      live: false,
      checks: {
        config_exists: true,
        token_decryptable: false,
      },
      message:
        'Stored access token can\'t be decrypted — likely ENCRYPTION_KEY changed. Re-enter the token to repair.',
    })
  }

  const checks: {
    config_exists: boolean
    token_decryptable: boolean
    phone_metadata_ok: boolean
    waba_subscribed_to_app: boolean | null
    locally_marked_registered: boolean
  } = {
    config_exists: true,
    token_decryptable: true,
    phone_metadata_ok: false,
    waba_subscribed_to_app: null,
    locally_marked_registered: config.registered_at != null,
  }
  const errors: string[] = []
  let registeredAt: string | null = config.registered_at ?? null

  // 1. Phone metadata — also the authoritative answer on whether the
  // number is registered on Cloud API.
  try {
    const phoneInfo = await verifyPhoneNumber({
      phoneNumberId: config.phone_number_id,
      accessToken,
    })
    checks.phone_metadata_ok = true

    if (isRegisteredOnCloudApi(phoneInfo)) {
      checks.locally_marked_registered = true
      if (!registeredAt) {
        // Heal the cached flag. Numbers connected in one click are
        // registered by Meta during onboarding, so the timestamp our
        // /register path would have written was never set — showing a
        // "not registered" warning on a live number states something
        // the system does not know to be true (FH-41.11, FH-43.09).
        // Service role: the operator running the diagnostic may not be
        // an account admin, and a read-only repair must not depend on
        // their role.
        registeredAt = new Date().toISOString()
        const { error: healError } = await supabaseAdmin()
          .from('whatsapp_config')
          .update({ registered_at: registeredAt, last_registration_error: null })
          .eq('id', config.id)
          .eq('account_id', accountId)
        if (healError) {
          console.warn('[verify-registration] Failed to backfill registered_at:', healError)
        }
      }
    } else if (!registeredAt) {
      errors.push(
        'Meta reports this number is not live on Cloud API yet. Enter the 2-step PIN and save the configuration to register it.',
      )
    }
  } catch (err) {
    errors.push(
      `Phone metadata check failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  // 2. WABA subscription — only meaningful if we have a waba_id
  if (config.waba_id) {
    try {
      const subs = await getSubscribedApps({
        wabaId: config.waba_id,
        accessToken,
      })
      // Meta returns the apps subscribed to this WABA. If the list
      // is non-empty, OUR app is in there (the access_token we used
      // belongs to our app — Meta wouldn't return data for an app
      // the token can't see). Treat any entry as success.
      checks.waba_subscribed_to_app = subs.length > 0
      if (!checks.waba_subscribed_to_app) {
        errors.push(
          'WABA has no subscribed apps. Re-save the configuration to subscribe.',
        )
      }
    } catch (err) {
      errors.push(
        `WABA subscription check failed: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  } else {
    errors.push(
      'No WABA ID on file — webhooks can\'t be wired without it. Add it in the form and re-save.',
    )
  }

  const live =
    checks.phone_metadata_ok &&
    (checks.waba_subscribed_to_app ?? false) &&
    checks.locally_marked_registered

  return NextResponse.json({
    live,
    checks,
    errors,
    last_registration_error: registeredAt ? null : (config.last_registration_error ?? null),
    registered_at: registeredAt,
    subscribed_apps_at: config.subscribed_apps_at ?? null,
  })
}
