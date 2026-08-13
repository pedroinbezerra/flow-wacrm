-- Migration 060: Event Trigger to prevent disabling RLS on public tables
-- Implements database-level immutability against disabling Row Level Security.

CREATE OR REPLACE FUNCTION public.prevent_disable_rls_function()
RETURNS event_trigger AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'ALTER TABLE' LOOP
    IF EXISTS (
      SELECT 1 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND rowsecurity = false
    ) THEN
      RAISE EXCEPTION 'VIOLAÇÃO DE SEGURANÇA: É estritamente proibido desativar o Row Level Security (RLS) nas tabelas do schema public.';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Event Trigger on DDL command completion
DROP EVENT TRIGGER IF EXISTS enforce_rls_integrity_trigger;
CREATE EVENT TRIGGER enforce_rls_integrity_trigger
  ON ddl_command_end
  WHEN TAG IN ('ALTER TABLE')
  EXECUTE FUNCTION public.prevent_disable_rls_function();
