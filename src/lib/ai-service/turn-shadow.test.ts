import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  isRedisTurnShadowEnabled,
  getTurnShadowKey,
  updateTurnShadow,
  checkTurnShadowStale,
  __resetRedisClientForTests,
} from './turn-shadow'
import type { Redis } from '@upstash/redis'

describe('turn-shadow — Feature Flag Opt-In', () => {
  const originalEnv = process.env.AI_TURNS_REDIS_SHADOW_ENABLED

  afterEach(() => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = originalEnv
    __resetRedisClientForTests()
  })

  it('permanece desabilitado quando a variável de ambiente está ausente', () => {
    delete process.env.AI_TURNS_REDIS_SHADOW_ENABLED
    expect(isRedisTurnShadowEnabled()).toBe(false)
  })

  it('permanece desabilitado para valores arbitrários ("false", "0", "enabled")', () => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = 'false'
    expect(isRedisTurnShadowEnabled()).toBe(false)

    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = '0'
    expect(isRedisTurnShadowEnabled()).toBe(false)

    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = 'enabled'
    expect(isRedisTurnShadowEnabled()).toBe(false)
  })

  it('habilita estritamente quando a variável for a string literal "true"', () => {
    process.env.AI_TURNS_REDIS_SHADOW_ENABLED = 'true'
    expect(isRedisTurnShadowEnabled()).toBe(true)
  })
})

describe('turn-shadow — Convenção de Chave e Namespace', () => {
  it('gera a chave no formato canônico com isolamento de conta e conversa', () => {
    const key = getTurnShadowKey('acc-123', 'conv-456')
    expect(key).toBe('flowhub:acc-123:conv:conv-456:turn')
  })
})

describe('turn-shadow — Atualização e Monotonicidade (updateTurnShadow)', () => {
  it('chama redis.eval com a chave e os argumentos esperados', async () => {
    const mockEval = vi.fn().mockResolvedValue(1)
    const mockRedis = { eval: mockEval } as unknown as Redis

    const ok = await updateTurnShadow(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      generation: 2,
    })

    expect(ok).toBe(true)
    expect(mockEval).toHaveBeenCalledTimes(1)
    const [script, keys, args] = mockEval.mock.calls[0]
    expect(typeof script).toBe('string')
    expect(keys).toEqual(['flowhub:acc-1:conv:conv-1:turn'])
    expect(args).toEqual(['turn-1', '2', '600'])
  })

  it('suprime erros de rede/timeout retornando false sem lançar exceção', async () => {
    const mockEval = vi.fn().mockRejectedValue(new Error('Redis timeout / unreachable'))
    const mockRedis = { eval: mockEval } as unknown as Redis

    const ok = await updateTurnShadow(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      generation: 1,
    })

    expect(ok).toBe(false)
  })
})

describe('turn-shadow — Stale Check e Cache Negativa (checkTurnShadowStale)', () => {
  it('retorna true quando o MESMO turn_id possui geração superior no shadow (stale confirmado)', async () => {
    const mockHmget = vi.fn().mockResolvedValue({
      turn_id: 'turn-1',
      generation: '3',
    })
    const mockRedis = { hmget: mockHmget } as unknown as Redis

    const isStale = await checkTurnShadowStale(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      expectedGeneration: 1,
    })

    expect(isStale).toBe(true)
    expect(mockHmget).toHaveBeenCalledWith(
      'flowhub:acc-1:conv:conv-1:turn',
      'turn_id',
      'generation',
    )
  })

  it('retorna false quando o MESMO turn_id está na mesma geração esperada (cai para Postgres claim)', async () => {
    const mockHmget = vi.fn().mockResolvedValue({
      turn_id: 'turn-1',
      generation: '2',
    })
    const mockRedis = { hmget: mockHmget } as unknown as Redis

    const isStale = await checkTurnShadowStale(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      expectedGeneration: 2,
    })

    expect(isStale).toBe(false)
  })

  it('retorna false quando o MESMO turn_id tem geração menor (escrita atrasada -> cai para Postgres)', async () => {
    const mockHmget = vi.fn().mockResolvedValue({
      turn_id: 'turn-1',
      generation: '1',
    })
    const mockRedis = { hmget: mockHmget } as unknown as Redis

    const isStale = await checkTurnShadowStale(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      expectedGeneration: 3,
    })

    expect(isStale).toBe(false)
  })

  it('retorna false quando o turn_id for DIFERENTE (novo turno ou late write de turno antigo)', async () => {
    // Cenário: Waiter do Turno B (gen 1) acorda, mas o shadow tem Turno A (gen 8).
    // Não pode descartar B como stale! Deve ir ao Postgres validar.
    const mockHmget = vi.fn().mockResolvedValue({
      turn_id: 'turn-old-A',
      generation: '8',
    })
    const mockRedis = { hmget: mockHmget } as unknown as Redis

    const isStale = await checkTurnShadowStale(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-new-B',
      expectedGeneration: 1,
    })

    expect(isStale).toBe(false)
  })

  it('retorna false em caso de cache miss (chave ausente ou sem turn_id)', async () => {
    const mockHmget = vi.fn().mockResolvedValue(null)
    const mockRedis = { hmget: mockHmget } as unknown as Redis

    const isStale = await checkTurnShadowStale(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      expectedGeneration: 1,
    })

    expect(isStale).toBe(false)
  })

  it('retorna false e degrada suavemente se o Redis lançar erro ou timeout', async () => {
    const mockHmget = vi.fn().mockRejectedValue(new Error('Connection reset by peer'))
    const mockRedis = { hmget: mockHmget } as unknown as Redis

    const isStale = await checkTurnShadowStale(mockRedis, {
      accountId: 'acc-1',
      conversationId: 'conv-1',
      turnId: 'turn-1',
      expectedGeneration: 1,
    })

    expect(isStale).toBe(false)
  })
})
