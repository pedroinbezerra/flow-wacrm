// Shared relative-time formatter for dashboard surfaces (activity feed,
// attention queue). Centralised so the two never drift on thresholds.

type Translator = (key: string, params?: Record<string, string | number>) => string

export function formatRelativeTime(iso: string, t: Translator): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffSec = Math.round((Date.now() - then) / 1000)
  if (diffSec < 60) return t('time.justNow')
  if (diffSec < 3600) return t('time.minutesAgo', { count: Math.max(1, Math.floor(diffSec / 60)) })
  if (diffSec < 86400) return t('time.hoursAgo', { count: Math.floor(diffSec / 3600) })
  if (diffSec < 2_592_000) return t('time.daysAgo', { count: Math.floor(diffSec / 86400) })
  return new Date(iso).toLocaleDateString()
}
