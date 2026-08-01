import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { discoverWhatsAppAccounts } from '@/lib/whatsapp/meta-api'

/**
 * POST /api/whatsapp/config/discover
 *
 * Discovers available WhatsApp Business Accounts (WABAs) and Phone Numbers
 * associated with a user-provided access token.
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

    const body = await request.json()
    const { access_token } = body

    if (!access_token || typeof access_token !== 'string' || !access_token.trim()) {
      return NextResponse.json(
        { error: 'access_token is required for auto-discovery' },
        { status: 400 }
      )
    }

    const accounts = await discoverWhatsAppAccounts({
      accessToken: access_token.trim(),
    })

    return NextResponse.json({
      success: true,
      accounts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to discover accounts'
    console.error('Error in whatsapp/config/discover POST:', message)
    return NextResponse.json(
      { error: `Meta API auto-discovery failed: ${message}` },
      { status: 400 }
    )
  }
}
