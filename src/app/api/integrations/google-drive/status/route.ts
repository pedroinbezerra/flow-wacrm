import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ connected: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ connected: false });
    }

    const { data: integration } = await supabase
      .from('google_drive_integrations')
      .select('account_email, expires_at')
      .eq('account_id', profile.account_id)
      .single();

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      account_email: integration.account_email,
      expires_at: integration.expires_at,
    });
  } catch (err: any) {
    console.error('Error fetching Google Drive connection status:', err);
    return NextResponse.json({ connected: false, error: 'Falha ao verificar status' }, { status: 500 });
  }
}
