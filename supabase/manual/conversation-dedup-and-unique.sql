-- conversation-dedup-and-unique.sql
-- Purpose:
-- 1) Keep only one conversation per (account_id, contact_id)
-- 2) Repoint dependent messages to the kept conversation
-- 3) Remove duplicated conversation rows
-- 4) Enforce uniqueness moving forward
--
-- Run in a maintenance window.

BEGIN;

-- Pick the newest conversation per (account_id, contact_id) as canonical.
WITH ranked AS (
  SELECT
    id,
    account_id,
    contact_id,
    ROW_NUMBER() OVER (
      PARTITION BY account_id, contact_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn,
    FIRST_VALUE(id) OVER (
      PARTITION BY account_id, contact_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS keep_id
  FROM conversations
),
repoint AS (
  UPDATE messages m
  SET conversation_id = r.keep_id
  FROM ranked r
  WHERE m.conversation_id = r.id
    AND r.rn > 1
  RETURNING m.id
)
DELETE FROM conversations c
USING ranked r
WHERE c.id = r.id
  AND r.rn > 1;

-- Enforce one conversation per contact within each account.
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_account_contact_unique
  ON conversations(account_id, contact_id);

COMMIT;
