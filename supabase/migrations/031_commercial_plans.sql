-- ============================================================
-- 031_commercial_plans.sql — Commercial Plans & Dynamic Limits
-- ============================================================

-- 1. Create `plans` table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'one_time', 'none')),
  trial_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on plans
DROP TRIGGER IF EXISTS set_updated_at ON plans;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 2. Add super admin flag to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- 3. Add plan fields to accounts
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled')),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_accounts_plan ON accounts(plan_id);

-- 4. Helper function to check if current user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.is_super_admin = true
  );
$$;

ALTER FUNCTION is_super_admin() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, service_role;

-- 5. RLS policies on plans:
--    All authenticated users can read plans (so accounts can read their plan limits)
--    Super admins can modify plans
DROP POLICY IF EXISTS plans_select ON plans;
DROP POLICY IF EXISTS plans_modify ON plans;

CREATE POLICY plans_select ON plans FOR SELECT
  USING (true);

CREATE POLICY plans_modify ON plans FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- 6. Seed Default Plan and backfill existing accounts
DO $$
DECLARE
  v_default_plan_id UUID;
BEGIN
  -- Insert or get existing default plan
  SELECT id INTO v_default_plan_id FROM plans WHERE name = 'Plano Padrão' LIMIT 1;

  IF v_default_plan_id IS NULL THEN
    INSERT INTO plans (name, description, price, billing_period, trial_days, status, features)
    VALUES (
      'Plano Padrão',
      'Plano inicial padrão do sistema com limites gerais.',
      0,
      'monthly',
      14,
      'active',
      '{
        "max_users": 10,
        "max_contacts": 10000,
        "max_flows": 10,
        "max_nodes_per_flow": 50,
        "max_kanban_funnels": 5,
        "max_boards": 5,
        "max_broadcasts_per_campaign": 1000,
        "allow_scheduling": true,
        "allow_reports": true,
        "allow_webhooks": true
      }'::jsonb
    )
    RETURNING id INTO v_default_plan_id;
  END IF;

  -- Backfill existing accounts that don't have a plan assigned
  UPDATE accounts
  SET plan_id = v_default_plan_id
  WHERE plan_id IS NULL;
END $$;
