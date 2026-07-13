type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function parseWindowMs(window: string): number {
  const match = window.trim().match(/^(\d+)\s*(s|m|h)$/i)
  if (!match) return 60_000

  const value = Number(match[1])
  const unit = match[2].toLowerCase()

  if (unit === 's') return value * 1_000
  if (unit === 'm') return value * 60_000
  return value * 3_600_000
}

export async function checkRateLimit(
  key: string,
  limit = 10,
  window = '1 m'
): Promise<boolean> {
  const windowMs = parseWindowMs(window)
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (existing.count >= limit) {
    return false
  }

  existing.count += 1
  return true
}

export const RATE_LIMITS = {
  public: { limit: 10, window: '1 m' },
  auth: { limit: 5, window: '15 m' },
  api: { limit: 100, window: '1 m' },
  upload: { limit: 5, window: '1 h' },
} as const

export class RateLimitError extends Error {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message)
    this.name = 'RateLimitError'
  }
}
