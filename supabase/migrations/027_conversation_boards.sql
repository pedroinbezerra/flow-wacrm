-- ============================================================
-- 027_conversation_boards.sql
--
-- New conversation-board module:
--   - optional board groups
--   - boards with or without a group
--   - board items per conversation
--   - labels
--   - mentions
--   - ordering RPC for the kanban
--
-- The schema is intentionally additive. Existing inbox data stays
-- untouched so the new module can be built beside the current inbox.
-- ============================================================

BEGIN;

-- ============================================================
-- TYPES
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_board_lane_enum') THEN
    CREATE TYPE conversation_board_lane_enum AS ENUM (
      'partners',
      'franchisees',
      'jobs',
      'direct',
      'other'
    );
  END IF;
END $$;

-- ============================================================
-- BOARD GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_board_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_board_groups_account_slug
  ON conversation_board_groups(account_id, slug);

CREATE INDEX IF NOT EXISTS idx_conversation_board_groups_account
  ON conversation_board_groups(account_id);

ALTER TABLE conversation_board_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_board_groups_select ON conversation_board_groups;
CREATE POLICY conversation_board_groups_select
  ON conversation_board_groups
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_board_groups_insert ON conversation_board_groups;
CREATE POLICY conversation_board_groups_insert
  ON conversation_board_groups
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_groups_update ON conversation_board_groups;
CREATE POLICY conversation_board_groups_update
  ON conversation_board_groups
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_groups_delete ON conversation_board_groups;
CREATE POLICY conversation_board_groups_delete
  ON conversation_board_groups
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_updated_at ON conversation_board_groups;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON conversation_board_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- BOARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  group_id UUID REFERENCES conversation_board_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_boards_account_slug
  ON conversation_boards(account_id, slug);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_boards_group_unique
  ON conversation_boards(group_id)
  WHERE group_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_boards_account_default
  ON conversation_boards(account_id)
  WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_conversation_boards_account
  ON conversation_boards(account_id);

CREATE INDEX IF NOT EXISTS idx_conversation_boards_group
  ON conversation_boards(group_id);

ALTER TABLE conversation_boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_boards_select ON conversation_boards;
CREATE POLICY conversation_boards_select
  ON conversation_boards
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_boards_insert ON conversation_boards;
CREATE POLICY conversation_boards_insert
  ON conversation_boards
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_boards_update ON conversation_boards;
CREATE POLICY conversation_boards_update
  ON conversation_boards
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_boards_delete ON conversation_boards;
CREATE POLICY conversation_boards_delete
  ON conversation_boards
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_updated_at ON conversation_boards;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON conversation_boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_conversation_board_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_account_id UUID;
BEGIN
  IF NEW.group_id IS NOT NULL THEN
    SELECT account_id
    INTO v_group_account_id
    FROM conversation_board_groups
    WHERE id = NEW.group_id;

    IF v_group_account_id IS NULL THEN
      RAISE EXCEPTION 'Unknown board group %', NEW.group_id
        USING ERRCODE = '23503';
    END IF;

    IF NEW.account_id IS NOT NULL AND NEW.account_id <> v_group_account_id THEN
      RAISE EXCEPTION 'Board account does not match group account'
        USING ERRCODE = '23514';
    END IF;

    NEW.account_id := v_group_account_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_board_account ON conversation_boards;
CREATE TRIGGER sync_conversation_board_account
  BEFORE INSERT OR UPDATE ON conversation_boards
  FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_board_account();

ALTER FUNCTION public.sync_conversation_board_account() OWNER TO postgres;

-- ============================================================
-- BOARD ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES conversation_boards(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  lane conversation_board_lane_enum NOT NULL DEFAULT 'other',
  position INTEGER NOT NULL DEFAULT 0,
  priority_rank SMALLINT NOT NULL DEFAULT 0 CHECK (priority_rank BETWEEN 0 AND 3),
  priority_reason TEXT,
  priority_set_at TIMESTAMPTZ,
  priority_set_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  awaiting_return BOOLEAN NOT NULL DEFAULT FALSE,
  awaiting_return_reason TEXT,
  awaiting_return_set_at TIMESTAMPTZ,
  awaiting_return_set_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  awaiting_return_cleared_at TIMESTAMPTZ,
  awaiting_return_cleared_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mention_active BOOLEAN NOT NULL DEFAULT FALSE,
  mention_set_at TIMESTAMPTZ,
  mention_set_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mention_cleared_at TIMESTAMPTZ,
  mention_cleared_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_board_items_account
  ON conversation_board_items(account_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_items_board
  ON conversation_board_items(board_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_items_board_lane
  ON conversation_board_items(board_id, lane);

CREATE INDEX IF NOT EXISTS idx_conversation_board_items_board_order
  ON conversation_board_items(
    board_id,
    mention_active DESC,
    mention_set_at DESC,
    awaiting_return DESC,
    awaiting_return_set_at DESC,
    priority_rank DESC,
    priority_set_at DESC,
    position ASC,
    updated_at DESC
  );

ALTER TABLE conversation_board_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_board_items_select ON conversation_board_items;
CREATE POLICY conversation_board_items_select
  ON conversation_board_items
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_board_items_insert ON conversation_board_items;
CREATE POLICY conversation_board_items_insert
  ON conversation_board_items
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conversation_board_items_update ON conversation_board_items;
CREATE POLICY conversation_board_items_update
  ON conversation_board_items
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conversation_board_items_delete ON conversation_board_items;
CREATE POLICY conversation_board_items_delete
  ON conversation_board_items
  FOR DELETE
  USING (is_account_member(account_id, 'agent'));

DROP TRIGGER IF EXISTS set_updated_at ON conversation_board_items;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON conversation_board_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_conversation_board_item_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_board_account_id UUID;
  v_conversation_account_id UUID;
BEGIN
  SELECT account_id
  INTO v_board_account_id
  FROM conversation_boards
  WHERE id = NEW.board_id;

  IF v_board_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown board %', NEW.board_id
      USING ERRCODE = '23503';
  END IF;

  SELECT account_id
  INTO v_conversation_account_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  IF v_conversation_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown conversation %', NEW.conversation_id
      USING ERRCODE = '23503';
  END IF;

  IF v_board_account_id <> v_conversation_account_id THEN
    RAISE EXCEPTION 'Board and conversation must belong to the same account'
      USING ERRCODE = '23514';
  END IF;

  NEW.account_id := v_board_account_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_board_item_account ON conversation_board_items;
CREATE TRIGGER sync_conversation_board_item_account
  BEFORE INSERT OR UPDATE ON conversation_board_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_board_item_account();

ALTER FUNCTION public.sync_conversation_board_item_account() OWNER TO postgres;

-- ============================================================
-- LABELS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_board_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_board_labels_account_slug
  ON conversation_board_labels(account_id, slug);

CREATE INDEX IF NOT EXISTS idx_conversation_board_labels_account
  ON conversation_board_labels(account_id);

ALTER TABLE conversation_board_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_board_labels_select ON conversation_board_labels;
CREATE POLICY conversation_board_labels_select
  ON conversation_board_labels
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_board_labels_insert ON conversation_board_labels;
CREATE POLICY conversation_board_labels_insert
  ON conversation_board_labels
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_labels_update ON conversation_board_labels;
CREATE POLICY conversation_board_labels_update
  ON conversation_board_labels
  FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS conversation_board_labels_delete ON conversation_board_labels;
CREATE POLICY conversation_board_labels_delete
  ON conversation_board_labels
  FOR DELETE
  USING (is_account_member(account_id, 'admin'));

DROP TRIGGER IF EXISTS set_updated_at ON conversation_board_labels;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON conversation_board_labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- BOARD ITEM LABEL ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_board_item_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_item_id UUID NOT NULL REFERENCES conversation_board_items(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES conversation_board_labels(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_item_id, label_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_board_item_labels_account
  ON conversation_board_item_labels(account_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_item_labels_board_item
  ON conversation_board_item_labels(board_item_id);

CREATE INDEX IF NOT EXISTS idx_conversation_board_item_labels_label
  ON conversation_board_item_labels(label_id);

ALTER TABLE conversation_board_item_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_board_item_labels_select ON conversation_board_item_labels;
CREATE POLICY conversation_board_item_labels_select
  ON conversation_board_item_labels
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_board_item_labels_insert ON conversation_board_item_labels;
CREATE POLICY conversation_board_item_labels_insert
  ON conversation_board_item_labels
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conversation_board_item_labels_update ON conversation_board_item_labels;
CREATE POLICY conversation_board_item_labels_update
  ON conversation_board_item_labels
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conversation_board_item_labels_delete ON conversation_board_item_labels;
CREATE POLICY conversation_board_item_labels_delete
  ON conversation_board_item_labels
  FOR DELETE
  USING (is_account_member(account_id, 'agent'));

CREATE OR REPLACE FUNCTION public.sync_conversation_board_item_label_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_label_account_id UUID;
BEGIN
  SELECT account_id
  INTO v_account_id
  FROM conversation_board_items
  WHERE id = NEW.board_item_id;

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown board item %', NEW.board_item_id
      USING ERRCODE = '23503';
  END IF;

  SELECT account_id
  INTO v_label_account_id
  FROM conversation_board_labels
  WHERE id = NEW.label_id;

  IF v_label_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown board label %', NEW.label_id
      USING ERRCODE = '23503';
  END IF;

  IF v_account_id <> v_label_account_id THEN
    RAISE EXCEPTION 'Board item and label must belong to the same account'
      USING ERRCODE = '23514';
  END IF;

  NEW.account_id := v_account_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_board_item_label_account ON conversation_board_item_labels;
CREATE TRIGGER sync_conversation_board_item_label_account
  BEFORE INSERT OR UPDATE ON conversation_board_item_labels
  FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_board_item_label_account();

ALTER FUNCTION public.sync_conversation_board_item_label_account() OWNER TO postgres;

-- ============================================================
-- MENTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_item_id UUID NOT NULL REFERENCES conversation_board_items(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mention_text TEXT,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_item_id, message_id, mentioned_user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_mentions_account
  ON conversation_mentions(account_id);

CREATE INDEX IF NOT EXISTS idx_conversation_mentions_board_item
  ON conversation_mentions(board_item_id);

CREATE INDEX IF NOT EXISTS idx_conversation_mentions_pending
  ON conversation_mentions(board_item_id, created_at DESC)
  WHERE acknowledged_at IS NULL;

ALTER TABLE conversation_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_mentions_select ON conversation_mentions;
CREATE POLICY conversation_mentions_select
  ON conversation_mentions
  FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conversation_mentions_insert ON conversation_mentions;
CREATE POLICY conversation_mentions_insert
  ON conversation_mentions
  FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conversation_mentions_update ON conversation_mentions;
CREATE POLICY conversation_mentions_update
  ON conversation_mentions
  FOR UPDATE
  USING (is_account_member(account_id, 'agent'))
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conversation_mentions_delete ON conversation_mentions;
CREATE POLICY conversation_mentions_delete
  ON conversation_mentions
  FOR DELETE
  USING (is_account_member(account_id, 'agent'));

CREATE OR REPLACE FUNCTION public.sync_conversation_board_mention_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_mentioned_account_id UUID;
  v_conversation_id UUID;
BEGIN
  SELECT account_id, conversation_id
  INTO v_account_id, v_conversation_id
  FROM conversation_board_items
  WHERE id = NEW.board_item_id;

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown board item %', NEW.board_item_id
      USING ERRCODE = '23503';
  END IF;

  SELECT account_id
  INTO v_mentioned_account_id
  FROM profiles
  WHERE user_id = NEW.mentioned_user_id;

  IF v_mentioned_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown mentioned user %', NEW.mentioned_user_id
      USING ERRCODE = '23503';
  END IF;

  IF v_account_id <> v_mentioned_account_id THEN
    RAISE EXCEPTION 'Mentioned user must belong to the same account as the board item'
      USING ERRCODE = '23514';
  END IF;

  NEW.account_id := v_account_id;
  NEW.conversation_id := v_conversation_id;

  UPDATE conversation_board_items
  SET mention_active = TRUE,
      mention_set_at = NEW.created_at,
      mention_set_by_user_id = NEW.mentioned_user_id,
      mention_cleared_at = NULL,
      mention_cleared_by_user_id = NULL,
      updated_at = NOW()
  WHERE id = NEW.board_item_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_conversation_board_mention ON conversation_mentions;
CREATE TRIGGER sync_conversation_board_mention
  BEFORE INSERT ON conversation_mentions
  FOR EACH ROW EXECUTE FUNCTION public.sync_conversation_board_mention_account();

ALTER FUNCTION public.sync_conversation_board_mention_account() OWNER TO postgres;

-- ============================================================
-- ORDERING RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_conversation_board_items(
  p_board_id UUID,
  p_lane conversation_board_lane_enum DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  board_item conversation_board_items,
  conversation conversations,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH matched AS (
    SELECT
      bi.id,
      count(*) OVER() AS total_count,
      bi.mention_active,
      bi.mention_set_at,
      bi.awaiting_return,
      bi.awaiting_return_set_at,
      bi.priority_rank,
      bi.priority_set_at,
      bi.position,
      bi.created_at
    FROM conversation_board_items bi
    WHERE bi.board_id = p_board_id
      AND (p_lane IS NULL OR bi.lane = p_lane)
  ),
  page AS (
    SELECT *
    FROM matched
    ORDER BY
      mention_active DESC,
      mention_set_at DESC NULLS LAST,
      awaiting_return DESC,
      awaiting_return_set_at DESC NULLS LAST,
      priority_rank DESC,
      priority_set_at DESC NULLS LAST,
      position ASC,
      created_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT bi AS board_item, c AS conversation, page.total_count
  FROM page
  JOIN conversation_board_items bi ON bi.id = page.id
  JOIN conversations c ON c.id = bi.conversation_id
  ORDER BY
    page.mention_active DESC,
    page.mention_set_at DESC NULLS LAST,
    page.awaiting_return DESC,
    page.awaiting_return_set_at DESC NULLS LAST,
    page.priority_rank DESC,
    page.priority_set_at DESC NULLS LAST,
    page.position ASC,
    page.created_at DESC;
$$;

ALTER FUNCTION public.get_conversation_board_items(UUID, conversation_board_lane_enum, INT, INT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_conversation_board_items(UUID, conversation_board_lane_enum, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_conversation_board_items(UUID, conversation_board_lane_enum, INT, INT) TO authenticated;

COMMIT;
