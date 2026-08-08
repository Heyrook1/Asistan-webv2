import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Rate-limit must not throw when Upstash is unset.
 * (Previous throw blanked /api/health and availability for every clinic.)
 */
describe('consumeRateLimit without Upstash', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/env')
    vi.resetModules()
  })

  it('falls back to memory and allows traffic', async () => {
    vi.resetModules()
    vi.doMock('@/lib/env', () => ({
      env: {
        upstashRedisRestUrl: undefined,
        upstashRedisRestToken: undefined,
      },
    }))

    const { consumeRateLimit, getRateLimitBackendPreference } = await import(
      '@/lib/security/rate-limit'
    )

    expect(getRateLimitBackendPreference()).toBe('memory')

    const result = await consumeRateLimit({
      key: `test-booking-canary-${Date.now()}`,
      limit: 10,
      windowMs: 60_000,
    })

    expect(result.allowed).toBe(true)
    expect(result.source).toBe('memory')
  })
})
