-- Migration 055: WhatsApp & Internal Media Storage Architecture
-- Adds explicit media lifecycle tracking, storage path references, provider info,
-- and lease-lock mechanisms for non-blocking asynchronous media capture.

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS media_status TEXT CHECK (media_status IN ('pending', 'processing', 'stored', 'failed', 'expired')),
  ADD COLUMN IF NOT EXISTS media_source TEXT DEFAULT 'whatsapp_inbound',
  ADD COLUMN IF NOT EXISTS media_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS media_storage_provider TEXT DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS media_meta_id TEXT,
  ADD COLUMN IF NOT EXISTS media_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS media_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS media_hash TEXT,
  ADD COLUMN IF NOT EXISTS media_retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS media_next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS media_error_message TEXT;

-- Optimized partial index for worker queue fetching & lease recovery
CREATE INDEX IF NOT EXISTS idx_messages_media_processing_queue
  ON messages(media_next_retry_at, locked_until)
  WHERE media_status IN ('pending', 'processing');

-- Backfill legacy records: messages with media_url already present get default status
UPDATE messages
SET media_status = 'stored', media_storage_provider = 'supabase'
WHERE media_url IS NOT NULL AND media_status IS NULL;
