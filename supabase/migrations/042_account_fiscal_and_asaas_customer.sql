-- ============================================================
-- 042_account_fiscal_and_asaas_customer.sql
--
-- Adds fiscal identification (CPF/CNPJ, company name, phone,
-- address fields) and Asaas customer ID mapping to accounts.
-- ============================================================

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- Index for fast lookup by Asaas Customer ID
CREATE INDEX IF NOT EXISTS idx_accounts_asaas_customer_id ON accounts(asaas_customer_id);
