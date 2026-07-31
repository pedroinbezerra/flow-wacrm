-- ============================================================
-- 044_private_ai_service_media.sql
--
-- Closes exposure on `ai-service-media` bucket (created in 036).
-- Flips the bucket to private and replaces the public SELECT policy
-- with an account-membership check matching the existing INSERT/DELETE policies.
--
-- Idempotent — safe to re-run.
-- ============================================================

-- 1. Flip bucket to private
UPDATE storage.buckets SET public = false WHERE id = 'ai-service-media';

-- 2. Replace public SELECT policy with member-scoped SELECT policy
DROP POLICY IF EXISTS "AI service media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Members can view AI service media" ON storage.objects;

CREATE POLICY "Members can view AI service media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ai-service-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND ('account-' || p.account_id::text) = (storage.foldername(name))[1]
    )
  );
