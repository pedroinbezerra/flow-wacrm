import { SupabaseClient } from '@supabase/supabase-js';
import { DocumentDeliveryAuditLog } from '../types';

export async function logAuditRecord(
  supabase: SupabaseClient,
  record: Omit<DocumentDeliveryAuditLog, 'id' | 'created_at'>
): Promise<void> {
  try {
    await supabase.from('document_delivery_audit_logs').insert({
      process_id: record.process_id,
      account_id: record.account_id,
      file_name: record.file_name,
      file_hash: record.file_hash || null,
      file_size_bytes: record.file_size_bytes || null,
      source_type: record.source_type,
      extraction_strategy: record.extraction_strategy,
      ai_used: record.ai_used || false,
      ai_model: record.ai_model || null,
      ai_tokens_prompt: record.ai_tokens_prompt || 0,
      ai_tokens_completion: record.ai_tokens_completion || 0,
      ai_estimated_cost: record.ai_estimated_cost || 0,
      ai_prompt: record.ai_prompt || null,
      ai_response: record.ai_response || null,
      confidence_score: record.confidence_score,
      identified_recipient_id: record.identified_recipient_id || null,
      identified_recipient_name: record.identified_recipient_name || null,
      identified_recipient_phone: record.identified_recipient_phone || null,
      delivery_channel: record.delivery_channel,
      template_used: record.template_used || null,
      delivery_status: record.delivery_status,
      meta_wamid: record.meta_wamid || null,
      meta_status: record.meta_status || null,
      error_details: record.error_details || null,
    });
  } catch (error) {
    // Audit logging must be resilient and not crash core operations
    console.error('[DocumentDeliveryAuditLogger] Failed to write audit record:', error);
  }
}
