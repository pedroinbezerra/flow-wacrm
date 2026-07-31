-- ============================================================
-- 046_security_event_alert_triggers.sql
--
-- Real-time security event alert triggers via pg_net.
-- Triggers on critical ai_security_events, super_admin_audit_logs,
-- and account_deletion_audit_logs to notify internal WhatsApp endpoint.
-- ============================================================

-- 1. Enable pg_net extension if available
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Configuration table for system-wide app settings (URL & internal secret)
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for system_config: only Super Admins / Service Role can access
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role para system_config" ON public.system_config;
CREATE POLICY "Apenas Super Admins ou Service Role para system_config"
  ON public.system_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

INSERT INTO public.system_config (key, value)
VALUES
  ('app_url', 'https://www.flowhub.flowofc.com.br'),
  ('internal_alerts_secret', 'AUTOMATION_CRON_SECRET')
ON CONFLICT (key) DO NOTHING;

-- 3. Trigger Function for dispatching HTTP alerts via pg_net
CREATE OR REPLACE FUNCTION public.notify_security_event_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_app_url TEXT;
  v_secret TEXT;
  v_source TEXT;
  v_summary TEXT;
  v_details JSONB;
  v_should_fire BOOLEAN := TRUE;
BEGIN
  -- Retrieve App URL
  SELECT value INTO v_app_url FROM public.system_config WHERE key = 'app_url';
  IF v_app_url IS NULL OR v_app_url = '' THEN
    v_app_url := current_setting('app.settings.app_url', true);
  END IF;

  -- Retrieve Secret
  SELECT value INTO v_secret FROM public.system_config WHERE key = 'internal_alerts_secret';
  IF v_secret IS NULL OR v_secret = '' THEN
    v_secret := current_setting('app.settings.internal_alerts_secret', true);
  END IF;

  -- If App URL is missing, skip dispatch
  IF v_app_url IS NULL OR v_app_url = '' THEN
    RETURN NEW;
  END IF;

  -- Remove trailing slash from v_app_url if present
  v_app_url := rtrim(v_app_url, '/');

  -- Process table-specific payload and conditions
  IF TG_TABLE_NAME = 'ai_security_events' THEN
    IF NEW.severity <> 'critical' THEN
      v_should_fire := FALSE;
    ELSE
      v_source := 'ai_security_events';
      v_summary := 'Evento crítico de segurança IA (' || COALESCE(NEW.event_type, 'desconhecido') || ')';
      v_details := to_jsonb(NEW);
    END IF;

  ELSIF TG_TABLE_NAME = 'super_admin_audit_logs' THEN
    v_source := 'super_admin_audit_logs';
    v_summary := 'Alteração de Super Admin: ' || COALESCE(NEW.action, '') || ' para ' || COALESCE(NEW.target_email, '') || ' (por ' || COALESCE(NEW.performed_by_email, '') || ')';
    v_details := to_jsonb(NEW);

  ELSIF TG_TABLE_NAME = 'account_deletion_audit_logs' THEN
    v_source := 'account_deletion_audit_logs';
    v_summary := 'Conta expurgada definitivamente: ' || COALESCE(NEW.account_name, '') || ' (Dono: ' || COALESCE(NEW.owner_email, 'N/A') || ')';
    v_details := to_jsonb(NEW);
  END IF;

  -- Dispatch HTTP POST request asynchronously via pg_net
  IF v_should_fire THEN
    PERFORM net.http_post(
      url := v_app_url || '/api/internal/alerts/security-event',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', COALESCE(v_secret, '')
      ),
      body := jsonb_build_object(
        'source', v_source,
        'summary', v_summary,
        'details', v_details
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Graceful degradation: log warning, never block original INSERT
  RAISE WARNING 'notify_security_event_alert failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Attach Triggers to Tables
DROP TRIGGER IF EXISTS trg_ai_security_events_alert ON public.ai_security_events;
CREATE TRIGGER trg_ai_security_events_alert
  AFTER INSERT ON public.ai_security_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_security_event_alert();

DROP TRIGGER IF EXISTS trg_super_admin_audit_logs_alert ON public.super_admin_audit_logs;
CREATE TRIGGER trg_super_admin_audit_logs_alert
  AFTER INSERT ON public.super_admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_security_event_alert();

DROP TRIGGER IF EXISTS trg_account_deletion_audit_logs_alert ON public.account_deletion_audit_logs;
CREATE TRIGGER trg_account_deletion_audit_logs_alert
  AFTER INSERT ON public.account_deletion_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_security_event_alert();
