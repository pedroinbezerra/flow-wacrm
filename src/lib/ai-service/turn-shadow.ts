/**
 * Cache negativa de obsolescência de turnos conversacionais (Redis Shadow).
 *
 * GOVERNANÇA E SEMÂNTICA:
 * - O Postgres/Supabase permanece como autoridade canônica única e durável.
 * - O Redis atua exclusivamente como cache negativa para descarte antecipado
 *   de waiters que acordam obsoletos em rajadas, evitando chamadas RPC ao banco.
 * - O Redis NUNCA concede autorização de execução ou publicação.
 * - Qualquer erro, timeout, cache miss, divergência de turn_id ou geração igual/menor
 *   faz fallback incondicional para validação no Postgres.
 * - A monotonicidade é estrita por turn_id: não existe sequência global entre turnos.
 * - Feature Flag estritamente opt-in: AI_TURNS_REDIS_SHADOW_ENABLED === 'true'.
 */

import { Redis } from '@upstash/redis'

export const TURN_SHADOW_TTL_SECONDS = 600 // 10 minutos
export const DEFAULT_REDIS_TIMEOUT_MS = 200 // 200ms para operações de leitura/escrita

/**
 * Script Lua atômico para atualização do shadow no Redis:
 * - Se a chave já contiver o mesmo turn_id, só atualiza se a nova geração for >= atual (impede regressão).
 * - Se a chave contiver um turn_id diferente ou não existir, sobrescreve com o novo turno e generation.
 * - Renova o TTL a cada escrita bem-sucedida.
 */
export const UPDATE_TURN_SHADOW_LUA = `
local current_turn = redis.call('HGET', KEYS[1], 'turn_id')
local current_gen = tonumber(redis.call('HGET', KEYS[1], 'generation') or '0')
local new_turn = ARGV[1]
local new_gen = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

if current_turn == new_turn then
  if new_gen >= current_gen then
    redis.call('HSET', KEYS[1], 'turn_id', new_turn, 'generation', tostring(new_gen))
    redis.call('EXPIRE', KEYS[1], ttl)
    return 1
  else
    return 0
  end
else
  redis.call('HSET', KEYS[1], 'turn_id', new_turn, 'generation', tostring(new_gen))
  redis.call('EXPIRE', KEYS[1], ttl)
  return 1
end
`

export function isRedisTurnShadowEnabled(): boolean {
  return process.env.AI_TURNS_REDIS_SHADOW_ENABLED === 'true'
}

export function getTurnShadowKey(accountId: string, conversationId: string): string {
  return `flowhub:${accountId}:conv:${conversationId}:turn`
}

let _cachedRedis: Redis | null | undefined

export function getRedisClient(): Redis | null {
  if (_cachedRedis !== undefined) return _cachedRedis

  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.FLOWHUB_KV_REST_API_URL ||
    process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.FLOWHUB_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    _cachedRedis = null
    return null
  }

  try {
    _cachedRedis = new Redis({ url, token })
    return _cachedRedis
  } catch (err) {
    console.warn('[turn-shadow] Falha ao instanciar Upstash Redis client:', err)
    _cachedRedis = null
    return null
  }
}

export interface UpdateTurnShadowArgs {
  accountId: string
  conversationId: string
  turnId: string
  generation: number
}

/**
 * Atualiza o shadow do turno no Redis de forma atômica via script Lua.
 * Executado pós-ACK com timeout curto. Falhas são suprimidas sem interromper o fluxo.
 */
export async function updateTurnShadow(
  redis: Redis,
  args: UpdateTurnShadowArgs,
  opts?: { timeoutMs?: number },
): Promise<boolean> {
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_REDIS_TIMEOUT_MS
  const key = getTurnShadowKey(args.accountId, args.conversationId)

  try {
    const evalPromise = redis.eval(
      UPDATE_TURN_SHADOW_LUA,
      [key],
      [args.turnId, String(args.generation), String(TURN_SHADOW_TTL_SECONDS)],
    )

    const timerPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis eval timeout')), timeoutMs),
    )

    const result = await Promise.race([evalPromise, timerPromise])
    return result === 1
  } catch (err) {
    console.warn('[turn-shadow] Falha ao atualizar shadow no Redis:', err instanceof Error ? err.message : err)
    return false
  }
}

export interface CheckTurnShadowStaleArgs {
  accountId: string
  conversationId: string
  turnId: string
  expectedGeneration: number
}

/**
 * Avalia se o ticket acordou comprovadamente obsoleto segundo o Redis Shadow.
 * Retorna true APENAS se houver evidência inequívoca de que o MESMO turn_id avançou para geração maior.
 * Qualquer miss, erro, timeout, turn_id diferente ou geração menor/igual retorna FALSE (fallback para Postgres).
 */
export async function checkTurnShadowStale(
  redis: Redis,
  args: CheckTurnShadowStaleArgs,
  opts?: { timeoutMs?: number },
): Promise<boolean> {
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_REDIS_TIMEOUT_MS
  const key = getTurnShadowKey(args.accountId, args.conversationId)

  try {
    const fetchPromise = redis.hmget<{ turn_id?: string; generation?: string | number }>(
      key,
      'turn_id',
      'generation',
    )

    const timerPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis hmget timeout')), timeoutMs),
    )

    const shadow = await Promise.race([fetchPromise, timerPromise])
    if (!shadow || !shadow.turn_id) {
      return false // cache miss -> fallback Postgres
    }

    // Só descarta antecipadamente se for o MESMO turno e a geração no shadow for estritamente maior
    if (shadow.turn_id === args.turnId) {
      const shadowGen = typeof shadow.generation === 'number' ? shadow.generation : Number(shadow.generation || 0)
      if (shadowGen > args.expectedGeneration) {
        return true // stale confirmado
      }
    }

    return false // turn_id diferente, geração menor/igual -> fallback Postgres
  } catch (err) {
    console.warn('[turn-shadow] Falha no stale check do Redis, fallback para Postgres:', err instanceof Error ? err.message : err)
    return false
  }
}

/** Test-only helper para resetar o singleton nos testes. */
export function __resetRedisClientForTests() {
  _cachedRedis = undefined
}
