import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleDriveAuthUrl } from '@/lib/document-delivery/connectors/google-drive-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    if (!session) {
      return NextResponse.redirect(`${origin}/login?error=unauthorized`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId.trim() === '' || clientId.includes('your-google-client-id')) {
      return NextResponse.redirect(`${origin}/processes/document-delivery/new?error=missing_google_client_id`);
    }

    const redirectUri = `${origin}/api/integrations/google-drive/callback`;

    const state = JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
    });

    const authUrl = getGoogleDriveAuthUrl(redirectUri, state);
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error('Error starting Google Drive OAuth:', err);
    return NextResponse.json({ error: 'Falha ao iniciar autenticação OAuth com Google' }, { status: 500 });
  }
}
