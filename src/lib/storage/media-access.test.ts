import { describe, expect, it } from 'vitest'
import { isSignableBucket, normalizeMediaSrc, parseStorageReference, toProxyPath } from './media-src'

describe('parseStorageReference', () => {
  it('parses a legacy Supabase public Storage URL', () => {
    expect(
      parseStorageReference(
        'https://abcd1234.supabase.co/storage/v1/object/public/chat-media/account-123/167-photo.png',
      ),
    ).toEqual({ bucket: 'chat-media', path: 'account-123/167-photo.png' })
  })

  it('parses our own proxy path', () => {
    expect(parseStorageReference('/api/media/flow-media/account-123/167-file.pdf')).toEqual({
      bucket: 'flow-media',
      path: 'account-123/167-file.pdf',
    })
  })

  it('parses proxy path with full origin URL', () => {
    expect(
      parseStorageReference('https://example.com/api/media/chat-media/account-123/167-photo.png'),
    ).toEqual({
      bucket: 'chat-media',
      path: 'account-123/167-photo.png',
    })
  })

  it('decodes URL-encoded path segments', () => {
    expect(
      parseStorageReference('/api/media/chat-media/account-123/167-my%20file.pdf'),
    ).toEqual({ bucket: 'chat-media', path: 'account-123/167-my file.pdf' })
  })

  it('returns null for values it does not recognize', () => {
    expect(parseStorageReference('https://cdn.example.com/foo.png')).toBeNull()
    expect(parseStorageReference(null)).toBeNull()
    expect(parseStorageReference(undefined)).toBeNull()
    expect(parseStorageReference('')).toBeNull()
  })
})

describe('toProxyPath', () => {
  it('builds the /api/media/<bucket>/<path> reference', () => {
    expect(toProxyPath('chat-media', 'account-123/167-photo.png')).toBe(
      '/api/media/chat-media/account-123/167-photo.png',
    )
  })
})

describe('isSignableBucket', () => {
  it('accepts only the known conversation-media buckets', () => {
    expect(isSignableBucket('chat-media')).toBe(true)
    expect(isSignableBucket('flow-media')).toBe(true)
    expect(isSignableBucket('avatars')).toBe(false)
    expect(isSignableBucket('ai-service-media')).toBe(false)
  })
})

describe('normalizeMediaSrc', () => {
  it('rewrites a legacy public Storage URL to the proxy path', () => {
    expect(
      normalizeMediaSrc(
        'https://abcd1234.supabase.co/storage/v1/object/public/chat-media/account-123/167-photo.png',
      ),
    ).toBe('/api/media/chat-media/account-123/167-photo.png')
  })

  it('passes an already-proxied path through unchanged', () => {
    expect(normalizeMediaSrc('/api/media/flow-media/account-123/167-file.pdf')).toBe(
      '/api/media/flow-media/account-123/167-file.pdf',
    )
  })

  it('passes unrelated values through unchanged', () => {
    expect(normalizeMediaSrc('https://cdn.example.com/foo.png')).toBe(
      'https://cdn.example.com/foo.png',
    )
    expect(normalizeMediaSrc(null)).toBeNull()
    expect(normalizeMediaSrc(undefined)).toBeNull()
  })
})
