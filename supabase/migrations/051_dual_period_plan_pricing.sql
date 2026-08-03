-- ============================================================
-- 051_dual_period_plan_pricing.sql — Dual Pricing (Monthly/Yearly), Granular Plan Features & Multi-WABA Connections
-- ============================================================

-- 1. Add dual pricing columns to `plans`
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS price_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_yearly NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Backfill price_monthly with existing price column value if zero
UPDATE plans
SET price_monthly = price
WHERE price_monthly = 0 AND price > 0;

-- 2. Add `billing_cycle` to `subscriptions` table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- 3. Remove single WABA connection per account restriction from `whatsapp_config`
-- Drop unique constraint on account_id if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'whatsapp_config_account_id_key'
      AND conrelid = 'whatsapp_config'::regclass
  ) THEN
    ALTER TABLE whatsapp_config DROP CONSTRAINT whatsapp_config_account_id_key;
  END IF;
END $$;

-- Add label and is_default columns to whatsapp_config for multi-connection identification
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Create index on (account_id, is_default)
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_account_default ON whatsapp_config(account_id, is_default);
