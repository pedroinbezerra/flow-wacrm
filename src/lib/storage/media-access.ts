/**
 * Server-only access helpers for the private `chat-media` / `flow-media`
 * Storage buckets (see migration 040_private_conversation_media.sql).
 *
 * Both buckets used to be PUBLIC so Meta's servers could fetch a
 * message's media `link` without auth. That also meant anyone who
 * obtained the object's URL — no login required — could view it.
 * Migration 040 flips both buckets to private; this module is how the
 * server keeps things working afterwards:
 *
 *   - `getSignedMediaUrl` mints a short-lived, token-bearing URL via the
 *     service-role client (bypasses RLS — the caller is always our own
 *     server code that has already checked account ownership upstream).
 *     Meta fetches this URL exactly once, immediately, at send/submit
 *     time — a few minutes of validity is plenty.
 *   - `resolveSendableMediaLink` accepts whatever is stored today —
 *     either a legacy public Storage URL (pre-040 data, still present
 *     in old messages/templates/flow node configs) or our own
 *     `/api/media/<bucket>/<path>` proxy path — and turns it into a
 *     fresh signed URL. Falls back to the original value when it
 *     doesn't recognize the shape (e.g. some future external URL)
 *     rather than throwing, so an unrecognized value never hard-fails
 *     a send.
 *
 * This file imports the service-role client, so it must never be
 * imported from client components — use `./media-src` (pure, no
 * server imports) for anything that runs in the browser.
 */

import { supabaseAdmin } from '@/lib/flows/admin-client'
import { isSignableBucket, parseStorageReference } from './media-src'

export {
  SIGNABLE_BUCKETS,
  isSignableBucket,
  parseStorageReference,
  toProxyPath,
  normalizeMediaSrc,
  type SignableBucket,
} from './media-src'

/**
 * Mints a signed URL for an object in one of our own buckets. Uses the
 * service-role client — this is only ever called from server code that
 * has already established the caller owns the account the path belongs
 * to (message/template/flow-node lookups are all account-scoped before
 * we ever reach this point).
 */
export async function getSignedMediaUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 300,
): Promise<string> {
  const { data, error } = await supabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(path, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(
      `Failed to sign media URL for ${bucket}/${path}: ${error?.message ?? 'unknown error'}`,
    )
  }
  let signedUrl = data.signedUrl
  if (signedUrl.startsWith('/')) {
    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
    signedUrl = `${baseUrl}${signedUrl}`
  }
  return signedUrl
}

/**
 * Resolves any stored media reference into a URL that's fetchable RIGHT
 * NOW by an external party (Meta). Handles both legacy public URLs and
 * our proxy-path format transparently, so old data keeps working with
 * no backfill required.
 *
 * Never throws — an unresolvable or foreign value is returned as-is
 * (logged) so a value we don't recognize doesn't hard-fail a send.
 */
export async function resolveSendableMediaLink(
  value: string,
  expiresInSeconds = 300,
): Promise<string> {
  const parsed = parseStorageReference(value)
  if (!parsed || !isSignableBucket(parsed.bucket)) {
    return value
  }
  try {
    return await getSignedMediaUrl(parsed.bucket, parsed.path, expiresInSeconds)
  } catch (err) {
    console.error(
      '[media-access] failed to sign media URL, falling back to stored value:',
      err instanceof Error ? err.message : err,
    )
    return value
  }
}
