import 'server-only'

import { env } from '@/lib/env'

export type RateLimitSource = 'upstash' | 'memory'

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterMs: number
  resetAt: Date
  source: RateLimitSource
}

type RateLimitIdentityInput = {
  action: string
  userId: string
  businessId?: string | null
  limit: number
  windowMs: number
}

type MemoryBucket = {
  count: number
  resetAtMs: number
}

type RateLimitGlobalState = {
  buckets: Map<string, MemoryBucket>
  ops: number
  hasLoggedRedisFailure: boolean
  hasLoggedMemoryOnlyProd: boolean
}

const memoryStateKey = '__asistanRateLimitState__'
const redisConfigured = Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken)

function getMemoryState(): RateLimitGlobalState {
  const globalState = globalThis as typeof globalThis & {
    [memoryStateKey]?: RateLimitGlobalState
  }

  if (!globalState[memoryStateKey]) {
    globalState[memoryStateKey] = {
      buckets: new Map<string, MemoryBucket>(),
      ops: 0,
      hasLoggedRedisFailure: false,
      hasLoggedMemoryOnlyProd: false,
    }
  }

  return globalState[memoryStateKey]
}

function warnMemoryOnlyInProduction() {
  if (process.env.NODE_ENV !== 'production') return
  const state = getMemoryState()
  if (state.hasLoggedMemoryOnlyProd) return
  state.hasLoggedMemoryOnlyProd = true
  console.error(
    '[rate-limit] Upstash Redis is not configured. Falling back to in-process memory — limits are NOT shared across instances and will under-enforce under load. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.'
  )
}

function computeResult(params: {
  count: number
  limit: number
  retryAfterMs: number
  source: RateLimitSource
}): RateLimitResult {
  const remaining = Math.max(0, params.limit - params.count)
  const retryAfterMs = Math.max(0, params.retryAfterMs)
  return {
    allowed: params.count <= params.limit,
    limit: params.limit,
    remaining,
    retryAfterMs,
    resetAt: new Date(Date.now() + retryAfterMs),
    source: params.source,
  }
}

function checkInMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  warnMemoryOnlyInProduction()
  const state = getMemoryState()
  const now = Date.now()

  const existing = state.buckets.get(key)
  const resetAtMs = !existing || existing.resetAtMs <= now ? now + windowMs : existing.resetAtMs
  const count = !existing || existing.resetAtMs <= now ? 1 : existing.count + 1

  state.buckets.set(key, { count, resetAtMs })
  state.ops += 1

  if (state.ops % 100 === 0) {
    for (const [bucketKey, bucket] of state.buckets.entries()) {
      if (bucket.resetAtMs <= now) state.buckets.delete(bucketKey)
    }
  }

  return computeResult({
    count,
    limit,
    retryAfterMs: Math.max(0, resetAtMs - now),
    source: 'memory',
  })
}

async function runRedisCommand(parts: string[]): Promise<unknown> {
  const baseUrl = env.upstashRedisRestUrl
  const token = env.upstashRedisRestToken
  if (!baseUrl || !token) {
    throw new Error('Upstash credentials are missing')
  }

  const commandPath = parts.map((part) => encodeURIComponent(part)).join('/')
  const response = await fetch(`${baseUrl}/${commandPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Upstash command failed with status ${response.status}`)
  }

  const payload = (await response.json()) as { result?: unknown; error?: string }
  if (payload.error) {
    throw new Error(payload.error)
  }
  return payload.result
}

async function checkWithUpstash(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const incrRaw = await runRedisCommand(['INCR', key])
  const count = Number(incrRaw)
  if (!Number.isFinite(count)) {
    throw new Error('Invalid INCR response from Upstash')
  }

  if (count === 1) {
    await runRedisCommand(['PEXPIRE', key, String(windowMs)])
  }

  let ttl = Number(await runRedisCommand(['PTTL', key]))
  if (!Number.isFinite(ttl) || ttl < 0) {
    await runRedisCommand(['PEXPIRE', key, String(windowMs)])
    ttl = windowMs
  }

  return computeResult({
    count,
    limit,
    retryAfterMs: ttl,
    source: 'upstash',
  })
}

/** Shared primitive — all public + session rate limits must go through here. */
export async function consumeRateLimit(params: {
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitResult> {
  const { key, limit, windowMs } = params
  if (limit <= 0 || windowMs <= 0) {
    throw new Error('Rate limit configuration must be positive')
  }

  if (!redisConfigured) {
    // Fail closed in production: a shared limiter is a security control, and the
    // in-process memory fallback silently under-enforces across instances. Rather
    // than pretend to rate limit, treat the missing Upstash config as a hard error.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[rate-limit] Upstash Redis is required in production but is not configured. ' +
          'Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Refusing to serve requests ' +
          'with an ineffective in-memory limiter.'
      )
    }
    return checkInMemory(key, limit, windowMs)
  }

  try {
    return await checkWithUpstash(key, limit, windowMs)
  } catch (error) {
    const state = getMemoryState()
    if (!state.hasLoggedRedisFailure) {
      state.hasLoggedRedisFailure = true
      console.error('[rate-limit] Upstash error — falling back to memory for this process:', error)
    }
    return checkInMemory(key, limit, windowMs)
  }
}

function buildIdentityKey(input: Pick<RateLimitIdentityInput, 'action' | 'userId' | 'businessId'>) {
  const businessId = input.businessId ?? 'global'
  return `rl:${input.action}:${businessId}:${input.userId}`
}

/** Session / action based limiter (dashboard server actions). */
export async function checkRateLimit(input: RateLimitIdentityInput): Promise<RateLimitResult> {
  return consumeRateLimit({
    key: buildIdentityKey(input),
    limit: input.limit,
    windowMs: input.windowMs,
  })
}

export function isUpstashRateLimitConfigured() {
  return redisConfigured
}

export function getRateLimitBackendPreference(): RateLimitSource {
  return redisConfigured ? 'upstash' : 'memory'
}
