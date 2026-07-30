import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSignedMediaUrl, isSignableBucket } from '@/lib/storage/media-access'

/**
 * Authenticated read proxy for the private `chat-media` / `flow-media`
 * buckets (migration 040). This is what `messages.media_url` / flow
 * node configs now store instead of a permanent public URL — a
 * same-origin path the browser hits with its normal session cookie, so
 * `<img src>` / `<audio src>` / `<a href>` keep working exactly as
 * before with no client-side change.
 *
 * Checks account membership against the path's first segment
 * (`account-<account_id>`, or the legacy `<uid>` folder for objects
 * uploaded before the account-scoped convention landed — see migration
 * 020) and, only if it matches, redirects to a signed URL good for a
 * few seconds — just long enough for the browser to follow the
 * redirect immediately.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  try {
    const { bucket, path: pathSegments } = await params

    if (!isSignableBucket(bucket)) {
      return NextResponse.json({ error: 'Unknown media bucket' }, { status: 400 })
    }
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: 'Missing media path' }, { status: 400 })
    }
    const path = pathSegments.map((segment) => decodeURIComponent(segment)).join('/')

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()
    const accountId = profile?.account_id as string | undefined
    if (!accountId) {
      return NextResponse.json(
        { error: 'Your profile is not linked to an account.' },
        { status: 403 },
      )
    }

    // Defense in depth on top of the storage RLS policy: the object's
    // first path segment must be this account's folder, or (legacy,
    // pre-account-scoping objects) the caller's own user id.
    const firstSegment = path.split('/')[0]
    const ownsPath = firstSegment === `account-${accountId}` || firstSegment === user.id
    if (!ownsPath) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const signedUrl = await getSignedMediaUrl(bucket, path, 60)
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Error in media proxy GET:', error)
    return NextResponse.json({ error: 'Failed to resolve media' }, { status: 500 })
  }
}
