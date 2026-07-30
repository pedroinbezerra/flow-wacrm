-- ============================================================
-- 037_ai_audit_and_security.sql
--
-- AI Audit Logs, Security Events, and RBAC Hardening
-- ============================================================

-- 1. AI Execution Logs Table
CREATE TABLE IF NOT EXISTS public.ai_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  inbound_message_text TEXT,
  outbound_text TEXT,
  model_used TEXT,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  execution_time_ms INT DEFAULT 0,
  knowledge_item_ids JSONB DEFAULT '[]'::jsonb,
  media_item_ids JSONB DEFAULT '[]'::jsonb,
  handoff_triggered BOOLEAN DEFAULT false,
  handoff_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_execution_logs_account_created
  ON public.ai_execution_logs(account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_execution_logs_conversation
  ON public.ai_execution_logs(conversation_id, created_at DESC);

ALTER TABLE public.ai_execution_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view account ai execution logs" ON public.ai_execution_logs;
CREATE POLICY "Members can view account ai execution logs"
  ON public.ai_execution_logs FOR SELECT
  USING (is_account_member(account_id));

-- 2. AI Security Events Table
CREATE TABLE IF NOT EXISTS public.ai_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('jailbreak_attempt', 'prompt_injection_detected', 'rate_limit_exceeded', 'unauthorized_action_attempt')),
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_security_events_account_created
  ON public.ai_security_events(account_id, created_at DESC);

ALTER TABLE public.ai_security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view account ai security events" ON public.ai_security_events;
CREATE POLICY "Members can view account ai security events"
  ON public.ai_security_events FOR SELECT
  USING (is_account_member(account_id));

-- 3. RBAC Hardening on Knowledge Base & Media Library
DROP POLICY IF EXISTS "Members can manage account ai knowledge base" ON public.ai_knowledge_base;

CREATE POLICY "Members can view account ai knowledge base"
  ON public.ai_knowledge_base FOR SELECT
  USING (is_account_member(account_id));

CREATE POLICY "Admins can insert account ai knowledge base"
  ON public.ai_knowledge_base FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

CREATE POLICY "Admins can update account ai knowledge base"
  ON public.ai_knowledge_base FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

CREATE POLICY "Admins can delete account ai knowledge base"
  ON public.ai_knowledge_base FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS "Members can manage account ai media library" ON public.ai_media_library;

CREATE POLICY "Members can view account ai media library"
  ON public.ai_media_library FOR SELECT
  USING (is_account_member(account_id));

CREATE POLICY "Admins can insert account ai media library"
  ON public.ai_media_library FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

CREATE POLICY "Admins can update account ai media library"
  ON public.ai_media_library FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

CREATE POLICY "Admins can delete account ai media library"
  ON public.ai_media_library FOR DELETE
  USING (is_account_member(account_id, 'admin'));
