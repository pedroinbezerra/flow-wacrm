/**
 * Types & Interfaces for FlowHub Automatic Document Delivery Process
 */

export type DocumentSourceType = 'google_drive' | 'onedrive' | 'dropbox' | 's3' | 'webhook';

export type ProcessStatus = 'draft' | 'active' | 'paused';

export type ExtractionStrategy = 'deterministic' | 'ocr' | 'ai' | 'manual_override';

export type DeliveryChannel = 'whatsapp' | 'email';

export type DeliveryStatus = 'sent' | 'pending_review' | 'rejected' | 'failed';

export interface SourceConfig {
  accountId?: string;
  apiKey?: string;
  refreshToken?: string;
  accessToken?: string;
  bucketName?: string;
  region?: string;
  webhookSecret?: string;
  customEndpoint?: string;
}

export interface ExtractionRules {
  cpf_cnpj_in_filename?: boolean;
  filename_pattern?: string; // Regex pattern
  folder_name_matching?: boolean;
  enable_ocr?: boolean;
  enable_ai?: boolean;
  custom_prompt?: string;
}

export interface VariableMapping {
  template_variable: string; // e.g. "1" or "nome"
  extracted_field: 'recipient_name' | 'cpf_cnpj' | 'file_name' | 'custom_value';
  static_value?: string;
}

export interface DocumentDeliveryProcess {
  id: string;
  account_id: string;
  user_id: string;
  name: string;
  description?: string | null;
  status: ProcessStatus;
  source_type: DocumentSourceType;
  source_config: SourceConfig;
  folder_id?: string | null;
  folder_name?: string | null;
  file_pattern: string;
  extraction_rules: ExtractionRules;
  confidence_threshold: number; // e.g. 0.85
  delivery_channels: DeliveryChannel[];
  whatsapp_template_id?: string | null;
  whatsapp_template_name?: string | null;
  whatsapp_template_language?: string | null;
  variable_mappings: Record<string, string>;
  execution_count: number;
  success_count: number;
  pendency_count: number;
  last_executed_at?: string | null;
  paused_at?: string | null;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedRecipient {
  cpfCnpj?: string;
  name?: string;
  email?: string;
  phone?: string;
  matchedBy: 'cpf' | 'cnpj' | 'filename_pattern' | 'folder_name' | 'ocr' | 'ai';
  confidence: number;
  rawText?: string;
  aiUsage?: {
    model: string;
    tokensPrompt: number;
    tokensCompletion: number;
    estimatedCost: number;
    prompt: string;
    response: string;
  };
}

export interface DocumentFileMeta {
  id: string;
  name: string;
  sizeBytes: number;
  hash?: string;
  mimeType?: string;
  buffer?: Buffer;
  folderName?: string;
}

export interface DocumentDeliveryPendency {
  id: string;
  process_id: string;
  account_id: string;
  file_name: string;
  file_identifier?: string | null;
  file_hash?: string | null;
  file_size_bytes?: number | null;
  extracted_data: ExtractedRecipient | Record<string, any>;
  suggested_contact_id?: string | null;
  suggested_recipient_name?: string | null;
  suggested_recipient_phone?: string | null;
  suggested_recipient_email?: string | null;
  confidence_score: number;
  failure_reason: string;
  status: 'pending' | 'approved' | 'rejected';
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentDeliveryAuditLog {
  id: string;
  process_id: string;
  account_id: string;
  file_name: string;
  file_hash?: string | null;
  file_size_bytes?: number | null;
  source_type: DocumentSourceType;
  extraction_strategy: ExtractionStrategy;
  ai_used: boolean;
  ai_model?: string | null;
  ai_tokens_prompt?: number;
  ai_tokens_completion?: number;
  ai_estimated_cost?: number;
  ai_prompt?: string | null;
  ai_response?: string | null;
  confidence_score: number;
  identified_recipient_id?: string | null;
  identified_recipient_name?: string | null;
  identified_recipient_phone?: string | null;
  delivery_channel: string;
  template_used?: string | null;
  delivery_status: DeliveryStatus;
  meta_wamid?: string | null;
  meta_status?: string | null;
  error_details?: string | null;
  created_at: string;
}
