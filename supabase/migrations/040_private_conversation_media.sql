-- ============================================================
-- 040_private_conversation_media.sql
--
-- Closes a real exposure: `chat-media` (023) and `flow-media` (016/020)
-- were created as PUBLIC buckets so Meta's servers could fetch the
-- `link` at send time without auth. Public read means anyone who
-- obtains an object's URL (log leakage, referrer, shared screenshot,
-- browser history sync, etc.) can view a customer's conversation
-- media with no login at all — it never required account membership,
-- just the URL string.
--
-- This migration flips both buckets to private and replaces the
-- "* is publicly readable" SELECT policy with an account-membership
-- check (same predicate shape already used by the INSERT/UPDATE/DELETE
-- policies on these buckets). Meta still gets a fetchable link because
-- the app now generates a short-lived *signed* URL at the moment of
-- send/submit (see src/lib/storage/media-access.ts) instead of relying
-- on a permanent public URL — service-role signing bypasses RLS, so
-- these SELECT policies exist for defense-in-depth (any future
-- authenticated-client read) rather than being load-bearing for Meta
-- delivery.
--
-- NOTE: objects already fetched/cached by Meta's CDN before this
-- migration can't be retroactively un-exposed. This closes the
-- exposure going forward.
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ============================================================
-- 1. Flip both buckets to private
-- ============================================================
UPDATE storage.buckets SET public = false WHERE id = 'chat-media';
UPDATE storage.buckets SET public = false WHERE id = 'flow-media';

-- ============================================================
-- 2. chat-media — replace public SELECT with member-scoped SELECT
--    (single path convention: account-<account_id>/..., per migration 023)
-- ============================================================
DROP POLICY IF EXISTS "Chat media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Members can view chat media" ON storage.objects;
CREATE POLICY "Members can view chat media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND ('account-' || p.account_id::text) = (storage.foldername(name))[1]
    )
  );

-- ============================================================
-- 3. flow-media — replace public SELECT with member-scoped SELECT.
--    Accepts both path conventions (account-<uuid>/... and the legacy
--    <auth.uid()>/...) same as the write policies from migration 020.
-- ============================================================
DROP POLICY IF EXISTS "Flow media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Members can view flow media" ON storage.objects;
CREATE POLICY "Members can view flow media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'flow-media'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND ('account-' || p.account_id::text) = (storage.foldername(name))[1]
      )
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
  );
