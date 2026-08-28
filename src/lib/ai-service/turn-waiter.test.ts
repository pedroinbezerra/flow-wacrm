import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Redis } from '@upstash/redis'

vi.mock('./turn-store', () => ({
  claimTurnIfDue: vi.fn(),
}))

vi.mock('./turn-runner', () => ({
  runTurn: vi.fn(async () => ({
    turnId: 'turn-1',
    outcome: 'responded',
    responseSent: true,
    intermediateSent: false,
    handoffTriggered: false,
    mediaSentCount: 0,
  })),
}))

import { claimTurnIfDue } from './turn-store'
import { runTurn } from './turn-runner'
import { awaitAndRunTurn, TURN_WAITER_MAX_WAIT_MS } from './turn-waiter'

const db = {} as SupabaseClient

/** Instante fixo, para a espera ser aritmética e não cronômetro. */
const NOW = Date.UTC(2026, 7, 28, 10, 0, 0)

function claimed(turnId = 'turn-1') {
  return {
    turnId,
    accountId: 'acct-1',
    conversationId: 'conv-1',
    contactId: 'contact-1',
    claimToken: 'claim-1',
    claimedGeneration: 6,
    messageCount: 6,
    firstMessageAt: new Date(NOW).toISOString(),
    lastMessageAt: new Date(NOW).toISOString(),
    attemptCount: 1,
  }
}

/** `closes_at` com microssegundos, como o Postgres devolve. */
const CLOSES_AT = '2026-08-28T10:00:02.512345+00:00'

function deps() {
  const sleep = vi.fn(async () => undefined)
  return { sleep, now: () => NOW, slept: sleep }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('awaitAndRunTurn', () => {
  it('espera até o vencimento e executa repassando o invocationStartedAt para o runner', async () => {
    vi.mocked(claimTurnIfDue).mockResolvedValue(claimed())
    const d = deps()
    const customStartedAt = NOW - 10_000

    const outcome = await awaitAndRunTurn(
      db,
      { turnId: 'turn-1', expectedGeneration: 6, expectedClosesAt: CLOSES_AT },
      { ...d, invocationStartedAt: customStartedAt },
    )

    expect(outcome).toBe('executed')
    expect(vi.mocked(runTurn)).toHaveBeenCalledWith(
      db,
      claimed(),
      expect.objectContaining({ invocationStartedAt: customStartedAt }),
    )

    // 2,512s até o vencimento, mais a folga de despertar.
    const [waited] = d.slept.mock.calls[0] as unknown as [number]
    expect(waited).toBeGreaterThanOrEqual(2_512)
    expect(waited).toBeLessThan(2_800)
  })

  it('encerra em silêncio quando nasceu obsoleto', async () => {
    // Outra mensagem chegou: a geração mudou e a reivindicação não casa.
    vi.mocked(claimTurnIfDue).mockResolvedValue(null)

    const outcome = await awaitAndRunTurn(
      db,
      { turnId: 'turn-1', expectedGeneration: 2, expectedClosesAt: CLOSES_AT },
      deps(),
    )

    expect(outcome).toBe('stale')
    // Sem runner, sem HTTP, sem acordar ninguém — este é o ponto.
    expect(vi.mocked(runTurn)).not.toHaveBeenCalled()
  })

  it('repassa `closes_at` exatamente como o banco devolveu', async () => {
    // A fragilidade que mais assusta neste desenho: um `new Date(...)`
    // no caminho truncaria os microssegundos, nenhuma reivindicação
    // casaria, e o caminho rápido morreria em silêncio — parecendo
    // funcionar, porque o cron cobriria tudo alguns segundos depois.
    vi.mocked(claimTurnIfDue).mockResolvedValue(claimed())

    await awaitAndRunTurn(
      db,
      { turnId: 'turn-1', expectedGeneration: 6, expectedClosesAt: CLOSES_AT },
      deps(),
    )

    const args = vi.mocked(claimTurnIfDue).mock.calls[0][1]
    expect(args.expectedClosesAt).toBe(CLOSES_AT)
    expect(args.expectedGeneration).toBe(6)
  })

  it('deixa para o cron quando a espera é longa demais para valer', async () => {
    const farAway = new Date(NOW + TURN_WAITER_MAX_WAIT_MS + 5_000).toISOString()

    const outcome = await awaitAndRunTurn(
      db,
      { turnId: 'turn-1', expectedGeneration: 1, expectedClosesAt: farAway },
      deps(),
    )

    expect(outcome).toBe('too_far')
    expect(vi.mocked(claimTurnIfDue)).not.toHaveBeenCalled()
  })

  it('reivindica sem esperar quando o turno já venceu', async () => {
    vi.mocked(claimTurnIfDue).mockResolvedValue(claimed())
    const d = deps()
    const past = new Date(NOW - 3_000).toISOString()

    const outcome = await awaitAndRunTurn(
      db,
      { turnId: 'turn-1', expectedGeneration: 1, expectedClosesAt: past },
      d,
    )

    expect(outcome).toBe('executed')
    expect(d.slept).not.toHaveBeenCalled()
  })

  it('não deixa exceção escapar para o ciclo pós-resposta', async () => {
    vi.mocked(claimTurnIfDue).mockRejectedValue(new Error('banco fora'))

    const outcome = await awaitAndRunTurn(
      db,
      { turnId: 'turn-1', expectedGeneration: 1, expectedClosesAt: CLOSES_AT },
      deps(),
    )

    // O cron recupera; o webhook não pode quebrar por causa disto.
    expect(outcome).toBe('error')
  })
})

describe('awaitAndRunTurn — Redis Shadow (Cache Negativa)', () => {
  const originalEnv = process.env.AI_TURNS_REDIS_SHADOW_ENABLED

  afterEach(() => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = originalEnv
  })

  it('descarta antecipadamente como stale e NÃO chama claimTurnIfDue quando o shadow confirma obsolescência', async () => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = 'true'
    const mockCheckStale = vi.fn().mockResolvedValue(true)
    const mockRedis = {} as unknown as Redis

    const outcome = await awaitAndRunTurn(
      db,
      {
        turnId: 'turn-1',
        expectedGeneration: 1,
        expectedClosesAt: CLOSES_AT,
        accountId: 'acc-1',
        conversationId: 'conv-1',
      },
      { ...deps(), redis: mockRedis, checkStale: mockCheckStale },
    )

    expect(outcome).toBe('stale')
    expect(mockCheckStale).toHaveBeenCalledWith(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      expectedGeneration: 1,
    })
    // Garante que o Postgres NÃO foi chamado (economia de RPC)
    expect(vi.mocked(claimTurnIfDue)).not.toHaveBeenCalled()
    expect(vi.mocked(runTurn)).not.toHaveBeenCalled()
  })

  it('faz fallback para Postgres e executa quando o shadow não detecta stale (geração vencedora)', async () => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = 'true'
    const mockCheckStale = vi.fn().mockResolvedValue(false)
    vi.mocked(claimTurnIfDue).mockResolvedValue(claimed())

    const outcome = await awaitAndRunTurn(
      db,
      {
        turnId: 'turn-1',
        expectedGeneration: 6,
        expectedClosesAt: CLOSES_AT,
        accountId: 'acc-1',
        conversationId: 'conv-1',
      },
      { ...deps(), redis: {} as unknown as Redis, checkStale: mockCheckStale },
    )

    expect(outcome).toBe('executed')
    expect(mockCheckStale).toHaveBeenCalledTimes(1)
    expect(vi.mocked(claimTurnIfDue)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(runTurn)).toHaveBeenCalledTimes(1)
  })

  it('faz fallback suave para Postgres quando a feature flag está OFF', async () => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = 'false'
    const mockCheckStale = vi.fn()
    vi.mocked(claimTurnIfDue).mockResolvedValue(claimed())

    const outcome = await awaitAndRunTurn(
      db,
      {
        turnId: 'turn-1',
        expectedGeneration: 1,
        expectedClosesAt: CLOSES_AT,
        accountId: 'acc-1',
        conversationId: 'conv-1',
      },
      { ...deps(), redis: {} as unknown as Redis, checkStale: mockCheckStale },
    )

    expect(outcome).toBe('executed')
    // Flag OFF -> zero chamadas ao Redis Shadow
    expect(mockCheckStale).not.toHaveBeenCalled()
    expect(vi.mocked(claimTurnIfDue)).toHaveBeenCalledTimes(1)
  })
})
