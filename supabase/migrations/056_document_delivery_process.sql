-- ============================================================
-- 056_document_delivery_process.sql
--
-- FlowHub Smart Process: Automatic Document Delivery
-- Architecture: Orchestrates external repositories without permanent file storage.
-- Multi-tenant isolation by account_id with strict RLS and audit trails.
-- ============================================================

-- ============================================================
-- 1. PROCESS DEFINITIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_delivery_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  source_type TEXT NOT NULL CHECK (source_type IN ('google_drive', 'onedrive', 'dropbox', 's3', 'webhook')),
  source_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  folder_id TEXT,
  folder_name TEXT,
  file_pattern TEXT DEFAULT '*.pdf',
  extraction_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_threshold NUMERIC NOT NULL DEFAULT 0.85,
  delivery_channels TEXT[] NOT NULL DEFAULT ARRAY['whatsapp']::text[],
  whatsapp_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  whatsapp_template_name TEXT,
  whatsapp_template_language TEXT DEFAULT 'pt_BR',
  variable_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  pendency_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_delivery_proc_account ON document_delivery_processes(account_id);
CREATE INDEX IF NOT EXISTS idx_doc_delivery_proc_active ON document_delivery_processes(status) WHERE status = 'active';

ALTER TABLE document_delivery_processes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account members can view document delivery processes" ON document_delivery_processes;
CREATE POLICY "Account members can view document delivery processes"
  ON document_delivery_processes FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Account members can manage document delivery processes" ON document_delivery_processes;
CREATE POLICY "Account members can manage document delivery processes"
  ON document_delivery_processes FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS set_updated_at ON document_delivery_processes;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON document_delivery_processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 2. MANUAL REVIEW PENDENCIES QUEUE
-- ============================================================
CREATE TABLE IF NOT EXISTS document_delivery_pendencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES document_delivery_processes(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_identifier TEXT,
  file_hash TEXT,
  file_size_bytes BIGINT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  suggested_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  suggested_recipient_name TEXT,
  suggested_recipient_phone TEXT,
  suggested_recipient_email TEXT,
  confidence_score NUMERIC DEFAULT 0,
  failure_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_delivery_pend_account ON document_delivery_pendencies(account_id, status);
CREATE INDEX IF NOT EXISTS idx_doc_delivery_pend_process ON document_delivery_pendencies(process_id);

ALTER TABLE document_delivery_pendencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account members can view document delivery pendencies" ON document_delivery_pendencies;
CREATE POLICY "Account members can view document delivery pendencies"
  ON document_delivery_pendencies FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Account members can manage document delivery pendencies" ON document_delivery_pendencies;
CREATE POLICY "Account members can manage document delivery pendencies"
  ON document_delivery_pendencies FOR ALL
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS set_updated_at ON document_delivery_pendencies;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON document_delivery_pendencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 3. IMMUTABLE AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_delivery_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES document_delivery_processes(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_hash TEXT,
  file_size_bytes BIGINT,
  source_type TEXT NOT NULL,
  extraction_strategy TEXT NOT NULL CHECK (extraction_strategy IN ('deterministic', 'ocr', 'ai', 'manual_override')),
  ai_used BOOLEAN NOT NULL DEFAULT FALSE,
  ai_model TEXT,
  ai_tokens_prompt INTEGER DEFAULT 0,
  ai_tokens_completion INTEGER DEFAULT 0,
  ai_estimated_cost NUMERIC DEFAULT 0,
  ai_prompt TEXT,
  ai_response TEXT,
  confidence_score NUMERIC DEFAULT 0,
  identified_recipient_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  identified_recipient_name TEXT,
  identified_recipient_phone TEXT,
  delivery_channel TEXT NOT NULL,
  template_used TEXT,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('sent', 'pending_review', 'rejected', 'failed')),
  meta_wamid TEXT,
  meta_status TEXT,
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_delivery_logs_account ON document_delivery_audit_logs(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_delivery_logs_process ON document_delivery_audit_logs(process_id, created_at DESC);

ALTER TABLE document_delivery_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account members can view document delivery audit logs" ON document_delivery_audit_logs;
CREATE POLICY "Account members can view document delivery audit logs"
  ON document_delivery_audit_logs FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Function to safely increment process stats
CREATE OR REPLACE FUNCTION increment_document_delivery_stats(
  p_process_id UUID,
  p_success BOOLEAN DEFAULT FALSE,
  p_pendency BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
BEGIN
  UPDATE document_delivery_processes
  SET execution_count = execution_count + 1,
      success_count = CASE WHEN p_success THEN success_count + 1 ELSE success_count END,
      pendency_count = CASE WHEN p_pendency THEN pendency_count + 1 ELSE pendency_count END,
      last_executed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_process_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
