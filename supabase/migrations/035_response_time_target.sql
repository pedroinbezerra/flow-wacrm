-- ============================================================
-- 035_response_time_target
--
-- Make the First Response Time Target (Meta) configurable per account.
--
-- Adds `response_time_target_minutes` column to `accounts` table.
-- Default target is 5 minutes.
-- Valid range: 1 minute to 1440 minutes (24 hours).
-- ============================================================

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS response_time_target_minutes INT NOT NULL DEFAULT 5;

ALTER TABLE accounts
  DROP CONSTRAINT IF EXISTS accounts_response_time_target_check;
ALTER TABLE accounts
  ADD CONSTRAINT accounts_response_time_target_check
  CHECK (response_time_target_minutes > 0 AND response_time_target_minutes <= 1440);
