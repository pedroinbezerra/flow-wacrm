-- ============================================================
-- 043_super_admin_audit_logs.sql
--
-- Audit logs table for tracking Super Admin privilege assignments
-- and revocations for platform governance & compliance.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.super_admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked')),
  performed_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  performed_by_email TEXT NOT NULL,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit querying
CREATE INDEX IF NOT EXISTS idx_super_admin_audit_created
  ON public.super_admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_super_admin_audit_target
  ON public.super_admin_audit_logs(target_user_id);

-- RLS
ALTER TABLE public.super_admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS super_admin_audit_select ON public.super_admin_audit_logs;
CREATE POLICY super_admin_audit_select ON public.super_admin_audit_logs FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS super_admin_audit_insert ON public.super_admin_audit_logs;
CREATE POLICY super_admin_audit_insert ON public.super_admin_audit_logs FOR INSERT
  WITH CHECK (is_super_admin());
