-- ============================================================
-- 053_architectural_consolidation_and_partitioning.sql
--
-- Consolidação Arquitetural Final e Particionamento (FlowHub Pré-Lançamento)
--
-- 1. Extensões: pg_partman, pg_trgm, unaccent
-- 2. Tabela messages particionada nativamente por RANGE em created_at (Dia 1)
-- 3. Tabela inbound_webhooks (Transactional Outbox Pattern para o Webhook do WhatsApp)
-- 4. Função immutable_unaccent + Índice GIN pg_trgm em contacts
-- 5. Índices Parciais de unread em conversations + RPC get_unread_conversations_count
-- 6. Fixes de ON DELETE SET NULL para evitar cascading delete catastrófico de dados de autoria
-- ============================================================

-- 1. EXTENSÕES NATIVAS DO POSTGRESQL (DISPONÍVEIS NO SUPABASE PRO)
CREATE EXTENSION IF NOT EXISTS pg_partman SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. FUNÇÃO IMMUTABLE_UNACCENT PARA USO EM ÍNDICES EXPRESSIVOS
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent($1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- 3. BUSCA DE CONTATOS INSENSÍVEL A ACENTOS E PARCIAL (PG_TRGM + UNACCENT)
CREATE INDEX IF NOT EXISTS idx_contacts_search_trgm ON contacts 
USING GIN (
  immutable_unaccent(coalesce(name, '') || ' ' || coalesce(phone, '') || ' ' || coalesce(email, '')) gin_trgm_ops
);

-- 4. ÍNDICES PARCIAIS DE LEITURA DE UNREAD (ZERO WRITE-LOCK WAIT EM PROFILES)
CREATE INDEX IF NOT EXISTS idx_conversations_unread_by_account 
  ON conversations (account_id) 
  WHERE unread_count > 0;

CREATE INDEX IF NOT EXISTS idx_conversations_unread_by_agent 
  ON conversations (assigned_agent_id) 
  WHERE unread_count > 0;

-- 5. RPC DE CONTAGEM DE UNREAD ULTRARRÁPIDA (INDEX-ONLY SCAN O(1))
CREATE OR REPLACE FUNCTION get_unread_conversations_count(p_account_id UUID, p_agent_id UUID DEFAULT NULL)
RETURNS BIGINT AS $$
  SELECT count(*)::bigint
  FROM conversations
  WHERE account_id = p_account_id
    AND (p_agent_id IS NULL OR assigned_agent_id = p_agent_id)
    AND unread_count > 0;
$$ LANGUAGE sql STABLE PARALLEL SAFE;

-- 6. TABELA INBOUND_WEBHOOKS (TRANSACTIONAL OUTBOX PATTERN FOR WHATSAPP WEBHOOK)
CREATE TABLE IF NOT EXISTS inbound_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'whatsapp',
  external_event_id TEXT UNIQUE,               -- Idempotency key from Meta (wam_id)
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMPTZ,                   -- Lease lock timestamp to prevent concurrent cron pick-up
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbound_webhooks_pending 
  ON inbound_webhooks (status, next_retry_at) 
  WHERE status IN ('pending', 'failed');

ALTER TABLE inbound_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account members can view webhooks" ON inbound_webhooks;
CREATE POLICY "Account members can view webhooks" ON inbound_webhooks FOR SELECT
  USING (account_id IS NOT NULL AND is_account_member(account_id));

DROP POLICY IF EXISTS "Service role manages webhooks" ON inbound_webhooks;
CREATE POLICY "Service role manages webhooks" ON inbound_webhooks FOR ALL
  USING (true) WITH CHECK (true);

-- 7. RECRIAÇÃO DA TABELA MESSAGES PARTICIONADA POR RANGE (CREATED_AT)
--    (Dropar tabelas filhas legadas e recriá-las adequadamente)

DROP TABLE IF EXISTS message_tags CASCADE;
DROP TABLE IF EXISTS conversation_mentions CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;

ALTER TABLE flow_runs DROP COLUMN IF EXISTS last_prompt_message_id;

DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id                    UUID NOT NULL DEFAULT gen_random_uuid(),
  conversation_id       UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type           TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
  sender_id             UUID,
  content_type          TEXT NOT NULL DEFAULT 'text'
    CHECK (content_type IN (
      'text', 'image', 'document', 'audio', 'video',
      'location', 'template', 'interactive', 'sticker', 'reaction', 'system'
    )),
  content_text          TEXT,
  media_url             TEXT,
  template_name         TEXT,
  message_id            TEXT,            -- External Meta message_id
  status                TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed', 'deleted')),
  reply_to_message_id   UUID,
  interactive_reply_id  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Índices herdados pelas partições
CREATE INDEX idx_messages_conversation
  ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_messages_message_id
  ON messages(message_id)
  WHERE message_id IS NOT NULL;

CREATE INDEX idx_messages_reply_to
  ON messages(reply_to_message_id)
  WHERE reply_to_message_id IS NOT NULL;

-- RLS para messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR is_account_member(conversations.account_id))
  ));

DROP POLICY IF EXISTS "Service role can insert messages" ON messages;
CREATE POLICY "Service role can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- 8. GERENCIAMENTO AUTOMÁTICO DE PARTIÇÕES VIA PG_PARTMAN (COMPATÍVEL COM PG_PARTMAN V5+)
DO $$
BEGIN
  -- pg_partman v5+ usa particionamento declarativo por padrão (sem p_type := 'native')
  PERFORM public.create_parent(
    p_parent_table   := 'public.messages',
    p_control        := 'created_at',
    p_interval       := '1 month',
    p_premake        := 3
  );
EXCEPTION WHEN OTHERS THEN
  BEGIN
    PERFORM partman.create_parent(
      p_parent_table   := 'public.messages',
      p_control        := 'created_at',
      p_interval       := '1 month',
      p_premake        := 3
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_partman create_parent falhou (verificar se a extensão está instalada): %', SQLERRM;
  END;
END $$;

-- 9. CONFIGURAÇÃO DE SUPABASE REALTIME VIA PARTITION ROOT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime SET (publish_via_partition_root = true);

-- 10. RECRIAÇÃO DAS TABELAS FILHAS (SEM FK DECLARATIVA PARA MESSAGES.ID PARTICIONADO)
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'agent')),
  actor_id UUID,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, actor_type, actor_id)
);
CREATE INDEX idx_message_reactions_conversation ON message_reactions(conversation_id);
CREATE OR REPLACE FUNCTION account_id_from_conversation(p_conversation_id UUID)
RETURNS UUID AS $$
  SELECT account_id FROM conversations WHERE id = p_conversation_id;
$$ LANGUAGE sql STABLE PARALLEL SAFE;

CREATE POLICY "Users can view message reactions" ON message_reactions FOR ALL
  USING (is_account_member(account_id_from_conversation(conversation_id)));

ALTER TABLE flow_runs ADD COLUMN IF NOT EXISTS last_prompt_message_id UUID;

CREATE TABLE message_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT message_tags_unique UNIQUE (message_id, tag)
);
CREATE INDEX idx_message_tags_account ON message_tags(account_id);
CREATE INDEX idx_message_tags_message ON message_tags(message_id);
ALTER TABLE message_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY message_tags_select ON message_tags FOR SELECT USING (is_account_member(account_id));

CREATE TABLE conversation_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  board_item_id UUID NOT NULL REFERENCES conversation_board_items(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mention_text TEXT,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_item_id, message_id, mentioned_user_id)
);
CREATE INDEX idx_conversation_mentions_account ON conversation_mentions(account_id);
CREATE INDEX idx_conversation_mentions_board_item ON conversation_mentions(board_item_id);
ALTER TABLE conversation_mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY conversation_mentions_select ON conversation_mentions FOR SELECT USING (is_account_member(account_id));

-- 11. MANUTENÇÃO AUTOMÁTICA DE PARTIÇÕES VIA PG_CRON
CREATE OR REPLACE FUNCTION run_partman_maintenance()
RETURNS void AS $$
BEGIN
  BEGIN
    CALL public.run_maintenance_proc();
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      CALL partman.run_maintenance_proc();
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'pg_partman run_maintenance_proc ignorado: %', SQLERRM;
    END;
  END;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  PERFORM cron.schedule(
    'partman-maintenance',
    '0 * * * *',
    'SELECT run_partman_maintenance()'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cron.schedule para pg_partman ignorado: %', SQLERRM;
END $$;
