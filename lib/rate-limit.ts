/**
 * Public / API-route rate-limit facade.
 *
 * Single backend: `lib/security/rate-limit.ts` (Upstash when configured, otherwise
 * in-process memory with a production warning). Do not add a second Map here.
 */
import 'server-only'

import { consumeRateLimit, getRateLimitBackendPreference, isUpstashRateLimitConfigured } from '@/lib/security/rate-limit'
import { parseWindowMs, RATE_LIMITS } from '@/lib/security/rate-window'

export { parseWindowMs, RATE_LIMITS }

/**
 * Key-based check used by public routes.
 * @returns true when the request is allowed
 */
export async function checkRateLimit(
  key: string,
  limit = 10,
  window = '1 m'
): Promise<boolean> {
  const result = await consumeRateLimit({
    key: `pub:${key}`,
    limit,
    windowMs: parseWindowMs(window),
  })
  return result.allowed
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export { getRateLimitBackendPreference, isUpstashRateLimitConfigured }
