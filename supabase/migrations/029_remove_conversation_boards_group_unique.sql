BEGIN;

DROP INDEX IF EXISTS idx_conversation_boards_group_unique;

CREATE INDEX IF NOT EXISTS idx_conversation_boards_group
  ON conversation_boards(group_id);

COMMIT;
