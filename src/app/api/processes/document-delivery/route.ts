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

    const { data: processes, error } = await supabase
      .from('document_delivery_processes')
      .select('*')
      .eq('account_id', profile.account_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ processes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();

    if (!body.name || !body.source_type) {
      return NextResponse.json({ error: 'Campos nome e origem dos documentos são obrigatórios' }, { status: 400 });
    }

    const { data: process, error } = await supabase
      .from('document_delivery_processes')
      .insert({
        account_id: profile.account_id,
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        status: body.status || 'draft', // By default starts disabled per FH-54.03
        source_type: body.source_type,
        source_config: body.source_config || {},
        folder_id: body.folder_id || null,
        folder_name: body.folder_name || null,
        file_pattern: body.file_pattern || '*.pdf',
        extraction_rules: body.extraction_rules || { cpf_cnpj_in_filename: true, enable_ocr: true },
        confidence_threshold: body.confidence_threshold || 0.85,
        delivery_channels: body.delivery_channels || ['whatsapp'],
        whatsapp_template_id: body.whatsapp_template_id || null,
        whatsapp_template_name: body.whatsapp_template_name || null,
        variable_mappings: body.variable_mappings || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ process }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
