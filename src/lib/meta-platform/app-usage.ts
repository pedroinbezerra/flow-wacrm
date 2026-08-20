/**
 * Consumo de quota da Meta, lido dos cabeçalhos que já chegam.
 *
 * Toda resposta da Graph API traz `X-App-Usage` e, nas chamadas de
 * WhatsApp, `X-Business-Use-Case-Usage`. Até aqui o projeto os descartava.
 * Não há chamada nova para obter este dado: é só parar de jogar fora.
 *
 * O registro é do **último valor observado**, não uma série histórica. Com
 * isso a tela precisa declarar quando a leitura foi feita — um consumo de
 * 80% visto há seis horas não é a mesma informação que 80% visto agora
 * (`FH-36.06`).
 */

import { Redis } from '@upstash/redis'

export interface UsageReading {
  callCountPct: number | null
  totalCputimePct: number | null
  totalTimePct: number | null
  observedAt: string
  /** Endpoint que produziu a leitura, para dar contexto na tela. */
  source: string
}

export interface UsageSnapshot {
  app: UsageReading | null
  /** Por WABA ID, quando a Meta manda o cabeçalho de business use case. */
  business: Record<string, UsageReading>
}

const KEY = 'meta:app-usage:latest'
const TTL_SECONDS = 60 * 60 * 24 * 3

let redis: Redis | null | undefined
/** Fallback quando não há Redis configurado — some no restart, e tudo bem. */
let memory: UsageSnapshot | null = null

function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.FLOWHUB_KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.FLOWHUB_KV_REST_API_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

function pct(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** `X-App-Usage: {"call_count":28,"total_cputime":15,"total_time":20}` */
export function parseAppUsage(header: string | null, source: string): UsageReading | null {
  if (!header) return null
  try {
    const raw = JSON.parse(header) as Record<string, unknown>
    return {
      callCountPct: pct(raw.call_count),
      totalCputimePct: pct(raw.total_cputime),
      totalTimePct: pct(raw.total_time),
      observedAt: new Date().toISOString(),
      source,
    }
  } catch {
    return null
  }
}

/**
 * `X-Business-Use-Case-Usage: {"<waba_id>":[{"type":"messaging","call_count":10,...}]}`
 */
export function parseBusinessUsage(
  header: string | null,
  source: string
): Record<string, UsageReading> {
  if (!header) return {}
  try {
    const raw = JSON.parse(header) as Record<string, Array<Record<string, unknown>>>
    const out: Record<string, UsageReading> = {}
    for (const [id, entries] of Object.entries(raw)) {
      const first = Array.isArray(entries) ? entries[0] : undefined
      if (!first) continue
      out[id] = {
        callCountPct: pct(first.call_count),
        totalCputimePct: pct(first.total_cputime),
        totalTimePct: pct(first.total_time),
        observedAt: new Date().toISOString(),
        source,
      }
    }
    return out
  } catch {
    return {}
  }
}

/**
 * Registra o que veio numa resposta da Meta. Nunca lança: observabilidade
 * não pode derrubar a chamada que ela está observando.
 */
export async function recordMetaUsage(headers: Headers, source: string): Promise<void> {
  try {
    const app = parseAppUsage(headers.get('x-app-usage'), source)
    const business = parseBusinessUsage(headers.get('x-business-use-case-usage'), source)
    if (!app && Object.keys(business).length === 0) return

    const previous = (await readMetaUsage()) ?? { app: null, business: {} }
    const next: UsageSnapshot = {
      app: app ?? previous.app,
      business: { ...previous.business, ...business },
    }

    const client = getRedis()
    if (client) {
      await client.set(KEY, JSON.stringify(next), { ex: TTL_SECONDS })
    } else {
      memory = next
    }
  } catch {
    /* observabilidade nunca quebra o caminho principal */
  }
}

export async function readMetaUsage(): Promise<UsageSnapshot | null> {
  try {
    const client = getRedis()
    if (!client) return memory
    const raw = await client.get<string | UsageSnapshot>(KEY)
    if (!raw) return null
    return typeof raw === 'string' ? (JSON.parse(raw) as UsageSnapshot) : raw
  } catch {
    return memory
  }
}

export function __resetUsageForTests(): void {
  memory = null
  redis = undefined
}
