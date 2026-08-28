import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/automations/admin-client'
import {
  TURN_CLAIM_LEASE_MS,
  TURN_DRAIN_BATCH_SIZE,
  TURN_MAX_ATTEMPTS,
} from '@/lib/ai-service/turn-config'
import { claimDueTurns } from '@/lib/ai-service/turn-store'
import { runTurn } from '@/lib/ai-service/turn-runner'

export const dynamic = 'force-dynamic'

/**
 * Teto de duracao. Cada turno faz duas inferencias seriais; um lote pode
 * levar dezenas de segundos. 60s cabe em Hobby e em Pro, e o laco abaixo
 * respeita um orcamento menor que isso para nunca ser cortado no meio.
 */
export const maxDuration = 60

/**
 * Orcamento de parede do laco. Abaixo dele o drenador para de pegar
 * turnos novos e devolve o que fez; o resto sai na proxima passagem.
 */
const DRAIN_BUDGET_MS = 45_000

/**
 * Rede de recuperação dos turnos conversacionais.
 *
 * Este NÃO é o caminho normal. No fluxo saudável, quem fecha o turno é o
 * despertador que o próprio webhook agendou (`turn-waiter.ts`), que sabe
 * o instante exato do vencimento e não depende de varredura. Esta rota
 * existe para o que escapa dele:
 *
 *   - o ciclo pós-resposta não rodou (função morta, deploy no meio);
 *   - lease vencido de uma execução interrompida;
 *   - turno cuja espera era longa demais para valer o caminho rápido
 *     (acima de `TURN_WAITER_MAX_WAIT_MS`);
 *   - pg_net / `after()` indisponíveis.
 *
 * Dois chamadores:
 *
 * 1. `ai_turn_dispatch_due()` no Postgres, via pg_cron a cada 5 segundos.
 *    Só faz a chamada HTTP quando existe turno vencido — conta parada não
 *    gera invocação nenhuma.
 * 2. Um pinger HTTP de 1 minuto, para quando pg_cron ou pg_net estiverem
 *    fora.
 *
 * A reivindicação é atômica (`FOR UPDATE SKIP LOCKED`), então os três
 * caminhos podem se sobrepor à vontade — nenhum turno é executado duas
 * vezes, e nenhum fica parado porque outro o pegou.
 */
async function drain(request: Request) {
  const expected =
    process.env.AI_TURNS_CRON_SECRET ||
    process.env.AUTOMATION_CRON_SECRET ||
    process.env.CRON_SECRET

  if (!expected) {
    return NextResponse.json({ error: 'cron not configured' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.substring(7).trim()
    : ''
  const supplied = request.headers.get('x-cron-secret') || bearerSecret
  const suppliedBuf = Buffer.from(supplied)
  const expectedBuf = Buffer.from(expected)

  if (
    suppliedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(suppliedBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = supabaseAdmin()
  const startedAt = Date.now()

  // Um turno por vez, e não um lote reivindicado de uma vez.
  //
  // Cada turno faz duas inferências seriais com a chave do próprio
  // cliente: um lote paralelo transformaria pico de conversa em rajada
  // contra a cota dele, e um lote reivindicado de uma vez deixaria os
  // últimos presos até o lease vencer se o orçamento acabasse antes.
  // Reivindicando um a um, o que não coube simplesmente nunca foi
  // reivindicado, e a próxima passagem o pega imediatamente.
  const outcomes: { turnId: string; outcome: string }[] = []

  while (outcomes.length < TURN_DRAIN_BATCH_SIZE) {
    if (Date.now() - startedAt > DRAIN_BUDGET_MS) break

    const [turn] = await claimDueTurns(admin, {
      limit: 1,
      leaseMs: TURN_CLAIM_LEASE_MS,
      maxAttempts: TURN_MAX_ATTEMPTS,
    })
    if (!turn) break

    try {
      const result = await runTurn(admin, turn, {
        invocationStartedAt: Date.now(),
        maxDurationMs: maxDuration * 1000,
      })
      outcomes.push({ turnId: result.turnId, outcome: result.outcome })
    } catch (err) {
      // `runTurn` já trata os próprios erros; isto cobre o inesperado e
      // impede que um turno derrube a passagem. O lease vencido devolve
      // o turno à fila na próxima drenagem.
      console.error('[ai-turns] execução do turno lançou exceção:', turn.turnId, err)
      outcomes.push({ turnId: turn.turnId, outcome: 'unhandled_error' })
    }
  }

  return NextResponse.json({
    processed: outcomes.length,
    budgetExhausted: Date.now() - startedAt > DRAIN_BUDGET_MS,
    outcomes,
  })
}

export async function GET(request: Request) {
  return drain(request)
}

export async function POST(request: Request) {
  return drain(request)
}
