import { Ratelimit } from '@upstash/ratelimit'
import { env } from '@/lib/env'

// Create a new ratelimiter that allows 10 requests per 1 minute
const ratelimit = env.upstashRedisRestUrl
  ? new Ratelimit({
      redis: env.upstashRedisRestUrl,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
    })
  : null

export async function checkRateLimit(key: string, _limit: number = 10, _window: string = '1 m'): Promise<boolean> {
  if (!ratelimit) {
    // If Upstash not configured, allow all (development mode)
    return true
  }

  try {
    const result = await ratelimit.limit(key)
    return result.success
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open - allow request if service unavailable
    return true
  }
}

// Specific rate limits for different endpoints
export const RATE_LIMITS = {
  // General public endpoints
  public: { limit: 10, window: '1 m' },
  // Authentication endpoints (stricter)
  auth: { limit: 5, window: '15 m' },
  // API endpoints (moderate)
  api: { limit: 100, window: '1 m' },
  // File uploads (strict)
  upload: { limit: 5, window: '1 h' },
} as const

export class RateLimitError extends Error {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message)
    this.name = 'RateLimitError'
  }
}
