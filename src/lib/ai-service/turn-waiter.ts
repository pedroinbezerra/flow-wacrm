/**
 * Agendamento oportunista pós-webhook.
 *
 * O despachante no banco (pg_cron, 5s) sabe *que* existem turnos vencidos,
 * mas descobre isso por varredura — então um turno que vence 2,5s depois da
 * mensagem podia esperar mais 5s até alguém reparar. A janela ociosa
 * configurada em 2,5s entregava entre 2,5s e 7,5s, e essa variação é pior
 * que a média: a mesma pergunta respondia em 3s uma vez e em 7s na
 * seguinte, sem nada ter mudado (`FH-46.01`).
 *
 * O webhook, ao contrário, sabe *exatamente* quando o turno vai fechar —
 * `closes_at` volta do append. Então ele deixa um despertador para esse
 * instante.
 *
 * O que este módulo NÃO é: um `sleep` fazendo as vezes de fila. O banco
 * continua sendo a autoridade — quem decide se o turno pode ser executado
 * é um UPDATE de linha única (`ai_turn_claim_if_due`), e o cron de
 * recuperação continua drenando qualquer turno cujo despertador se perca
 * (função morta, deploy no meio, erro transitório). Se todos os
 * despertadores sumissem, nada se perde: a latência volta a ser a do cron.
 *
 * ## Rajada
 *
 * Cada mensagem deixa um despertador, carregando a geração do turno no
 * momento em que nasceu:
 *
 *   M1 → acorda 10:00:02.5, esperando geração 1
 *   M2 → acorda 10:00:03.1, esperando geração 2
 *   ...
 *   M6 → acorda 10:00:05.7, esperando geração 6
 *
 * Quando o de M1 acorda, o turno está na geração 6. A reivindicação não
 * casa, ele encerra ali — sem HTTP, sem runner, sem acordar ninguém. Só o
 * despertador de M6 encontra o turno como o deixou e dispara a execução.
 */

import { claimTurnIfDue } from './turn-store'
import { runTurn } from './turn-runner'
import { TURN_CLAIM_LEASE_MS } from './turn-config'
import {
  checkTurnShadowStale,
  getRedisClient,
  isRedisTurnShadowEnabled,
} from './turn-shadow'
import type { Redis } from '@upstash/redis'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Acima disto, o caminho rápido não vale a pena e o turno fica para o
 * cron.
 *
 * 15s cobre folgadamente mensagens únicas (2,5s) e rajadas normais (6,0s)
 * mantendo uma margem confortável de segurança contra o teto de 60s da Vercel.
 */
export const TURN_WAITER_MAX_WAIT_MS = 15_000

/**
 * Folga somada ao despertar.
 *
 * `ai_turn_claim_if_due` exige `closes_at <= NOW()`. Timer de runtime e
 * relógio do Postgres não são a mesma coisa; acordar alguns milissegundos
 * cedo faria a reivindicação falhar e o turno cair no cron por engano.
 */
const WAKE_GUARD_MS = 120

/** O bilhete que o despertador carrega: o turno como ele era ao nascer. */
export interface TurnWaiterTicket {
  turnId: string
  expectedGeneration: number
  /**
   * String de `closes_at` como o banco a devolveu. Repassada sem
   * conversão — ver `claimTurnIfDue`.
   */
  expectedClosesAt: string
  accountId?: string
  conversationId?: string
}

export type TurnWaiterOutcome =
  /** Fechou o turno e executou. */
  | 'executed'
  /** Nasceu obsoleto: outra mensagem chegou antes de ele acordar. */
  | 'stale'
  /** Espera longa demais para valer a pena; fica para o cron. */
  | 'too_far'
  /** Algo falhou; o cron recupera. */
  | 'error'

/** Injetável para teste — evita cronômetro real na suíte. */
export interface TurnWaiterDeps {
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  redis?: Redis | null
  checkStale?: typeof checkTurnShadowStale
  invocationStartedAt?: number
  maxDurationMs?: number
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Espera até o turno vencer e, se ele ainda for o mesmo, executa.
 *
 * Nunca lança: roda no ciclo pós-resposta do webhook, onde uma exceção
 * não tem para quem subir. Qualquer falha aqui é coberta pelo cron.
 */
export async function awaitAndRunTurn(
  supabase: SupabaseClient,
  ticket: TurnWaiterTicket,
  deps: TurnWaiterDeps = {},
): Promise<TurnWaiterOutcome> {
  const sleep = deps.sleep ?? defaultSleep
  const now = deps.now ?? (() => Date.now())

  try {
    const closesAtMs = new Date(ticket.expectedClosesAt).getTime()
    if (!Number.isFinite(closesAtMs)) return 'error'

    // `closes_at` só é convertido para número AQUI, para calcular a
    // espera. O predicado da reivindicação usa a string original.
    const waitMs = closesAtMs - now()
    if (waitMs > TURN_WAITER_MAX_WAIT_MS) return 'too_far'
    if (waitMs > 0) await sleep(waitMs + WAKE_GUARD_MS)

    // Otimização Redis Shadow (Cache Negativa):
    // Se a feature flag estiver ligada e houver evidência de que o MESMO turno
    // avançou para uma geração posterior, descarta precocemente sem chamar o Postgres.
    if (isRedisTurnShadowEnabled() && ticket.accountId && ticket.conversationId) {
      const redis = deps.redis !== undefined ? deps.redis : getRedisClient()
      if (redis) {
        const checker = deps.checkStale ?? checkTurnShadowStale
        const isStale = await checker(redis, {
          accountId: ticket.accountId,
          conversationId: ticket.conversationId,
          turnId: ticket.turnId,
          expectedGeneration: ticket.expectedGeneration,
        })
        if (isStale) {
          return 'stale'
        }
      }
    }

    const claimed = await claimTurnIfDue(supabase, {
      turnId: ticket.turnId,
      expectedGeneration: ticket.expectedGeneration,
      expectedClosesAt: ticket.expectedClosesAt,
      leaseMs: TURN_CLAIM_LEASE_MS,
    })

    // O caso comum numa rajada. Silêncio total é o comportamento certo:
    // o despertador da mensagem seguinte cobre este turno.
    if (!claimed) return 'stale'

    await runTurn(supabase, claimed, {
      invocationStartedAt: deps.invocationStartedAt ?? now(),
      maxDurationMs: deps.maxDurationMs,
    })
    return 'executed'
  } catch (err) {
    console.error('[ai-turns] despertador do turno falhou:', ticket.turnId, err)
    return 'error'
  }
}
