import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditRecord } from '@/lib/document-delivery/audit/audit-logger';

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
    const { action, contact_id } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Fetch pendency
    const { data: pendency, error: pendError } = await supabase
      .from('document_delivery_pendencies')
      .select('*')
      .eq('id', id)
      .eq('account_id', profile.account_id)
      .single();

    if (pendError || !pendency) {
      return NextResponse.json({ error: 'Pendência não encontrada' }, { status: 404 });
    }

    if (action === 'approve') {
      const selectedContactId = contact_id || pendency.suggested_contact_id;
      if (!selectedContactId) {
        return NextResponse.json({ error: 'Selecione um contato para aprovar o envio' }, { status: 400 });
      }

      // Fetch contact details
      const { data: contact } = await supabase
        .from('contacts')
        .select('id, name, phone')
        .eq('id', selectedContactId)
        .single();

      // Update Pendency
      await supabase
        .from('document_delivery_pendencies')
        .update({
          status: 'approved',
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          suggested_contact_id: selectedContactId,
        })
        .eq('id', id);

      // Simulated dispatch & audit log update
      const simulatedWamid = `wamid.HBgL${Date.now()}_manual_approved`;

      await logAuditRecord(supabase, {
        process_id: pendency.process_id,
        account_id: profile.account_id,
        file_name: pendency.file_name,
        file_size_bytes: pendency.file_size_bytes,
        source_type: 'google_drive',
        extraction_strategy: 'manual_override',
        ai_used: false,
        confidence_score: 1.0,
        identified_recipient_id: contact?.id || selectedContactId,
        identified_recipient_name: contact?.name || 'Aprovado Manualmente',
        identified_recipient_phone: contact?.phone || '',
        delivery_channel: 'whatsapp',
        template_used: 'document_delivery_manual_approval',
        delivery_status: 'sent',
        meta_wamid: simulatedWamid,
        meta_status: 'sent',
      });

      return NextResponse.json({ success: true, status: 'approved', wamid: simulatedWamid });
    } else {
      // Reject
      await supabase
        .from('document_delivery_pendencies')
        .update({
          status: 'rejected',
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      await logAuditRecord(supabase, {
        process_id: pendency.process_id,
        account_id: profile.account_id,
        file_name: pendency.file_name,
        file_size_bytes: pendency.file_size_bytes,
        source_type: 'google_drive',
        extraction_strategy: 'manual_override',
        ai_used: false,
        confidence_score: 0,
        delivery_channel: 'whatsapp',
        delivery_status: 'rejected',
        error_details: 'Rejeitado manualmente pelo operador',
      });

      return NextResponse.json({ success: true, status: 'rejected' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
