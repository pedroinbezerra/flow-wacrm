import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ error: 'Perfil sem conta vinculada' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const processId = searchParams.get('process_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('document_delivery_audit_logs')
      .select('*')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (processId) {
      query = query.eq('process_id', processId);
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
