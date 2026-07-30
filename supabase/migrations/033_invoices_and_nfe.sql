-- Migration: 033_invoices_and_nfe.sql
-- Description: Tabela de Faturas, Cobranças e Notas Fiscais (NFSe) via Asaas.

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  asaas_payment_id TEXT,
  asaas_invoice_id TEXT,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'refunded', 'overdue')),
  billing_type TEXT,
  invoice_number TEXT,
  pdf_url TEXT,
  xml_url TEXT,
  bank_slip_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON public.invoices(account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_asaas_payment_id ON public.invoices(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_asaas_invoice_id ON public.invoices(asaas_invoice_id);

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros da conta podem visualizar faturas"
  ON public.invoices
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Apenas Super Admins ou Service Role podem alterar faturas"
  ON public.invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );
