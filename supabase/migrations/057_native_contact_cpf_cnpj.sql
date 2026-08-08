-- ============================================================
-- 057_native_contact_cpf_cnpj.sql
--
-- Promotes CPF / CNPJ to a native first-class column on contacts table.
-- Eliminates reliance on custom_fields for document delivery matching.
-- Includes sanitized index for instant deterministic matching.
-- ============================================================

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;

-- Index tuned for document delivery matching by account_id and cpf_cnpj
CREATE INDEX IF NOT EXISTS idx_contacts_account_cpf_cnpj
  ON contacts(account_id, cpf_cnpj)
  WHERE cpf_cnpj IS NOT NULL;
