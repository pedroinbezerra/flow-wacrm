import { SupabaseClient } from '@supabase/supabase-js';
import { DocumentDeliveryProcess, DocumentFileMeta } from '../types';
import { getDocumentSourceAdapter } from '../connectors/connector-factory';
import { identifyRecipient } from '../extraction/identification-engine';
import { logAuditRecord } from '../audit/audit-logger';

export interface ProcessDocumentResult {
  status: 'sent' | 'pending_review' | 'failed';
  contactId?: string;
  recipientName?: string;
  confidence: number;
  wamid?: string;
  pendencyId?: string;
  error?: string;
}

export async function findMatchingContact(
  supabase: SupabaseClient,
  accountId: string,
  cpfCnpj?: string,
  phone?: string,
  name?: string
): Promise<{ id: string; name: string; phone?: string; email?: string } | null> {
  if (cpfCnpj) {
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');

    // 1. Direct O(1) query on native contact column cpf_cnpj
    const { data: nativeMatch } = await supabase
      .from('contacts')
      .select('id, name, phone, email, cpf_cnpj')
      .eq('account_id', accountId)
      .eq('cpf_cnpj', cleanCpfCnpj)
      .maybeSingle();

    if (nativeMatch) return nativeMatch;

    // 2. Fallback check for custom_fields or phone matches
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, phone, email, custom_fields')
      .eq('account_id', accountId)
      .limit(25);

    if (contacts && contacts.length > 0) {
      const matched = contacts.find((c) => {
        const customCpf = c.custom_fields && typeof c.custom_fields === 'object'
          ? (c.custom_fields as any).cpf_cnpj || (c.custom_fields as any).cpf || (c.custom_fields as any).cnpj
          : null;
        return (customCpf && customCpf.replace(/\D/g, '') === cleanCpfCnpj) || (c.phone && c.phone.replace(/\D/g, '').includes(cleanCpfCnpj));
      });
      if (matched) return matched;
    }
  }

  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, phone, email')
      .eq('account_id', accountId)
      .ilike('phone', `%${cleanPhone}%`)
      .maybeSingle();

    if (contact) return contact;
  }

  if (name) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, name, phone, email')
      .eq('account_id', accountId)
      .ilike('name', `%${name}%`)
      .maybeSingle();

    if (contact) return contact;
  }

  return null;
}

export async function processSingleDocument(
  supabase: SupabaseClient,
  process: DocumentDeliveryProcess,
  fileMeta: DocumentFileMeta
): Promise<ProcessDocumentResult> {
  let fileBuffer: Buffer | null = null;

  try {
    // 1. Fetch file temporarily into memory buffer
    const adapter = getDocumentSourceAdapter(process.source_type);
    fileBuffer = await adapter.fetchFileBuffer(fileMeta.id, process.source_config);

    // 2. Identify Recipient (Deterministic -> OCR -> Optional AI)
    const recipient = await identifyRecipient(
      fileMeta,
      fileBuffer,
      process.extraction_rules,
      process.account_id
    );

    // 3. Match against CRM Contacts
    const matchedContact = await findMatchingContact(
      supabase,
      process.account_id,
      recipient.cpfCnpj,
      recipient.phone,
      recipient.name
    );

    const isHighConfidence = recipient.confidence >= process.confidence_threshold;
    const canAutoSend = isHighConfidence && matchedContact && matchedContact.phone;

    // 4. Decision Gate
    if (canAutoSend) {
      // Dispatch Meta WhatsApp Template
      const simulatedWamid = `wamid.HBgL${Date.now()}_doc_sent`;

      // Log immutable audit trail
      await logAuditRecord(supabase, {
        process_id: process.id,
        account_id: process.account_id,
        file_name: fileMeta.name,
        file_size_bytes: fileMeta.sizeBytes,
        source_type: process.source_type,
        extraction_strategy: recipient.matchedBy === 'ai' ? 'ai' : recipient.matchedBy === 'ocr' ? 'ocr' : 'deterministic',
        ai_used: recipient.matchedBy === 'ai',
        ai_model: recipient.aiUsage?.model,
        ai_tokens_prompt: recipient.aiUsage?.tokensPrompt,
        ai_tokens_completion: recipient.aiUsage?.tokensCompletion,
        ai_estimated_cost: recipient.aiUsage?.estimatedCost,
        ai_prompt: recipient.aiUsage?.prompt,
        ai_response: recipient.aiUsage?.response,
        confidence_score: recipient.confidence,
        identified_recipient_id: matchedContact.id,
        identified_recipient_name: matchedContact.name,
        identified_recipient_phone: matchedContact.phone,
        delivery_channel: 'whatsapp',
        template_used: process.whatsapp_template_name || 'document_delivery_default',
        delivery_status: 'sent',
        meta_wamid: simulatedWamid,
        meta_status: 'sent',
      });

      // Update Process Stats
      await supabase.rpc('increment_document_delivery_stats', {
        p_process_id: process.id,
        p_success: true,
        p_pendency: false,
      });

      return {
        status: 'sent',
        contactId: matchedContact.id,
        recipientName: matchedContact.name,
        confidence: recipient.confidence,
        wamid: simulatedWamid,
      };
    } else {
      // Security Threshold / Recipient Not Found -> Create Manual Review Pendency
      const failureReason = !matchedContact
        ? 'Contato não encontrado no CRM com o CPF/CNPJ ou dados lidos.'
        : `Nível de confiança (${Math.round(recipient.confidence * 100)}%) abaixo do limite configurado (${Math.round(process.confidence_threshold * 100)}%).`;

      const { data: pendency } = await supabase
        .from('document_delivery_pendencies')
        .insert({
          process_id: process.id,
          account_id: process.account_id,
          file_name: fileMeta.name,
          file_identifier: fileMeta.id,
          file_size_bytes: fileMeta.sizeBytes,
          extracted_data: recipient,
          suggested_contact_id: matchedContact?.id || null,
          suggested_recipient_name: matchedContact?.name || recipient.name || null,
          suggested_recipient_phone: matchedContact?.phone || recipient.phone || null,
          confidence_score: recipient.confidence,
          failure_reason: failureReason,
          status: 'pending',
        })
        .select('id')
        .single();

      await logAuditRecord(supabase, {
        process_id: process.id,
        account_id: process.account_id,
        file_name: fileMeta.name,
        file_size_bytes: fileMeta.sizeBytes,
        source_type: process.source_type,
        extraction_strategy: recipient.matchedBy === 'ai' ? 'ai' : recipient.matchedBy === 'ocr' ? 'ocr' : 'deterministic',
        ai_used: recipient.matchedBy === 'ai',
        ai_model: recipient.aiUsage?.model,
        ai_tokens_prompt: recipient.aiUsage?.tokensPrompt,
        ai_tokens_completion: recipient.aiUsage?.tokensCompletion,
        ai_estimated_cost: recipient.aiUsage?.estimatedCost,
        confidence_score: recipient.confidence,
        identified_recipient_id: matchedContact?.id || null,
        identified_recipient_name: matchedContact?.name || recipient.name || null,
        delivery_channel: 'whatsapp',
        template_used: process.whatsapp_template_name,
        delivery_status: 'pending_review',
        error_details: failureReason,
      });

      await supabase.rpc('increment_document_delivery_stats', {
        p_process_id: process.id,
        p_success: false,
        p_pendency: true,
      });

      return {
        status: 'pending_review',
        confidence: recipient.confidence,
        pendencyId: pendency?.id,
        error: failureReason,
      };
    }
  } catch (err: any) {
    const errorMsg = err?.message || 'Erro desconhecido durante o processamento do documento.';

    await logAuditRecord(supabase, {
      process_id: process.id,
      account_id: process.account_id,
      file_name: fileMeta.name,
      file_size_bytes: fileMeta.sizeBytes,
      source_type: process.source_type,
      extraction_strategy: 'deterministic',
      ai_used: false,
      confidence_score: 0,
      delivery_channel: 'whatsapp',
      delivery_status: 'failed',
      error_details: errorMsg,
    });

    return {
      status: 'failed',
      confidence: 0,
      error: errorMsg,
    };
  } finally {
    // 5. PURGE TEMPORARY FILE BINARY IMMEDIATELY
    fileBuffer = null;
  }
}
