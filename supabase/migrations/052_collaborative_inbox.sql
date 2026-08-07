-- ============================================================
-- 052_collaborative_inbox.sql — Collaborative Inbox (Atendimento Colaborativo)
--
-- Implements FlowHub Collaborative Support:
--   - Multi-agent conversation participation (conversation_participants)
--   - Team internal notes with @mentions (internal_notes)
--   - Notification center for team members (notifications)
--   - Operational timeline audit log (conversation_timeline_events)
--   - Internal reactions on messages and notes (internal_reactions)
--   - Organizational message tags (message_tags)
--   - Response reservations to prevent collision (response_reservations)
-- ============================================================

-- ---- 1. CONVERSATION PARTICIPANTS ----------------------------
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('owner', 'participant', 'observer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT conversation_participants_unique UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_part_account ON conversation_participants(account_id);
CREATE INDEX IF NOT EXISTS idx_conv_part_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_part_user ON conversation_participants(user_id);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conv_part_select ON conversation_participants;
CREATE POLICY conv_part_select ON conversation_participants FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS conv_part_insert ON conversation_participants;
CREATE POLICY conv_part_insert ON conversation_participants FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conv_part_update ON conversation_participants;
CREATE POLICY conv_part_update ON conversation_participants FOR UPDATE
  USING (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS conv_part_delete ON conversation_participants;
CREATE POLICY conv_part_delete ON conversation_participants FOR DELETE
  USING (is_account_member(account_id, 'agent'));

-- ---- 2. INTERNAL NOTES ---------------------------------------
CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_account ON internal_notes(account_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_conversation ON internal_notes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_author ON internal_notes(author_id);

ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS internal_notes_select ON internal_notes;
CREATE POLICY internal_notes_select ON internal_notes FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS internal_notes_insert ON internal_notes;
CREATE POLICY internal_notes_insert ON internal_notes FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS internal_notes_update ON internal_notes;
CREATE POLICY internal_notes_update ON internal_notes FOR UPDATE
  USING (is_account_member(account_id, 'agent') AND author_id = auth.uid());

DROP POLICY IF EXISTS internal_notes_delete ON internal_notes;
CREATE POLICY internal_notes_delete ON internal_notes FOR DELETE
  USING (is_account_member(account_id, 'agent') AND author_id = auth.uid());

-- ---- 3. NOTIFICATIONS ---------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention', 'assignment', 'help_request', 'task', 'response')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_account ON notifications(account_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_conversation ON notifications(conversation_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid() AND is_account_member(account_id));

DROP POLICY IF EXISTS notifications_insert ON notifications;
CREATE POLICY notifications_insert ON notifications FOR INSERT
  WITH CHECK (is_account_member(account_id));

DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid() AND is_account_member(account_id));

DROP POLICY IF EXISTS notifications_delete ON notifications;
CREATE POLICY notifications_delete ON notifications FOR DELETE
  USING (user_id = auth.uid() AND is_account_member(account_id));

-- ---- 4. CONVERSATION TIMELINE EVENTS -------------------------
CREATE TABLE IF NOT EXISTS conversation_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_account ON conversation_timeline_events(account_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_conversation ON conversation_timeline_events(conversation_id, created_at DESC);

ALTER TABLE conversation_timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS timeline_events_select ON conversation_timeline_events;
CREATE POLICY timeline_events_select ON conversation_timeline_events FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS timeline_events_insert ON conversation_timeline_events;
CREATE POLICY timeline_events_insert ON conversation_timeline_events FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

-- ---- 5. INTERNAL REACTIONS -----------------------------------
CREATE TABLE IF NOT EXISTS internal_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('message', 'note')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT internal_reactions_unique UNIQUE (target_type, target_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_internal_reactions_account ON internal_reactions(account_id);
CREATE INDEX IF NOT EXISTS idx_internal_reactions_target ON internal_reactions(target_type, target_id);

ALTER TABLE internal_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS internal_reactions_select ON internal_reactions;
CREATE POLICY internal_reactions_select ON internal_reactions FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS internal_reactions_insert ON internal_reactions;
CREATE POLICY internal_reactions_insert ON internal_reactions FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS internal_reactions_delete ON internal_reactions;
CREATE POLICY internal_reactions_delete ON internal_reactions FOR DELETE
  USING (user_id = auth.uid() AND is_account_member(account_id, 'agent'));

-- ---- 6. MESSAGE TAGS ----------------------------------------
CREATE TABLE IF NOT EXISTS message_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT message_tags_unique UNIQUE (message_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_message_tags_account ON message_tags(account_id);
CREATE INDEX IF NOT EXISTS idx_message_tags_message ON message_tags(message_id);

ALTER TABLE message_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS message_tags_select ON message_tags;
CREATE POLICY message_tags_select ON message_tags FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS message_tags_insert ON message_tags;
CREATE POLICY message_tags_insert ON message_tags FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS message_tags_delete ON message_tags;
CREATE POLICY message_tags_delete ON message_tags FOR DELETE
  USING (is_account_member(account_id, 'agent'));

-- ---- 7. RESPONSE RESERVATIONS -------------------------------
CREATE TABLE IF NOT EXISTS response_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT response_reservations_unique UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_response_reservations_conv ON response_reservations(conversation_id);

ALTER TABLE response_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS response_reservations_select ON response_reservations;
CREATE POLICY response_reservations_select ON response_reservations FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS response_reservations_insert ON response_reservations;
CREATE POLICY response_reservations_insert ON response_reservations FOR INSERT
  WITH CHECK (is_account_member(account_id, 'agent'));

DROP POLICY IF EXISTS response_reservations_delete ON response_reservations;
CREATE POLICY response_reservations_delete ON response_reservations FOR DELETE
  USING (is_account_member(account_id, 'agent'));

-- ---- 8. REALTIME PUBLICATION --------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'internal_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE internal_notes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_timeline_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_timeline_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'internal_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE internal_reactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'message_tags'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE message_tags;
  END IF;
END $$;
