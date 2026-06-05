import 'server-only'

import { env } from '@/lib/env'

type RateLimitInput = {
  action: string
  userId: string
  businessId?: string | null
  limit: number
  windowMs: number
}

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterMs: number
  resetAt: Date
  source: 'upstash' | 'memory'
}

type MemoryBucket = {
  count: number
  resetAtMs: number
}

type RateLimitGlobalState = {
  buckets: Map<string, MemoryBucket>
  ops: number
  hasLoggedRedisFailure: boolean
}

const memoryStateKey = '__asistanRateLimitState__'
const redisReady = Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken)

function getMemoryState(): RateLimitGlobalState {
  const globalState = globalThis as typeof globalThis & {
    [memoryStateKey]?: RateLimitGlobalState
  }

  if (!globalState[memoryStateKey]) {
    globalState[memoryStateKey] = {
      buckets: new Map<string, MemoryBucket>(),
      ops: 0,
      hasLoggedRedisFailure: false,
    }
  }

  return globalState[memoryStateKey]
}

function buildRateKey(input: Pick<RateLimitInput, 'action' | 'userId' | 'businessId'>) {
  const businessId = input.businessId ?? 'global'
  return `rl:${input.action}:${businessId}:${input.userId}`
}

function computeResult(params: {
  count: number
  limit: number
  retryAfterMs: number
  source: RateLimitResult['source']
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

function checkInMemory(input: RateLimitInput): RateLimitResult {
  const state = getMemoryState()
  const key = buildRateKey(input)
  const now = Date.now()

  const existing = state.buckets.get(key)
  const resetAtMs = !existing || existing.resetAtMs <= now ? now + input.windowMs : existing.resetAtMs
  const count = !existing || existing.resetAtMs <= now ? 1 : existing.count + 1

  state.buckets.set(key, { count, resetAtMs })
  state.ops += 1

  // Lightweight cleanup so the fallback map does not grow forever in long-lived processes.
  if (state.ops % 100 === 0) {
    for (const [bucketKey, bucket] of state.buckets.entries()) {
      if (bucket.resetAtMs <= now) state.buckets.delete(bucketKey)
    }
  }

  return computeResult({
    count,
    limit: input.limit,
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

async function checkWithUpstash(input: RateLimitInput): Promise<RateLimitResult> {
  const key = buildRateKey(input)
  const incrRaw = await runRedisCommand(['INCR', key])
  const count = Number(incrRaw)
  if (!Number.isFinite(count)) {
    throw new Error('Invalid INCR response from Upstash')
  }

  if (count === 1) {
    await runRedisCommand(['PEXPIRE', key, String(input.windowMs)])
  }

  let ttl = Number(await runRedisCommand(['PTTL', key]))
  if (!Number.isFinite(ttl) || ttl < 0) {
    await runRedisCommand(['PEXPIRE', key, String(input.windowMs)])
    ttl = input.windowMs
  }

  return computeResult({
    count,
    limit: input.limit,
    retryAfterMs: ttl,
    source: 'upstash',
  })
}

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  if (input.limit <= 0 || input.windowMs <= 0) {
    throw new Error('Rate limit configuration must be positive')
  }

  if (!redisReady) {
    return checkInMemory(input)
  }

  try {
    return await checkWithUpstash(input)
  } catch (error) {
    const state = getMemoryState()
    if (!state.hasLoggedRedisFailure) {
      state.hasLoggedRedisFailure = true
      console.error('Rate limit fallback to memory store due to Upstash error:', error)
    }
    return checkInMemory(input)
  }
}
