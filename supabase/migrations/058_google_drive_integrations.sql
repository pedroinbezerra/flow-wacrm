-- Migration 058: Tabela de Integração Real com Google Drive (OAuth 2.0 & REST API v3)

CREATE TABLE IF NOT EXISTS public.google_drive_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_account_google_drive UNIQUE (account_id)
);

CREATE INDEX IF NOT EXISTS idx_google_drive_integrations_account_id ON public.google_drive_integrations(account_id);

ALTER TABLE public.google_drive_integrations ENABLE ROW LEVEL SECURITY;

-- Politica RLS: Apenas membros da mesma conta podem ler a integração do Google Drive
CREATE POLICY "Membros da conta podem ler integracao google drive"
  ON public.google_drive_integrations
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Politica RLS: Administradores/Membros da conta podem deletar a integração (Desconectar)
CREATE POLICY "Membros da conta podem deletar integracao google drive"
  ON public.google_drive_integrations
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
  );
