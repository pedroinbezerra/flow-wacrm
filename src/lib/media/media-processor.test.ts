import { describe, it, expect } from 'vitest'
import {
  buildDeterministicMediaPath,
  getMediaExtension,
  isMetaMediaExpiredError,
  calculateBackoffMinutes,
} from './media-processor'

describe('media-processor unit tests', () => {
  describe('buildDeterministicMediaPath', () => {
    it('generates account-scoped, message-id based deterministic path', () => {
      const path = buildDeterministicMediaPath('acc-123', 'msg-456', 'jpg')
      expect(path).toBe('account-acc-123/messages/msg-456/media.jpg')
    })

    it('cleans up dot prefix and lowercases extension', () => {
      const path = buildDeterministicMediaPath('acc-999', 'msg-777', '.PNG')
      expect(path).toBe('account-acc-999/messages/msg-777/media.png')
    })
  })

  describe('getMediaExtension', () => {
    it('derives extension from filename if present', () => {
      expect(getMediaExtension('image/jpeg', 'report.pdf')).toBe('pdf')
      expect(getMediaExtension('application/octet-stream', 'photo.PNG')).toBe('png')
    })

    it('derives extension from mime type when filename is missing or generic', () => {
      expect(getMediaExtension('image/jpeg')).toBe('jpg')
      expect(getMediaExtension('image/png')).toBe('png')
      expect(getMediaExtension('audio/ogg')).toBe('ogg')
      expect(getMediaExtension('video/mp4')).toBe('mp4')
      expect(getMediaExtension('application/pdf')).toBe('pdf')
    })

    it('falls back to bin for unknown mime types', () => {
      expect(getMediaExtension('unknown/custom-format')).toBe('bin')
    })
  })

  describe('isMetaMediaExpiredError', () => {
    it('identifies 404 / 410 / expired / missing permission errors', () => {
      expect(isMetaMediaExpiredError('Media 123 does not exist')).toBe(true)
      expect(isMetaMediaExpiredError('HTTP 404 Not Found')).toBe(true)
      expect(isMetaMediaExpiredError('Unsupported get request')).toBe(true)
      expect(isMetaMediaExpiredError('Mídia expirada no WhatsApp')).toBe(true)
    })

    it('returns false for generic network or server errors', () => {
      expect(isMetaMediaExpiredError('ETIMEDOUT')).toBe(false)
      expect(isMetaMediaExpiredError('500 Internal Server Error')).toBe(false)
    })
  })

  describe('calculateBackoffMinutes', () => {
    it('returns increasing backoff delay based on retry count', () => {
      expect(calculateBackoffMinutes(0)).toBe(2)
      expect(calculateBackoffMinutes(1)).toBe(5)
      expect(calculateBackoffMinutes(2)).toBe(15)
      expect(calculateBackoffMinutes(3)).toBe(60)
      expect(calculateBackoffMinutes(10)).toBe(180)
    })
  })
})
