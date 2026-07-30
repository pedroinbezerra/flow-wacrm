-- ============================================================
-- 036_smart_ai_service.sql
--
-- Módulo de Atendimento Inteligente (AI Assistant)
-- Adds configuration, knowledge base, media library, and conversation handoff status.
-- ============================================================

-- 1. AI Service Configuration Table (BYOK + Business Persona)
CREATE TABLE IF NOT EXISTS public.ai_service_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  company_name TEXT NOT NULL DEFAULT '',
  business_segment TEXT NOT NULL DEFAULT '',
  service_goal TEXT NOT NULL DEFAULT '',
  communication_style TEXT NOT NULL DEFAULT '',
  service_rules TEXT NOT NULL DEFAULT '',
  limitations TEXT NOT NULL DEFAULT '',
  handoff_instructions TEXT NOT NULL DEFAULT '',
  openai_api_key TEXT,
  openai_api_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
  openai_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  temperature NUMERIC NOT NULL DEFAULT 0.3,
  max_tokens INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ai_service_config_account_id_unique UNIQUE (account_id)
);

ALTER TABLE public.ai_service_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view account ai service config" ON public.ai_service_config;
CREATE POLICY "Members can view account ai service config"
  ON public.ai_service_config FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS "Members can insert account ai service config" ON public.ai_service_config;
CREATE POLICY "Members can insert account ai service config"
  ON public.ai_service_config FOR INSERT
  WITH CHECK (is_account_member(account_id, 'admin'));

DROP POLICY IF EXISTS "Members can update account ai service config" ON public.ai_service_config;
CREATE POLICY "Members can update account ai service config"
  ON public.ai_service_config FOR UPDATE
  USING (is_account_member(account_id, 'admin'))
  WITH CHECK (is_account_member(account_id, 'admin'));

-- 2. AI Knowledge Base Table
CREATE TABLE IF NOT EXISTS public.ai_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Geral',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_account ON public.ai_knowledge_base(account_id);

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage account ai knowledge base" ON public.ai_knowledge_base;
CREATE POLICY "Members can manage account ai knowledge base"
  ON public.ai_knowledge_base FOR ALL
  USING (is_account_member(account_id));

-- 3. AI Media Library Table
CREATE TABLE IF NOT EXISTS public.ai_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  media_url TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_media_library_account ON public.ai_media_library(account_id);

ALTER TABLE public.ai_media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage account ai media library" ON public.ai_media_library;
CREATE POLICY "Members can manage account ai media library"
  ON public.ai_media_library FOR ALL
  USING (is_account_member(account_id));

-- 4. Extend Conversations Table with AI Handler Status
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS ai_handler_status TEXT NOT NULL DEFAULT 'ai' CHECK (ai_handler_status IN ('ai', 'human')),
  ADD COLUMN IF NOT EXISTS ai_handoff_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_handoff_reason TEXT;

-- 5. Storage Bucket for AI Service Media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-service-media',
  'ai-service-media',
  TRUE,
  16777216, -- 16 MB
  ARRAY[
    'image/png', 'image/jpeg', 'image/webp',
    'video/mp4', 'video/3gpp',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "AI service media is publicly readable" ON storage.objects;
CREATE POLICY "AI service media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-service-media');

DROP POLICY IF EXISTS "Members can upload AI service media" ON storage.objects;
CREATE POLICY "Members can upload AI service media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ai-service-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND ('account-' || p.account_id::text) = (storage.foldername(name))[1]
    )
  );

DROP POLICY IF EXISTS "Members can delete AI service media" ON storage.objects;
CREATE POLICY "Members can delete AI service media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ai-service-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND ('account-' || p.account_id::text) = (storage.foldername(name))[1]
    )
  );
