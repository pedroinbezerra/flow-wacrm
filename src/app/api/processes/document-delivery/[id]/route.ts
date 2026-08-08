import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: process, error } = await supabase
      .from('document_delivery_processes')
      .select('*')
      .eq('id', id)
      .eq('account_id', profile.account_id)
      .single();

    if (error || !process) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ process });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await req.json();
    const updatePayload: Record<string, any> = {};

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.status !== undefined) {
      updatePayload.status = body.status;
      if (body.status === 'paused') updatePayload.paused_at = new Date().toISOString();
      if (body.status === 'active') updatePayload.activated_at = new Date().toISOString();
    }
    if (body.folder_id !== undefined) updatePayload.folder_id = body.folder_id;
    if (body.folder_name !== undefined) updatePayload.folder_name = body.folder_name;
    if (body.extraction_rules !== undefined) updatePayload.extraction_rules = body.extraction_rules;
    if (body.confidence_threshold !== undefined) updatePayload.confidence_threshold = body.confidence_threshold;
    if (body.whatsapp_template_id !== undefined) updatePayload.whatsapp_template_id = body.whatsapp_template_id;
    if (body.whatsapp_template_name !== undefined) updatePayload.whatsapp_template_name = body.whatsapp_template_name;

    const { data: process, error } = await supabase
      .from('document_delivery_processes')
      .update(updatePayload)
      .eq('id', id)
      .eq('account_id', profile.account_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ process });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from('document_delivery_processes')
      .delete()
      .eq('id', id)
      .eq('account_id', profile.account_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
