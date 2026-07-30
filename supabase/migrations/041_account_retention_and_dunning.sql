-- Migration: 041_account_retention_and_dunning.sql
-- Description: Suporte a retenção/carência de exclusão de contas (90 dias), expurgo de dados, 
--              preservação de faturas tributárias e ciclo de dunning por inadimplência em 5 estágios.

-- 1. Adicionar scheduled_deletion_at na tabela accounts
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_scheduled_deletion 
  ON public.accounts(scheduled_deletion_at) 
  WHERE scheduled_deletion_at IS NOT NULL;

-- 2. Atualizar restrições de status de assinatura em accounts para incluir 'read_only' e 'suspended'
ALTER TABLE public.accounts 
  DROP CONSTRAINT IF EXISTS accounts_subscription_status_check;

ALTER TABLE public.accounts 
  ADD CONSTRAINT accounts_subscription_status_check 
  CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'read_only', 'suspended', 'canceled'));

-- 3. Atualizar restrições de status em subscriptions
ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_status_check 
  CHECK (status IN ('trialing', 'active', 'past_due', 'read_only', 'suspended', 'canceled'));

-- 4. Alterar a FK de invoices.account_id para permitir NULL e ON DELETE SET NULL (preservação fiscal de 5 anos)
ALTER TABLE public.invoices
  ALTER COLUMN account_id DROP NOT NULL;

DO $$
BEGIN
  -- Identifica e remove a constraint FK antiga em invoices se ela existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_account_id_fkey' 
      AND table_name = 'invoices'
  ) THEN
    ALTER TABLE public.invoices DROP CONSTRAINT invoices_account_id_fkey;
  END IF;
END $$;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_account_id_fkey 
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

-- 5. Tabela de Log de Auditoria de Expurgo de Contas
CREATE TABLE IF NOT EXISTS public.account_deletion_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  account_name TEXT NOT NULL,
  owner_email TEXT,
  scheduled_at TIMESTAMPTZ,
  purged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoices_preserved_count INT NOT NULL DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_logs_account_id 
  ON public.account_deletion_audit_logs(account_id);

ALTER TABLE public.account_deletion_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role podem ler logs de expurgo" ON public.account_deletion_audit_logs;
CREATE POLICY "Apenas Super Admins ou Service Role podem ler logs de expurgo"
  ON public.account_deletion_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas Service Role pode inserir logs de expurgo" ON public.account_deletion_audit_logs;
CREATE POLICY "Apenas Service Role pode inserir logs de expurgo"
  ON public.account_deletion_audit_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );
