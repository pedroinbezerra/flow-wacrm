import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens } from '@/lib/document-delivery/connectors/google-drive-client';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;
  const redirectUri = `${origin}/api/integrations/google-drive/callback`;

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(`${origin}/login?error=unauthorized`);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam || !code) {
      console.error('Google OAuth error or denied access:', errorParam);
      return NextResponse.redirect(`${origin}/processes/document-delivery/new?error=oauth_denied`);
    }

    // Get user profile for account_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.redirect(`${origin}/processes/document-delivery/new?error=no_account`);
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Upsert into google_drive_integrations
    const { error: upsertErr } = await supabase.from('google_drive_integrations').upsert(
      {
        account_id: profile.account_id,
        user_id: session.user.id,
        account_email: tokens.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: tokens.expires_at,
        scope: tokens.scope || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id' }
    );

    if (upsertErr) {
      console.error('Error saving Google Drive tokens:', upsertErr);
      return NextResponse.redirect(`${origin}/processes/document-delivery/new?error=storage_failed`);
    }

    return NextResponse.redirect(`${origin}/processes/document-delivery/new?connected=google_drive`);
  } catch (err: any) {
    console.error('Error in Google Drive callback:', err);
    return NextResponse.redirect(`${origin}/processes/document-delivery/new?error=callback_exception`);
  }
}
