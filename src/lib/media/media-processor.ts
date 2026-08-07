import { supabaseAdmin } from '@/lib/flows/admin-client'
import { getMediaUrl, downloadMedia } from '@/lib/whatsapp/meta-api'
import { decrypt } from '@/lib/whatsapp/encryption'
import { MEDIA_MAX_BYTES_BY_KIND } from '@/lib/storage/upload-media'
import type { MediaHealthMetrics, MediaSource, MediaStatus } from '@/types'

/** Default storage bucket for conversation attachments */
export const CHAT_MEDIA_BUCKET = 'chat-media'

/**
 * Builds deterministic, idempotent object path for a message attachment.
 * Prevents storage duplication if a worker restarts mid-flight.
 */
export function buildDeterministicMediaPath(
  accountId: string,
  messageId: string,
  extension: string
): string {
  const cleanExt = extension.replace(/^\./, '').toLowerCase() || 'bin'
  return `account-${accountId}/messages/${messageId}/media.${cleanExt}`
}

/**
 * Maps MIME types or filenames to clean file extensions.
 */
export function getMediaExtension(mimeType?: string | null, filename?: string | null): string {
  if (filename && filename.includes('.')) {
    const parts = filename.split('.')
    const ext = parts[parts.length - 1].toLowerCase().trim()
    if (ext && ext.length <= 8) return ext
  }

  if (!mimeType) return 'bin'
  const normalized = mimeType.toLowerCase().trim()

  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg'
  if (normalized.includes('png')) return 'png'
  if (normalized.includes('webp')) return 'webp'
  if (normalized.includes('gif')) return 'gif'
  if (normalized.includes('mp4')) return 'mp4'
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3'
  if (normalized.includes('ogg')) return 'ogg'
  if (normalized.includes('opus')) return 'ogg'
  if (normalized.includes('pdf')) return 'pdf'
  if (normalized.includes('csv')) return 'csv'
  if (normalized.includes('json')) return 'json'
  if (normalized.includes('quicktime')) return 'mov'
  if (normalized.includes('zip')) return 'zip'

  return 'bin'
}

/**
 * Helper to test if a Meta error indicates CDN expiration / 404 / 410.
 */
export function isMetaMediaExpiredError(errorMessage: string): boolean {
  const msg = errorMessage.toLowerCase()
  return (
    msg.includes('does not exist') ||
    msg.includes('missing permissions') ||
    msg.includes('unsupported get request') ||
    msg.includes('404') ||
    msg.includes('410') ||
    msg.includes('expirada') ||
    msg.includes('expired')
  )
}

/**
 * Calculate backoff delay in minutes: 2m, 5m, 15m, 60m...
 */
export function calculateBackoffMinutes(retryCount: number): number {
  const schedule = [2, 5, 15, 60, 180]
  return schedule[Math.min(retryCount, schedule.length - 1)] || 60
}

export interface ProcessMediaInput {
  messageId: string
  accountId: string
  metaMediaId: string
  accessToken: string
  mimeType?: string | null
  mediaSource?: MediaSource
}

export interface ProcessMediaResult {
  success: boolean
  status: MediaStatus
  storagePath?: string
  errorMessage?: string
}

/**
 * Core asynchronous media processor for a single message.
 * Idempotent, non-blocking, and guarantees lease lock cleanup on all exit paths.
 */
export async function processMediaForMessage(
  input: ProcessMediaInput
): Promise<ProcessMediaResult> {
  const admin = supabaseAdmin()
  const { messageId, accountId, metaMediaId, accessToken, mimeType, mediaSource = 'whatsapp_inbound' } = input

  // 1) Fetch message details & verify if already processed
  const { data: existingMsg, error: fetchErr } = await admin
    .from('messages')
    .select('id, media_status, content_type, media_storage_path')
    .eq('id', messageId)
    .maybeSingle()

  if (fetchErr || !existingMsg) {
    return {
      success: false,
      status: 'failed',
      errorMessage: fetchErr?.message || 'Message not found',
    }
  }

  if (existingMsg.media_status === 'stored' && existingMsg.media_storage_path) {
    return {
      success: true,
      status: 'stored',
      storagePath: existingMsg.media_storage_path,
    }
  }

  // 2) Acquire atomic lease lock: set status = 'processing', locked_until = NOW() + 10m
  const leaseUntilIso = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const { data: claimedMsg } = await admin
    .from('messages')
    .update({
      media_status: 'processing',
      locked_until: leaseUntilIso,
      media_source: mediaSource,
    })
    .eq('id', messageId)
    .or(`locked_until.is.null,locked_until.lte.${new Date().toISOString()}`)
    .select('id, media_retry_count')
    .maybeSingle()

  if (!claimedMsg) {
    // Message is currently locked by another worker
    return {
      success: false,
      status: 'processing',
      errorMessage: 'Message is currently locked by another worker',
    }
  }

  const currentRetryCount = claimedMsg.media_retry_count || 0

  try {
    // 3) Download media info & binary from Meta CDN
    const mediaInfo = await getMediaUrl({ mediaId: metaMediaId, accessToken })
    const effectiveMime = mimeType || mediaInfo.mimeType || 'application/octet-stream'

    // 4) Check size limits based on media kind
    const contentTypeKey = existingMsg.content_type as keyof typeof MEDIA_MAX_BYTES_BY_KIND
    const maxAllowedBytes = MEDIA_MAX_BYTES_BY_KIND[contentTypeKey] || 16 * 1024 * 1024

    const { buffer, contentType } = await downloadMedia({
      downloadUrl: mediaInfo.url,
      accessToken,
    })

    const finalMime = contentType || effectiveMime
    const sizeBytes = buffer.byteLength

    if (sizeBytes > maxAllowedBytes) {
      const errorMsg = `Arquivo excede o limite máximo permitido (${(maxAllowedBytes / (1024 * 1024)).toFixed(0)} MB)`
      await admin
        .from('messages')
        .update({
          media_status: 'failed',
          locked_until: null,
          media_error_message: errorMsg,
          media_mime_type: finalMime,
          media_size_bytes: sizeBytes,
        })
        .eq('id', messageId)

      return {
        success: false,
        status: 'failed',
        errorMessage: errorMsg,
      }
    }

    // 5) Upload to Supabase Storage using deterministic path
    const extension = getMediaExtension(finalMime)
    const storagePath = buildDeterministicMediaPath(accountId, messageId, extension)

    const { error: uploadErr } = await admin.storage
      .from(CHAT_MEDIA_BUCKET)
      .upload(storagePath, buffer, {
        contentType: finalMime,
        cacheControl: '31536000', // 1 year cache
        upsert: true, // Idempotent overwrite if retried
      })

    if (uploadErr) {
      throw new Error(`Storage upload failed: ${uploadErr.message}`)
    }

    // 6) Terminal Success: Update message with stored status & clear lease lock
    await admin
      .from('messages')
      .update({
        media_status: 'stored',
        media_storage_path: storagePath,
        media_storage_provider: 'supabase',
        media_mime_type: finalMime,
        media_size_bytes: sizeBytes,
        locked_until: null,
        media_error_message: null,
      })
      .eq('id', messageId)

    return {
      success: true,
      status: 'stored',
      storagePath,
    }
  } catch (err: any) {
    const errorMsg = err?.message || String(err)
    const isExpired = isMetaMediaExpiredError(errorMsg)

    if (isExpired) {
      // Terminal state: Media expired on Meta CDN
      await admin
        .from('messages')
        .update({
          media_status: 'expired',
          locked_until: null,
          media_error_message: 'Mídia expirada ou indisponível nos servidores da Meta',
        })
        .eq('id', messageId)

      return {
        success: false,
        status: 'expired',
        errorMessage: errorMsg,
      }
    }

    // Temporary failure: Schedule backoff retry or mark failed if retry limit reached
    const nextRetryCount = currentRetryCount + 1
    const isMaxRetriesReached = nextRetryCount >= 5

    if (isMaxRetriesReached) {
      await admin
        .from('messages')
        .update({
          media_status: 'failed',
          media_retry_count: nextRetryCount,
          locked_until: null,
          media_error_message: `Falha permanente após 5 tentativas: ${errorMsg}`,
        })
        .eq('id', messageId)

      return {
        success: false,
        status: 'failed',
        errorMessage: errorMsg,
      }
    }

    const backoffMinutes = calculateBackoffMinutes(nextRetryCount)
    const nextRetryIso = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()

    await admin
      .from('messages')
      .update({
        media_status: 'pending',
        media_retry_count: nextRetryCount,
        media_next_retry_at: nextRetryIso,
        locked_until: null,
        media_error_message: errorMsg,
      })
      .eq('id', messageId)

    return {
      success: false,
      status: 'pending',
      errorMessage: errorMsg,
    }
  }
}

/**
 * Scan for orphaned/stuck 'processing' leases (locked_until < NOW())
 * and safely revert them back to 'pending' with incremented retry count.
 */
export async function recoverExpiredLeases(): Promise<number> {
  const admin = supabaseAdmin()
  const nowIso = new Date().toISOString()

  const { data: expiredList, error } = await admin
    .from('messages')
    .select('id, media_retry_count')
    .eq('media_status', 'processing')
    .lt('locked_until', nowIso)

  if (error || !expiredList || expiredList.length === 0) {
    return 0
  }

  let recovered = 0
  for (const item of expiredList) {
    const nextRetry = (item.media_retry_count || 0) + 1
    const backoff = calculateBackoffMinutes(nextRetry)
    const nextRetryIso = new Date(Date.now() + backoff * 60 * 1000).toISOString()

    const { error: updErr } = await admin
      .from('messages')
      .update({
        media_status: nextRetry >= 5 ? 'failed' : 'pending',
        media_retry_count: nextRetry,
        media_next_retry_at: nextRetryIso,
        locked_until: null,
        media_error_message: 'Lease de processamento expirado (worker timeout)',
      })
      .eq('id', item.id)

    if (!updErr) recovered++
  }

  return recovered
}

/**
 * Drain pending/failed media processing queue for background jobs/crons.
 */
export async function drainPendingMediaQueue(limit = 20): Promise<{ processed: number; recovered: number }> {
  const admin = supabaseAdmin()
  const recovered = await recoverExpiredLeases()
  const nowIso = new Date().toISOString()

  const { data: pendingMsgs, error } = await admin
    .from('messages')
    .select(`
      id,
      media_meta_id,
      media_mime_type,
      media_source,
      conversation_id,
      conversations!inner (
        account_id
      )
    `)
    .in('media_status', ['pending', 'failed'])
    .lt('media_retry_count', 5)
    .or(`media_next_retry_at.is.null,media_next_retry_at.lte.${nowIso}`)
    .or(`locked_until.is.null,locked_until.lte.${nowIso}`)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !pendingMsgs || pendingMsgs.length === 0) {
    return { processed: 0, recovered }
  }

  let processed = 0
  for (const msg of pendingMsgs) {
    if (!msg.media_meta_id) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conv = msg.conversations as any
    const accountId = conv?.account_id
    if (!accountId) continue

    // Fetch account's WhatsApp access token
    const { data: config } = await admin
      .from('whatsapp_config')
      .select('access_token')
      .eq('account_id', accountId)
      .maybeSingle()

    if (!config?.access_token) continue

    try {
      const accessToken = decrypt(config.access_token)
      const res = await processMediaForMessage({
        messageId: msg.id,
        accountId,
        metaMediaId: msg.media_meta_id,
        accessToken,
        mimeType: msg.media_mime_type,
        mediaSource: (msg.media_source as MediaSource) || 'whatsapp_inbound',
      })
      if (res.success || res.status === 'expired' || res.status === 'failed') {
        processed++
      }
    } catch (procErr) {
      console.error(`[media-processor] Queue item ${msg.id} threw error:`, procErr)
    }
  }

  return { processed, recovered }
}

/**
 * Returns aggregated media health metrics for a given account.
 */
export async function getMediaHealthMetrics(accountId: string): Promise<MediaHealthMetrics> {
  const admin = supabaseAdmin()

  const { data, error } = await admin
    .from('messages')
    .select('media_status, media_size_bytes, conversations!inner(account_id)')
    .eq('conversations.account_id', accountId)
    .not('media_status', 'is', null)

  if (error || !data) {
    return {
      storedCount: 0,
      pendingCount: 0,
      processingCount: 0,
      failedCount: 0,
      expiredCount: 0,
      totalSizeMaxBytes: 0,
    }
  }

  const metrics: MediaHealthMetrics = {
    storedCount: 0,
    pendingCount: 0,
    processingCount: 0,
    failedCount: 0,
    expiredCount: 0,
    totalSizeMaxBytes: 0,
  }

  for (const row of data) {
    const status = row.media_status as MediaStatus
    if (status === 'stored') metrics.storedCount++
    else if (status === 'pending') metrics.pendingCount++
    else if (status === 'processing') metrics.processingCount++
    else if (status === 'failed') metrics.failedCount++
    else if (status === 'expired') metrics.expiredCount++

    if (row.media_size_bytes) {
      metrics.totalSizeMaxBytes! += Number(row.media_size_bytes)
    }
  }

  return metrics
}
