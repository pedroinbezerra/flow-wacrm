/**
 * Health Status API da Meta — a fonte mais acionável do painel.
 *
 * `GET /{node_id}?fields=health_status` devolve, para uma WABA ou número,
 * se dá para enviar mensagem agora (`AVAILABLE` / `LIMITED` / `BLOCKED`),
 * quebrado por entidade (número, WABA, portfólio de negócios, app), com
 * código de erro e solução sugerida pela própria Meta.
 *
 * O valor operacional: descobrir que a conta de um cliente está bloqueada
 * **antes** de ele abrir chamado.
 *
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/support/health-status/
 */

import { META_API_BASE } from '@/lib/whatsapp/api-version'

export type CanSendMessage = 'AVAILABLE' | 'LIMITED' | 'BLOCKED' | 'UNKNOWN'

export interface HealthEntityError {
  code: number | null
  description: string
  possibleSolution: string | null
}

export interface HealthEntity {
  entityType: string
  id: string
  canSendMessage: CanSendMessage
  errors: HealthEntityError[]
}

export interface HealthStatusResult {
  nodeId: string
  canSendMessage: CanSendMessage
  entities: HealthEntity[]
  /** Preenchido quando a consulta falhou; os demais campos ficam vazios. */
  error: string | null
}

interface RawError {
  error_code?: number
  error_description?: string
  possible_solution?: string
}

interface RawEntity {
  entity_type?: string
  id?: string
  can_send_message?: string
  errors?: RawError[]
}

function normalize(value: string | undefined): CanSendMessage {
  switch (value?.toUpperCase()) {
    case 'AVAILABLE':
      return 'AVAILABLE'
    case 'LIMITED':
      return 'LIMITED'
    case 'BLOCKED':
      return 'BLOCKED'
    default:
      // Ausência de resposta não é saúde. Ver `FH-10.04`.
      return 'UNKNOWN'
  }
}

export function parseHealthStatus(nodeId: string, payload: unknown): HealthStatusResult {
  const health = (payload as { health_status?: { can_send_message?: string; entities?: RawEntity[] } })
    ?.health_status
  if (!health) {
    return {
      nodeId,
      canSendMessage: 'UNKNOWN',
      entities: [],
      error: 'A Meta respondeu sem o campo health_status',
    }
  }
  return {
    nodeId,
    canSendMessage: normalize(health.can_send_message),
    entities: (health.entities ?? []).map((e) => ({
      entityType: e.entity_type ?? 'DESCONHECIDO',
      id: e.id ?? '',
      canSendMessage: normalize(e.can_send_message),
      errors: (e.errors ?? []).map((err) => ({
        code: err.error_code ?? null,
        description: err.error_description ?? '',
        possibleSolution: err.possible_solution ?? null,
      })),
    })),
    error: null,
  }
}

export interface FetchHealthStatusArgs {
  /** WABA ID ou phone number ID. */
  nodeId: string
  accessToken: string
}

export async function fetchHealthStatus(
  args: FetchHealthStatusArgs
): Promise<HealthStatusResult> {
  const { nodeId, accessToken } = args
  const empty = { nodeId, canSendMessage: 'UNKNOWN' as const, entities: [] }
  try {
    const res = await fetch(`${META_API_BASE}/${nodeId}?fields=health_status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const message =
        (body as { error?: { message?: string } })?.error?.message ??
        `Meta respondeu ${res.status}`
      return { ...empty, error: message }
    }
    return parseHealthStatus(nodeId, body)
  } catch (err) {
    return {
      ...empty,
      error: err instanceof Error ? err.message : 'Falha ao consultar a Meta',
    }
  }
}
