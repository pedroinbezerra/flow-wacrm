-- ============================================================
-- 028_conversation_board_lanes.sql
--
-- Adds customizable lanes per board:
--   - lane definitions owned by each board
--   - board items reference lane_id (instead of fixed enum only)
--   - backfill from legacy enum lane values
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS conversation_board_lanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES conversation_boards(id) ON DELETE CASCADE,
  lane_key TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748b',
  position INTEGER NOT NULL DEFAULT 0,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, lane_key)
);

CREATE INDEX IF NOT EXISTS idx_conversation_board_lanes_account
  ON conversation_board_lanes(account_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_lanes_board
  ON conversation_board_lanes(board_id, position);

ALTER TABLE conversation_board_lanes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_board_lanes_select ON conversation_board_lanes;
CREATE POLICY conversation_board_lanes_select
  ON conversation_board_lanes
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_board_lanes_insert ON conversation_board_lanes;
CREATE POLICY conversation_board_lanes_insert
  ON conversation_board_lanes
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_lanes_update ON conversation_board_lanes;
CREATE POLICY conversation_board_lanes_update
  ON conversation_board_lanes
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_lanes_delete ON conversation_board_lanes;
CREATE POLICY conversation_board_lanes_delete
  ON conversation_board_lanes
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_updated_at ON conversation_board_lanes;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON conversation_board_lanes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_conversation_board_lane_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_board_account_id UUID;
BEGIN
  SELECT account_id
  INTO v_board_account_id
  FROM conversation_boards
  WHERE id = NEW.board_id;

  IF v_board_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown board %', NEW.board_id
      USING ERRCODE = '23503';
  END IF;

  NEW.account_id := v_board_account_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_board_lane_account ON conversation_board_lanes;
CREATE TRIGGER sync_conversation_board_lane_account
  BEFORE INSERT OR UPDATE ON conversation_board_lanes
  FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_board_lane_account();

ALTER FUNCTION public.sync_conversation_board_lane_account() OWNER TO postgres;

ALTER TABLE conversation_board_items
  ADD COLUMN IF NOT EXISTS lane_id UUID REFERENCES conversation_board_lanes(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_conversation_board_items_board_lane_id
  ON conversation_board_items(board_id, lane_id);

INSERT INTO conversation_board_lanes (
  account_id,
  board_id,
  lane_key,
  name,
  color,
  position
)
SELECT
  b.account_id,
  b.id,
  seed.lane_key,
  seed.name,
  seed.color,
  seed.position
FROM conversation_boards b
CROSS JOIN (
  VALUES
    ('partners', 'Parceiros', '#0ea5e9', 0),
    ('franchisees', 'Franqueados', '#8b5cf6', 1),
    ('jobs', 'Jobs', '#f59e0b', 2),
    ('direct', 'Conversas diretas', '#10b981', 3),
    ('other', 'Outros', '#64748b', 4)
) AS seed(lane_key, name, color, position)
ON CONFLICT (board_id, lane_key) DO NOTHING;

UPDATE conversation_board_items i
SET lane_id = l.id
FROM conversation_board_lanes l
WHERE i.board_id = l.board_id
  AND l.lane_key = i.lane::TEXT
  AND i.lane_id IS NULL;

UPDATE conversation_board_items i
SET lane_id = (
  SELECT l.id
  FROM conversation_board_lanes l
  WHERE l.board_id = i.board_id
  ORDER BY l.position ASC, l.created_at ASC
  LIMIT 1
)
WHERE i.lane_id IS NULL;

ALTER TABLE conversation_board_items
  ALTER COLUMN lane_id SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_conversation_board_item_lane()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lane conversation_board_lanes%ROWTYPE;
BEGIN
  SELECT *
  INTO v_lane
  FROM conversation_board_lanes
  WHERE id = NEW.lane_id;

  IF v_lane.id IS NULL THEN
    RAISE EXCEPTION 'Unknown board lane %', NEW.lane_id
      USING ERRCODE = '23503';
  END IF;

  IF NEW.board_id <> v_lane.board_id THEN
    RAISE EXCEPTION 'Board item and lane must belong to same board'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.account_id <> v_lane.account_id THEN
    RAISE EXCEPTION 'Board item and lane must belong to same account'
      USING ERRCODE = '23514';
  END IF;

  IF v_lane.lane_key IN ('partners', 'franchisees', 'jobs', 'direct', 'other') THEN
    NEW.lane := v_lane.lane_key::conversation_board_lane_enum;
  ELSE
    NEW.lane := 'other';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_board_item_lane ON conversation_board_items;
CREATE TRIGGER sync_conversation_board_item_lane
  BEFORE INSERT OR UPDATE ON conversation_board_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_board_item_lane();

ALTER FUNCTION public.sync_conversation_board_item_lane() OWNER TO postgres;

COMMIT;
