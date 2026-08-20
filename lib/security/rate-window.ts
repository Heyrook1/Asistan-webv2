/** Pure rate-limit helpers — safe to import from unit tests (no env / Redis). */

export function parseWindowMs(window: string): number {
  const match = window.trim().match(/^(\d+)\s*(s|m|h)$/i)
  if (!match) return 60_000

  const value = Number(match[1])
  const unit = match[2].toLowerCase()

  if (unit === 's') return value * 1_000
  if (unit === 'm') return value * 60_000
  return value * 3_600_000
}

export const RATE_LIMITS = {
  public: { limit: 10, window: '1 m' },
  /** Login/register/forgot — keep abuse-resistant but allow a few typos. */
  auth: { limit: 20, window: '15 m' },
  api: { limit: 100, window: '1 m' },
  /** Soft poll endpoints (notifications/messages/client reads) */
  poll: { limit: 60, window: '1 m' },
  upload: { limit: 5, window: '1 h' },
} as const
