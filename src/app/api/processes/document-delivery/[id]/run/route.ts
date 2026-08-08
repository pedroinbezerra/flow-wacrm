import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDocumentSourceAdapter } from '@/lib/document-delivery/connectors/connector-factory';
import { processSingleDocument } from '@/lib/document-delivery/delivery/delivery-engine';

export async function POST(
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

    if (process.status === 'paused') {
      return NextResponse.json({ error: 'Processo está pausado' }, { status: 400 });
    }

    // Fetch pending files from repository
    const adapter = getDocumentSourceAdapter(process.source_type);
    const files = await adapter.listPendingFiles(
      process.folder_id || 'root',
      process.file_pattern || '*.pdf',
      process.source_config || {}
    );

    const results = [];
    for (const file of files) {
      const res = await processSingleDocument(supabase, process as any, file);
      results.push({ file: file.name, ...res });
    }

    return NextResponse.json({
      success: true,
      processedCount: files.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
