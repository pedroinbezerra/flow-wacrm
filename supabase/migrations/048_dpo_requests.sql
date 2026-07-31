-- Migration: 048_dpo_requests.sql
-- Description: Create dpo_requests table for tracking LGPD data subject requests (Art. 18 LGPD)

CREATE TABLE IF NOT EXISTS public.dpo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.dpo_requests ENABLE ROW LEVEL SECURITY;

-- Super Admins can view requests in dashboard/audit
CREATE POLICY super_admin_select_dpo_requests ON public.dpo_requests
  FOR SELECT TO authenticated
  USING (is_super_admin());

COMMENT ON TABLE public.dpo_requests IS 'Registros de solicitações de direitos do titular de dados (LGPD Art. 18)';
