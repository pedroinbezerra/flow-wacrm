-- Migration 059: Defensive enforcement of Row Level Security (RLS) across all public schema tables
-- Ensures no table in the public schema remains publicly accessible over PostgREST API.

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND rowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', rec.tablename);
    RAISE NOTICE 'Enabled RLS on public table %', rec.tablename;
  END LOOP;
END $$;
