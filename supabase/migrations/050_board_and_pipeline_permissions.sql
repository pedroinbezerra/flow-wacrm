-- ============================================================
-- 050_board_and_pipeline_permissions.sql
--
-- Adds user-level permissions for Conversation Boards and Pipelines:
--   - conversation_board_members table
--   - pipeline_members table
--   - updated RLS policies allowing owners/admins full access,
--     and agents access only to assigned boards/pipelines
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CONVERSATION BOARD MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES conversation_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_board_members_account
  ON conversation_board_members(account_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_members_user
  ON conversation_board_members(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_members_board
  ON conversation_board_members(board_id);

ALTER TABLE conversation_board_members ENABLE ROW LEVEL SECURITY;

-- Helper to check if a user is an explicit board member OR account owner/admin
CREATE OR REPLACE FUNCTION public.can_access_conversation_board(
  p_board_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_role account_role_enum;
BEGIN
  SELECT account_id INTO v_account_id
  FROM conversation_boards
  WHERE id = p_board_id;

  IF v_account_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Account owners and admins have access to all boards in the account
  SELECT account_role INTO v_role
  FROM profiles
  WHERE account_id = v_account_id AND user_id = p_user_id;

  IF v_role IN ('owner', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Check if board has any assigned members; if no members assigned, default to open for account members
  IF NOT EXISTS (SELECT 1 FROM conversation_board_members WHERE board_id = p_board_id) THEN
    RETURN v_role IS NOT NULL;
  END IF;

  -- Otherwise, check explicit membership
  RETURN EXISTS (
    SELECT 1 FROM conversation_board_members
    WHERE board_id = p_board_id AND user_id = p_user_id
  );
END;
$$;

ALTER FUNCTION public.can_access_conversation_board(UUID, UUID) OWNER TO postgres;

-- Policies for conversation_board_members table
DROP POLICY IF EXISTS conversation_board_members_select ON conversation_board_members;
CREATE POLICY conversation_board_members_select
  ON conversation_board_members
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_board_members_insert ON conversation_board_members;
CREATE POLICY conversation_board_members_insert
  ON conversation_board_members
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_members_delete ON conversation_board_members;
CREATE POLICY conversation_board_members_delete
  ON conversation_board_members
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Update RLS policy for conversation_boards
DROP POLICY IF EXISTS conversation_boards_select ON conversation_boards;
CREATE POLICY conversation_boards_select
  ON conversation_boards
  FOR SELECT
  USING (
    is_account_member(account_id) AND can_access_conversation_board(id, auth.uid())
  );

-- Update RLS policy for conversation_board_items
DROP POLICY IF EXISTS conversation_board_items_select ON conversation_board_items;
CREATE POLICY conversation_board_items_select
  ON conversation_board_items
  FOR SELECT
  USING (
    is_account_member(account_id) AND can_access_conversation_board(board_id, auth.uid())
  );

-- ============================================================
-- 2. PIPELINE MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS pipeline_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pipeline_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_members_account
  ON pipeline_members(account_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_members_user
  ON pipeline_members(user_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_members_pipeline
  ON pipeline_members(pipeline_id);

ALTER TABLE pipeline_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check pipeline access
CREATE OR REPLACE FUNCTION public.can_access_pipeline(
  p_pipeline_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_role account_role_enum;
BEGIN
  SELECT account_id INTO v_account_id
  FROM pipelines
  WHERE id = p_pipeline_id;

  IF v_account_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT account_role INTO v_role
  FROM profiles
  WHERE account_id = v_account_id AND user_id = p_user_id;

  IF v_role IN ('owner', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- If no explicit members assigned to pipeline, open to all account members
  IF NOT EXISTS (SELECT 1 FROM pipeline_members WHERE pipeline_id = p_pipeline_id) THEN
    RETURN v_role IS NOT NULL;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM pipeline_members
    WHERE pipeline_id = p_pipeline_id AND user_id = p_user_id
  );
END;
$$;

ALTER FUNCTION public.can_access_pipeline(UUID, UUID) OWNER TO postgres;

-- Policies for pipeline_members table
DROP POLICY IF EXISTS pipeline_members_select ON pipeline_members;
CREATE POLICY pipeline_members_select
  ON pipeline_members
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS pipeline_members_insert ON pipeline_members;
CREATE POLICY pipeline_members_insert
  ON pipeline_members
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS pipeline_members_delete ON pipeline_members;
CREATE POLICY pipeline_members_delete
  ON pipeline_members
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));

-- Update RLS policy for pipelines
DROP POLICY IF EXISTS pipelines_select ON pipelines;
CREATE POLICY pipelines_select
  ON pipelines
  FOR SELECT
  USING (
    is_account_member(account_id) AND can_access_pipeline(id, auth.uid())
  );

-- Update RLS policy for deals
DROP POLICY IF EXISTS deals_select ON deals;
CREATE POLICY deals_select
  ON deals
  FOR SELECT
  USING (
    is_account_member(account_id) AND can_access_pipeline(pipeline_id, auth.uid())
  );

COMMIT;
