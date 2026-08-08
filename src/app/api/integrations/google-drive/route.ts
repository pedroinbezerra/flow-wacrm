import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ error: 'Perfil não vinculado' }, { status: 400 });
    }

    const { error } = await supabase
      .from('google_drive_integrations')
      .delete()
      .eq('account_id', profile.account_id);

    if (error) {
      return NextResponse.json({ error: 'Falha ao desconectar Google Drive' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error disconnecting Google Drive:', err);
    return NextResponse.json({ error: 'Erro ao desconectar' }, { status: 500 });
  }
}
