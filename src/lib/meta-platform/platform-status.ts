/**
 * Estado dos serviços da Meta, lido da página de status oficial.
 *
 * A página é uma SPA; o dado que ela consome é um JSON estático em
 * `data/orgs.json`, com todos os produtos e o estado de cada serviço.
 * Preferido ao RSS porque é estruturado — o RSS serve para o histórico
 * de incidentes, não para o estado atual.
 *
 * Nenhum destes endpoints exige autenticação, e nenhum é contratual:
 * são o que a página pública consome. Se a Meta mudar o formato, a leitura
 * degrada para "não foi possível consultar" e a tela diz isso — nunca
 * apresenta ausência de dado como ausência de problema (`FH-10.04`).
 */

const STATUS_ORIGIN = 'https://metastatus.com'
const ORGS_URL = `${STATUS_ORIGIN}/data/orgs.json`

/** Produtos que importam para o FlowHub, na ordem em que devem aparecer. */
export const TRACKED_ORGS = [
  'whatsapp-business-api',
  'graph-api',
  'facebook-login',
] as const

export type TrackedOrgId = (typeof TRACKED_ORGS)[number]

/** Estado normalizado. A Meta escreve em texto livre; reduzimos a três. */
export type ServiceHealth = 'operacional' | 'degradado' | 'fora' | 'desconhecido'

export interface MetaService {
  name: string
  /** Texto original da Meta, preservado — a tela mostra o nosso e guarda o dela. */
  rawStatus: string
  health: ServiceHealth
  since: string | null
}

export interface MetaProductStatus {
  id: string
  name: string
  services: MetaService[]
  /** Pior estado entre os serviços — o produto vale pelo seu elo mais fraco. */
  worst: ServiceHealth
  incidentFeedUrl: string | null
}

export interface PlatformStatusResult {
  products: MetaProductStatus[]
  fetchedAt: string
  /** Preenchido quando a consulta falhou. `products` vem vazio. */
  error: string | null
}

/**
 * A Meta usa frases, não enum. Mapeamos pelo que ela publica hoje e
 * tratamos o desconhecido como desconhecido — nunca como saudável.
 */
export function normalizeStatus(raw: string): ServiceHealth {
  const s = raw.toLowerCase()
  if (s.includes('no known issues') || s.includes('resolved')) return 'operacional'
  if (s.includes('major') || s.includes('outage') || s.includes('down')) return 'fora'
  if (s.includes('disruption') || s.includes('degraded') || s.includes('recovery')) {
    return 'degradado'
  }
  return 'desconhecido'
}

const SEVERITY: Record<ServiceHealth, number> = {
  operacional: 0,
  desconhecido: 1,
  degradado: 2,
  fora: 3,
}

export function worstOf(healths: ServiceHealth[]): ServiceHealth {
  return healths.reduce<ServiceHealth>(
    (acc, h) => (SEVERITY[h] > SEVERITY[acc] ? h : acc),
    'operacional'
  )
}

interface RawService {
  name?: string
  status?: string
  time?: string | null
}

interface RawOrg {
  id?: string
  name?: string
  services?: RawService[]
  rss_file_paths?: string[]
}

export function parseOrgs(raw: unknown): MetaProductStatus[] {
  if (!Array.isArray(raw)) return []
  const wanted = new Set<string>(TRACKED_ORGS)
  const byId = new Map<string, MetaProductStatus>()

  for (const org of raw as RawOrg[]) {
    if (!org?.id || !wanted.has(org.id)) continue
    const services: MetaService[] = (org.services ?? []).map((s) => ({
      name: s.name ?? 'Serviço sem nome',
      rawStatus: s.status ?? '',
      health: normalizeStatus(s.status ?? ''),
      since: s.time ?? null,
    }))
    const feed = org.rss_file_paths?.[0]
    byId.set(org.id, {
      id: org.id,
      name: org.name ?? org.id,
      services,
      worst: worstOf(services.map((s) => s.health)),
      incidentFeedUrl: feed ? `${STATUS_ORIGIN}/${feed}` : null,
    })
  }

  // Ordem estável e intencional, não a ordem em que a Meta devolveu.
  return TRACKED_ORGS.map((id) => byId.get(id)).filter(
    (p): p is MetaProductStatus => p != null
  )
}

export async function fetchPlatformStatus(): Promise<PlatformStatusResult> {
  const fetchedAt = new Date().toISOString()
  try {
    const res = await fetch(ORGS_URL, {
      headers: { accept: 'application/json' },
      // Estado de plataforma não pode vir de cache: a pergunta é sempre
      // "e agora?".
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      return { products: [], fetchedAt, error: `Status page respondeu ${res.status}` }
    }
    return { products: parseOrgs(await res.json()), fetchedAt, error: null }
  } catch (err) {
    return {
      products: [],
      fetchedAt,
      error: err instanceof Error ? err.message : 'Falha ao consultar a página de status',
    }
  }
}
