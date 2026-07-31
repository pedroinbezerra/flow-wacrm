/**
 * Hybrid per-key rate limiter (Upstash Redis + In-memory Fallback).
 *
 * Primary: Uses Upstash Redis (@upstash/ratelimit) sliding-window algorithm
 * when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables
 * are set. Perfect for serverless (Vercel) multi-instance deployments.
 *
 * Fallback: Uses a Node in-memory Map fixed-window counter when Redis credentials
 * are missing (local dev, unit tests, single-instance VPS).
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { NextResponse } from 'next/server';

export interface RateLimitOptions {
  /** Max requests allowed in `windowMs`. */
  limit: number;
  /** Window size, milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Requests still allowed in the current window. */
  remaining: number;
  /** Unix ms when the bucket refills. */
  reset: number;
  limit: number;
}

export interface UpstashRedisMetrics {
  configured: boolean;
  status: 'connected' | 'error' | 'fallback_in_memory';
  usedMemory?: string;
  usedMemoryBytes?: number;
  totalCommandsProcessed?: number;
  instantaneousOpsPerSec?: number;
  keyspaceHits?: number;
  keyspaceMisses?: number;
  dbSize?: number;
  message?: string;
  error?: string;
}

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();
const LIGHT_SWEEP_EVERY = 1000;
let callsSinceSweep = 0;

function sweepExpired(now: number) {
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

function checkInMemoryRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();

  callsSinceSweep += 1;
  if (callsSinceSweep >= LIGHT_SWEEP_EVERY) {
    callsSinceSweep = 0;
    sweepExpired(now);
  }

  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetAt, limit };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetAt,
    limit,
  };
}

let redisClient: Redis | null | undefined;

function getUpstashRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.FLOWHUB_KV_REST_API_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.FLOWHUB_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return null;
  }

  try {
    redisClient = new Redis({ url, token });
    return redisClient;
  } catch (err) {
    console.error('[RateLimit] Erro ao inicializar cliente Upstash Redis:', err);
    redisClient = null;
    return null;
  }
}

const ratelimitCache = new Map<string, Ratelimit>();

function getRatelimitInstance(limit: number, windowMs: number): Ratelimit | null {
  const redis = getUpstashRedis();
  if (!redis) return null;

  const cacheKey = `${limit}:${windowMs}`;
  if (!ratelimitCache.has(cacheKey)) {
    ratelimitCache.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        analytics: true,
        prefix: 'wacrm:ratelimit',
      }),
    );
  }
  return ratelimitCache.get(cacheKey)!;
}

export async function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const upstashRatelimit = getRatelimitInstance(limit, windowMs);

  if (upstashRatelimit) {
    try {
      const res = await upstashRatelimit.limit(key);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
        limit: res.limit,
      };
    } catch (error) {
      console.warn('[RateLimit] Chamada Upstash Redis falhou, fallback para in-memory:', error);
    }
  }

  return checkInMemoryRateLimit(key, { limit, windowMs });
}

export async function getUpstashRedisMetrics(): Promise<UpstashRedisMetrics> {
  const redis = getUpstashRedis();
  if (!redis) {
    return {
      configured: false,
      status: 'fallback_in_memory',
      message: 'Variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN não estão configuradas no ambiente. A aplicação está utilizando limitação em memória local.',
    };
  }

  try {
    const redisAny = redis as unknown as {
      info?: () => Promise<string>;
      dbsize?: () => Promise<number>;
      call?: <T>(cmd: string, ...args: unknown[]) => Promise<T>;
    };

    let rawInfo: string | undefined;
    let dbsize: number | undefined;

    if (typeof redisAny.info === 'function') {
      rawInfo = await redisAny.info();
    } else if (typeof redisAny.call === 'function') {
      rawInfo = await redisAny.call<string>('info');
    }

    if (typeof redisAny.dbsize === 'function') {
      dbsize = await redisAny.dbsize();
    } else if (typeof redisAny.call === 'function') {
      dbsize = await redisAny.call<number>('dbsize');
    }

    const infoMap: Record<string, string> = {};
    if (typeof rawInfo === 'string') {
      const lines = rawInfo.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes(':')) {
          const [key, ...vals] = trimmed.split(':');
          infoMap[key.trim()] = vals.join(':').trim();
        }
      }
    }

    return {
      configured: true,
      status: 'connected',
      usedMemory: infoMap.used_memory_human || (infoMap.used_memory ? `${infoMap.used_memory} B` : 'N/A'),
      usedMemoryBytes: infoMap.used_memory ? parseInt(infoMap.used_memory, 10) : undefined,
      totalCommandsProcessed: infoMap.total_commands_processed ? parseInt(infoMap.total_commands_processed, 10) : 0,
      instantaneousOpsPerSec: infoMap.instantaneous_ops_per_sec ? parseInt(infoMap.instantaneous_ops_per_sec, 10) : 0,
      keyspaceHits: infoMap.keyspace_hits ? parseInt(infoMap.keyspace_hits, 10) : 0,
      keyspaceMisses: infoMap.keyspace_misses ? parseInt(infoMap.keyspace_misses, 10) : 0,
      dbSize: typeof dbsize === 'number' ? dbsize : 0,
    };
  } catch (err: any) {
    console.error('[RateLimit] Erro ao buscar métricas do Upstash Redis:', err);
    return {
      configured: true,
      status: 'error',
      error: err.message || 'Falha ao se comunicar com a REST API do Upstash Redis.',
    };
  }
}

/**
 * Standard 429 response with the headers clients expect (RFC 6585 +
 * draft-ietf-httpapi-ratelimit-headers). Callers just `return` this.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      retry_after_seconds: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
      },
    },
  );
}

/** Preconfigured budgets, tweak here not at call sites. */
export const RATE_LIMITS = {
  /** Individual message send. 60/min per user = one per second
   *  sustained, comfortable for a live human typing. */
  send: { limit: 60, windowMs: 60_000 },
  /** Broadcast dispatch. 5/min per user — even a 1 000-recipient
   *  broadcast is one call; this caps the rate at which a single user
   *  can launch campaigns, not the messages inside one. */
  broadcast: { limit: 5, windowMs: 60_000 },
  /** Reaction add/swap/remove. More permissive than send — users
   *  fidget with reactions and a single "swap" is actually two calls
   *  (remove + add) under the hood. */
  react: { limit: 120, windowMs: 60_000 },
  /** Invitation peek (public, per-IP). 30/min lets a forwarded link
   *  retry a handful of times under flaky connectivity without
   *  enabling brute-force token enumeration. With 256-bit tokens the
   *  enumeration risk is theoretical; this is belt-and-braces. */
  invitationPeek: { limit: 30, windowMs: 60_000 },
  /** Invitation redeem (authed, per-IP+user). Tighter than peek —
   *  successful redemption mutates two profiles and an invite row, so
   *  the abuse surface is "spam join attempts." */
  invitationRedeem: { limit: 10, windowMs: 60_000 },
  /** Admin-only account / member-management actions: create/revoke
   *  invitation, rename account, change member role, remove member,
   *  transfer ownership. 30/min per user is comfortably above any
   *  realistic legitimate use (the Members tab is a clicks-only UI)
   *  while still bounding accidental abuse from a script run in a
   *  loop or a compromised admin session spamming role flips. */
  adminAction: { limit: 30, windowMs: 60_000 },
} as const;

/** Test-only helper. Clears in-memory buckets and cached Upstash client. */
export function __resetRateLimitForTests() {
  buckets.clear();
  callsSinceSweep = 0;
  redisClient = undefined;
  ratelimitCache.clear();
}
