import type { SupabaseClient } from '@supabase/supabase-js'
import {
  daysAgoStart,
  DOW_SHORT_MON_FIRST,
  lastNDayKeys,
  localDayKey,
  mondayIndex,
  startOfLocalDay,
} from './date-utils'
import type {
  ActivityItem,
  AttentionGroup,
  ConversationsSeriesPoint,
  MetricsBundle,
  PipelineDonutData,
  PipelineStageSlice,
  ResponseTimeBucket,
  ResponseTimeSummary,
} from './types'
import { formatRelativeTime } from './relative-time'

// ------------------------------------------------------------
// All client-side aggregation. RLS scopes every query to the
// signed-in user automatically, so we never pass user_id explicitly
// here. Perf is acceptable for the current scale (low thousands of
// messages) — if a tenant's dataset outgrows this, we'd migrate the
// heavy aggregations to SQL RPCs. Noted in the PR.
// ------------------------------------------------------------

type DB = SupabaseClient
type Translator = (key: string, params?: Record<string, string | number>) => string

// --- 1. Metric cards ---------------------------------------------------

export async function loadMetrics(db: DB): Promise<MetricsBundle> {
  const todayStart = startOfLocalDay().toISOString()
  const yesterdayStart = daysAgoStart(1).toISOString()

  const [
    openConvCur,
    newConvToday,
    newConvYesterday,
    newContactsToday,
    newContactsYesterday,
    openDeals,
    messagesToday,
    messagesYesterday,
  ] = await Promise.all([
    db.from('conversations').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    db
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .gte('created_at', todayStart),
    db
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),
    db.from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    db
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),
    db.from('deals').select('value, status').eq('status', 'open'),
    db
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'agent')
      .gte('created_at', todayStart),
    db
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'agent')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart),
  ])

  const openDealsRows = (openDeals.data ?? []) as { value: number | null }[]
  const openDealsValue = openDealsRows.reduce((sum, d) => sum + (d.value ?? 0), 0)

  return {
    activeConversations: {
      current: openConvCur.count ?? 0,
      // "vs yesterday" on a current-state count has no clean answer
      // without snapshots — we show the delta in NEW open conversations
      // today vs yesterday. That's the business-meaningful daily signal.
      previous: (newConvToday.count ?? 0) - (newConvYesterday.count ?? 0),
    },
    newContactsToday: {
      current: newContactsToday.count ?? 0,
      previous: newContactsYesterday.count ?? 0,
    },
    openDealsValue,
    openDealsCount: openDealsRows.length,
    messagesSentToday: {
      current: messagesToday.count ?? 0,
      previous: messagesYesterday.count ?? 0,
    },
  }
}

// --- 2. Conversations over time ---------------------------------------

export async function loadConversationsSeries(
  db: DB,
  rangeDays: number,
): Promise<ConversationsSeriesPoint[]> {
  const start = daysAgoStart(rangeDays - 1).toISOString()
  const { data, error } = await db
    .from('messages')
    .select('created_at, sender_type')
    .gte('created_at', start)
    .order('created_at', { ascending: true })
  if (error) throw error

  const keys = lastNDayKeys(rangeDays)
  const buckets = new Map<string, { incoming: number; outgoing: number }>()
  for (const k of keys) buckets.set(k, { incoming: 0, outgoing: 0 })

  for (const row of (data ?? []) as { created_at: string; sender_type: string }[]) {
    const key = localDayKey(row.created_at)
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (row.sender_type === 'customer') bucket.incoming += 1
    else bucket.outgoing += 1 // agent + bot both count as outgoing
  }

  return keys.map((day) => ({ day, ...(buckets.get(day) ?? { incoming: 0, outgoing: 0 }) }))
}

// --- 3. Pipeline donut -------------------------------------------------

export async function loadPipelineDonut(db: DB): Promise<PipelineDonutData> {
  const [stagesRes, dealsRes] = await Promise.all([
    db.from('pipeline_stages').select('id, name, color, pipeline_id, position').order('position'),
    db.from('deals').select('stage_id, value, status').eq('status', 'open'),
  ])

  const stages =
    (stagesRes.data ?? []) as { id: string; name: string; color: string }[]
  const deals = (dealsRes.data ?? []) as { stage_id: string; value: number | null }[]

  const byStage = new Map<string, { count: number; total: number }>()
  for (const d of deals) {
    const row = byStage.get(d.stage_id) ?? { count: 0, total: 0 }
    row.count += 1
    row.total += d.value ?? 0
    byStage.set(d.stage_id, row)
  }

  const slices: PipelineStageSlice[] = stages
    .map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color || '#64748b',
      dealCount: byStage.get(s.id)?.count ?? 0,
      totalValue: byStage.get(s.id)?.total ?? 0,
    }))
    // Hide empty stages from the ring (but we'd still show them in the
    // legend if the user wanted a full breakdown — trimming keeps the
    // visual clean for the common case).
    .filter((s) => s.totalValue > 0 || s.dealCount > 0)

  return {
    stages: slices,
    totalValue: slices.reduce((sum, s) => sum + s.totalValue, 0),
  }
}

// --- 4. Response time by day of week ----------------------------------

export async function loadResponseTime(db: DB): Promise<ResponseTimeSummary> {
  // Pull the last 14 days of messages in one shot, then walk per
  // conversation to find each "first inbound" → "first subsequent
  // outbound" pair. 14 days gives us both "this week" + "last week"
  // with enough overlap if the user opens the dashboard late on a
  // Monday.
  const fourteenDaysAgo = daysAgoStart(13).toISOString()
  const { data, error } = await db
    .from('messages')
    .select('conversation_id, sender_type, created_at')
    .gte('created_at', fourteenDaysAgo)
    .order('conversation_id', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error

  const rows = (data ?? []) as {
    conversation_id: string
    sender_type: string
    created_at: string
  }[]

  // Group per conversation, pair unreplied customer messages with the
  // next outbound message from the agent/bot. A single customer message
  // can only count once (avoids inflating averages if the customer
  // double-messages while the agent takes time to reply).
  interface Sample {
    customerAt: Date
    responseAt: Date
  }
  const samples: Sample[] = []

  let currentConv = ''
  let pendingCustomer: Date | null = null
  for (const row of rows) {
    if (row.conversation_id !== currentConv) {
      currentConv = row.conversation_id
      pendingCustomer = null
    }
    const ts = new Date(row.created_at)
    if (row.sender_type === 'customer') {
      if (!pendingCustomer) pendingCustomer = ts
    } else if (pendingCustomer) {
      samples.push({ customerAt: pendingCustomer, responseAt: ts })
      pendingCustomer = null
    }
  }

  const now = new Date()
  const thisWeekStart = daysAgoStart(mondayIndex(now))
  const lastWeekStart = daysAgoStart(mondayIndex(now) + 7)

  // Per-day-of-week buckets, averaged over both weeks' worth of data
  // so each bar has more samples to stand on. If a day has no samples
  // its avgMinutes stays null and the chart renders the bar muted.
  const byDow = new Map<number, number[]>()
  for (let i = 0; i < 7; i++) byDow.set(i, [])
  const thisWeekMins: number[] = []
  const lastWeekMins: number[] = []

  for (const s of samples) {
    const diffMin = (s.responseAt.getTime() - s.customerAt.getTime()) / 60_000
    if (diffMin < 0) continue
    const dow = mondayIndex(s.customerAt)
    byDow.get(dow)!.push(diffMin)
    if (s.customerAt >= thisWeekStart) {
      thisWeekMins.push(diffMin)
    } else if (s.customerAt >= lastWeekStart && s.customerAt < thisWeekStart) {
      lastWeekMins.push(diffMin)
    }
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length

  const buckets: ResponseTimeBucket[] = Array.from({ length: 7 }, (_, dow) => {
    const samples = byDow.get(dow) ?? []
    return {
      dow,
      avgMinutes: avg(samples),
      samples: samples.length,
    }
  })

  // Silence unused-label warnings — keep the arrays explicitly named
  // for readability above.
  void DOW_SHORT_MON_FIRST

  return {
    buckets,
    thisWeekAvg: avg(thisWeekMins),
    lastWeekAvg: avg(lastWeekMins),
  }
}

// --- 5. Activity feed --------------------------------------------------

export async function loadActivity(db: DB, t: Translator, limit = 20): Promise<ActivityItem[]> {
  // Pull ~10 from each source (plenty of headroom after merge-sort),
  // then interleave by timestamp. The individual per-table limits
  // keep the payload small; the final limit is enforced after sort.
  const [msgs, contacts, deals, broadcasts, autoLogs] = await Promise.all([
    db
      .from('messages')
      .select('id, content_text, sender_type, created_at, conversation_id, conversations(contact_id, contacts(name, phone))')
      .eq('sender_type', 'customer')
      .order('created_at', { ascending: false })
      .limit(10),
    db
      .from('contacts')
      .select('id, name, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    db
      .from('deals')
      .select('id, title, updated_at, stage:pipeline_stages(name)')
      .order('updated_at', { ascending: false })
      .limit(10),
    db
      .from('broadcasts')
      .select('id, name, status, total_recipients, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    db
      .from('automation_logs')
      .select('id, trigger_event, status, created_at, automation:automations(name), contact:contacts(name, phone)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const items: ActivityItem[] = []

  // PostgREST returns nested selections as arrays by default, even when
  // the foreign key is 1:1. We normalise by taking [0] on each level.
  for (const m of (msgs.data ?? []) as unknown as Array<{
    id: string
    content_text: string | null
    created_at: string
    conversation_id: string
    conversations:
      | { contact_id: string | null; contacts: { name: string | null; phone: string }[] | { name: string | null; phone: string } | null }[]
      | { contact_id: string | null; contacts: { name: string | null; phone: string }[] | { name: string | null; phone: string } | null }
      | null
  }>) {
    const conv = Array.isArray(m.conversations) ? m.conversations[0] : m.conversations
    const contact = Array.isArray(conv?.contacts) ? conv?.contacts[0] : conv?.contacts
    const who = contact?.name || contact?.phone || 'Unknown'
    items.push({
      id: `msg-${m.id}`,
      kind: 'message',
      text: t('dashboard.activity.newMessage', { name: who }),
      at: m.created_at,
      href: `/inbox?c=${m.conversation_id}`,
    })
  }

  for (const c of (contacts.data ?? []) as Array<{ id: string; name: string | null; phone: string; created_at: string }>) {
    items.push({
      id: `contact-${c.id}`,
      kind: 'contact',
      text: t('dashboard.activity.newContact', { name: c.name || c.phone }),
      at: c.created_at,
      href: '/contacts',
    })
  }

  for (const d of (deals.data ?? []) as unknown as Array<{
    id: string
    title: string
    updated_at: string
    stage: { name: string }[] | { name: string } | null
  }>) {
    const stage = Array.isArray(d.stage) ? d.stage[0] : d.stage
    items.push({
      id: `deal-${d.id}`,
      kind: 'deal',
      text: stage?.name
        ? t('dashboard.activity.dealInStage', { title: d.title, stage: stage.name })
        : t('dashboard.activity.dealUpdated', { title: d.title }),
      at: d.updated_at,
      href: '/pipelines',
    })
  }

  for (const b of (broadcasts.data ?? []) as Array<{
    id: string
    name: string
    status: string
    total_recipients: number
    created_at: string
  }>) {
    const label =
      b.status === 'sent'
        ? t('dashboard.activity.broadcastSent', { count: b.total_recipients })
        : t('dashboard.activity.broadcastStatus', { status: b.status, count: b.total_recipients })
    items.push({
      id: `broadcast-${b.id}`,
      kind: 'broadcast',
      text: t('dashboard.activity.broadcastItem', { name: b.name, label }),
      at: b.created_at,
      href: '/broadcasts',
    })
  }

  for (const l of (autoLogs.data ?? []) as unknown as Array<{
    id: string
    trigger_event: string
    status: string
    created_at: string
    automation: { name: string }[] | { name: string } | null
    contact: { name: string | null; phone: string }[] | { name: string | null; phone: string } | null
  }>) {
    const automation = Array.isArray(l.automation) ? l.automation[0] : l.automation
    const contact = Array.isArray(l.contact) ? l.contact[0] : l.contact
    const who = contact?.name || contact?.phone || 'um contato'
    const autoName = automation?.name || 'Automação'
    const action =
      l.status === 'failed'
        ? t('dashboard.activity.automationFailed')
        : t('dashboard.activity.automationTriggered')
    items.push({
      id: `auto-${l.id}`,
      kind: 'automation',
      text: t('dashboard.activity.automationItem', {
        name: autoName,
        action,
        who,
      }),
      at: l.created_at,
    })
  }

  return items
    .sort((a, b) => (a.at > b.at ? -1 : a.at < b.at ? 1 : 0))
    .slice(0, limit)
}

// --- 6. Attention queue --------------------------------------------------
// Four domains that already exist elsewhere in the product (Inbox,
// Pipelines, Automations, Document Delivery), summarised into one card
// each. Each sub-loader fails independently and silently — a broken
// source shouldn't take down the ones that work. See
// docs/evolucao-experiencia/01-home-dashboard.md for the rationale.

const STALLED_DEAL_DAYS = 5
const AUTOMATION_FAILURE_LOOKBACK_DAYS = 2
const CONVERSATION_LOOKBACK_DAYS = 14

export async function loadAttentionQueue(db: DB, t: Translator): Promise<AttentionGroup[]> {
  const groups = await Promise.all([
    loadUnansweredConversations(db, t),
    loadStalledDeals(db, t),
    loadFailingAutomations(db, t),
    loadPendingDocuments(db, t),
  ])
  return groups.filter((g): g is AttentionGroup => g !== null)
}

async function loadUnansweredConversations(db: DB, t: Translator): Promise<AttentionGroup | null> {
  try {
    const { data: openConvos, error: convError } = await db
      .from('conversations')
      .select('id, contact_id, contacts(name, phone)')
      .eq('status', 'open')
      .limit(500)
    if (convError) throw convError

    const convos = (openConvos ?? []) as unknown as Array<{
      id: string
      contact_id: string | null
      contacts: { name: string | null; phone: string }[] | { name: string | null; phone: string } | null
    }>
    if (convos.length === 0) return null

    const openIds = new Set(convos.map((c) => c.id))
    const contactById = new Map(
      convos.map((c) => {
        const contact = Array.isArray(c.contacts) ? c.contacts[0] : c.contacts
        return [c.id, contact] as const
      }),
    )

    // Same window and unfiltered fetch shape as loadResponseTime — the
    // last row seen per conversation (rows arrive sorted asc) is its
    // most recent message inside the window.
    const lookback = daysAgoStart(CONVERSATION_LOOKBACK_DAYS - 1).toISOString()
    const { data: msgs, error: msgError } = await db
      .from('messages')
      .select('conversation_id, sender_type, created_at')
      .gte('created_at', lookback)
      .order('conversation_id', { ascending: true })
      .order('created_at', { ascending: true })
    if (msgError) throw msgError

    const lastByConv = new Map<string, { sender_type: string; created_at: string }>()
    for (const row of (msgs ?? []) as { conversation_id: string; sender_type: string; created_at: string }[]) {
      if (!openIds.has(row.conversation_id)) continue
      lastByConv.set(row.conversation_id, row)
    }

    const pending: { at: string; who: string }[] = []
    for (const [convId, last] of lastByConv) {
      if (last.sender_type !== 'customer') continue
      const contact = contactById.get(convId)
      pending.push({
        at: last.created_at,
        who: contact?.name || contact?.phone || t('dashboard.attention.unknownContact'),
      })
    }
    if (pending.length === 0) return null

    pending.sort((a, b) => (a.at < b.at ? -1 : 1)) // longest wait first
    const oldest = pending[0]

    return {
      kind: 'conversation',
      count: pending.length,
      headline: t(
        pending.length === 1 ? 'dashboard.attention.conversations.one' : 'dashboard.attention.conversations.many',
        { count: pending.length },
      ),
      detail: t('dashboard.attention.conversations.detail', {
        name: oldest.who,
        time: formatRelativeTime(oldest.at, t),
      }),
      href: '/inbox',
    }
  } catch (err) {
    console.error('[dashboard] attention: unanswered conversations failed:', err)
    return null
  }
}

async function loadStalledDeals(db: DB, t: Translator): Promise<AttentionGroup | null> {
  try {
    const threshold = daysAgoStart(STALLED_DEAL_DAYS).toISOString()
    const [{ count }, { data: oldestRows, error }] = await Promise.all([
      db
        .from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .lt('updated_at', threshold),
      db
        .from('deals')
        .select('id, title, updated_at, stage:pipeline_stages(name)')
        .eq('status', 'open')
        .lt('updated_at', threshold)
        .order('updated_at', { ascending: true })
        .limit(1),
    ])
    if (error) throw error
    if (!count) return null

    const rows = (oldestRows ?? []) as unknown as Array<{
      id: string
      title: string
      updated_at: string
      stage: { name: string }[] | { name: string } | null
    }>
    const oldest = rows[0]
    const stage = oldest ? (Array.isArray(oldest.stage) ? oldest.stage[0] : oldest.stage) : null

    return {
      kind: 'deal',
      count,
      headline: t(count === 1 ? 'dashboard.attention.deals.one' : 'dashboard.attention.deals.many', { count }),
      detail: t('dashboard.attention.deals.detail', {
        title: oldest?.title ?? '',
        stage: stage?.name || t('dashboard.attention.deals.noStage'),
      }),
      href: '/pipelines',
    }
  } catch (err) {
    console.error('[dashboard] attention: stalled deals failed:', err)
    return null
  }
}

async function loadFailingAutomations(db: DB, t: Translator): Promise<AttentionGroup | null> {
  try {
    const lookback = daysAgoStart(AUTOMATION_FAILURE_LOOKBACK_DAYS - 1).toISOString()
    const [{ count }, { data: recentRows, error }] = await Promise.all([
      db
        .from('automation_logs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('created_at', lookback),
      db
        .from('automation_logs')
        .select('id, created_at, automation:automations(name)')
        .eq('status', 'failed')
        .gte('created_at', lookback)
        .order('created_at', { ascending: false })
        .limit(1),
    ])
    if (error) throw error
    if (!count) return null

    const rows = (recentRows ?? []) as unknown as Array<{
      id: string
      created_at: string
      automation: { name: string }[] | { name: string } | null
    }>
    const mostRecent = rows[0]
    const automation = mostRecent
      ? Array.isArray(mostRecent.automation)
        ? mostRecent.automation[0]
        : mostRecent.automation
      : null

    return {
      kind: 'automation',
      count,
      headline: t(
        count === 1 ? 'dashboard.attention.automations.one' : 'dashboard.attention.automations.many',
        { count },
      ),
      detail: t('dashboard.attention.automations.detail', {
        name: automation?.name || t('dashboard.attention.automations.unknown'),
      }),
      href: '/automations',
    }
  } catch (err) {
    console.error('[dashboard] attention: failing automations failed:', err)
    return null
  }
}

async function loadPendingDocuments(db: DB, t: Translator): Promise<AttentionGroup | null> {
  try {
    const [{ count }, { data: oldestRows, error }] = await Promise.all([
      db
        .from('document_delivery_pendencies')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      db
        .from('document_delivery_pendencies')
        .select('id, file_name, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1),
    ])
    if (error) throw error
    if (!count) return null

    const oldest = (oldestRows ?? [])[0] as { id: string; file_name: string; created_at: string } | undefined

    return {
      kind: 'pendency',
      count,
      headline: t(
        count === 1 ? 'dashboard.attention.pendencies.one' : 'dashboard.attention.pendencies.many',
        { count },
      ),
      detail: t('dashboard.attention.pendencies.detail', {
        file: oldest?.file_name || t('dashboard.attention.pendencies.unknown'),
      }),
      href: '/processes/document-delivery/pendencies',
    }
  } catch (err) {
    console.error('[dashboard] attention: pending documents failed:', err)
    return null
  }
}
