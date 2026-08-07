-- Migration 054: Add soft delete support to internal_notes
-- Enables soft-deletion (deleted_at) and partial indexing for performance.

ALTER TABLE internal_notes
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial index for active internal notes queries (WHERE deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_internal_notes_active
ON internal_notes(conversation_id, created_at)
WHERE deleted_at IS NULL;
