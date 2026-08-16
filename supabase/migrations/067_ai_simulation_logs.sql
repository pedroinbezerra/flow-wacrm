-- ============================================================
-- 067_ai_simulation_logs.sql
--
-- Persistent Audit Log for AI Assistant Simulations & Config Snapshots
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_simulation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inbound_message_text TEXT NOT NULL,
  outbound_text TEXT,
  model_used TEXT,
  temperature NUMERIC(3,2),
  max_tokens INT,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  knowledge_sources JSONB DEFAULT '[]'::jsonb,
  attached_media JSONB DEFAULT '[]'::jsonb,
  handoff_requested BOOLEAN DEFAULT false,
  handoff_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_simulation_logs_account_created
  ON public.ai_simulation_logs(account_id, created_at DESC);

ALTER TABLE public.ai_simulation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view account ai simulation logs" ON public.ai_simulation_logs;
CREATE POLICY "Members can view account ai simulation logs"
  ON public.ai_simulation_logs FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS "Members can insert account ai simulation logs" ON public.ai_simulation_logs;
CREATE POLICY "Members can insert account ai simulation logs"
  ON public.ai_simulation_logs FOR INSERT
  WITH CHECK (is_account_member(account_id));
