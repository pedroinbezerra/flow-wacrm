/**
 * Pure, client-safe helpers for referencing objects in the private
 * `chat-media` / `flow-media` buckets (migration 040). No server-only
 * imports here (no service-role client) — this file is imported by
 * both client components (message-composer, node-config-form,
 * message-bubble) and server code (see media-access.ts, which
 * re-exports these and adds the signing functions that DO need the
 * service-role client).
 */

/** The only buckets this module knows how to sign for. */
export const SIGNABLE_BUCKETS = ['chat-media', 'flow-media'] as const
export type SignableBucket = (typeof SIGNABLE_BUCKETS)[number]

export function isSignableBucket(value: string): value is SignableBucket {
  return (SIGNABLE_BUCKETS as readonly string[]).includes(value)
}

/**
 * Extracts `{ bucket, path }` from either shape we've ever stored:
 *   - a Supabase public Storage URL:
 *     https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
 *   - our own authenticated proxy path: /api/media/<bucket>/<path>
 *
 * Returns null for anything else (already-signed URLs, external URLs,
 * empty values) — callers treat null as "don't know how to resolve
 * this, use it as-is."
 */
export function parseStorageReference(
  value: string | null | undefined,
): { bucket: string; path: string } | null {
  if (!value) return null

  const publicMatch = value.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (publicMatch) {
    return { bucket: publicMatch[1], path: decodeURIComponent(publicMatch[2]) }
  }

  const proxyMatch = value.match(/(?:^|\/)api\/media\/([^/]+)\/(.+)$/)
  if (proxyMatch) {
    return { bucket: proxyMatch[1], path: decodeURIComponent(proxyMatch[2]) }
  }

  return null
}

/** Builds the durable, renderable reference we persist going forward. */
export function toProxyPath(bucket: string, path: string): string {
  return `/api/media/${bucket}/${path}`
}

/**
 * UI-side normalizer: given whatever is stored in `media_url` (old
 * public-Storage URL from before migration 040, or our new proxy path,
 * or some unrelated external URL), returns something safe to hand
 * straight to `<img src>` / `<audio src>` / `<a href>`.
 *
 * New rows already store a proxy path and pass through unchanged. Old
 * rows with a direct public-Storage URL are rewritten to the proxy
 * path on the fly — no DB backfill needed, and no broken images in
 * message history after the bucket went private.
 */
export function normalizeMediaSrc(value: string | null | undefined): string | null {
  if (!value) return value ?? null
  const parsed = parseStorageReference(value)
  if (parsed && isSignableBucket(parsed.bucket) && !value.startsWith('/api/media/')) {
    return toProxyPath(parsed.bucket, parsed.path)
  }
  return value
}
