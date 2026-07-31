-- ============================================================
-- 047_fix_system_config_app_url.sql
--
-- Update production app_url in public.system_config for real-time security event alerts.
-- ============================================================

UPDATE public.system_config
SET value = 'https://www.flowhub.flowofc.com.br', updated_at = NOW()
WHERE key = 'app_url';
