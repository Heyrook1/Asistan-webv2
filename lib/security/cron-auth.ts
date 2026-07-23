import 'server-only'

import { timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; message: string }

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  try {
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}

/**
 * Cron routes are fail-closed in **every** environment (BUG-002):
 * missing/blank `CRON_SECRET` → 503 (same posture as Stripe webhook secret).
 * Local runs must set `CRON_SECRET` and send `Authorization: Bearer …`.
 */
export function authorizeCronRequest(request: NextRequest): CronAuthResult {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return { ok: false, status: 503, message: 'CRON_SECRET not configured' }
  }

  const header = request.headers.get('authorization')?.trim() || ''
  const expected = `Bearer ${secret}`
  if (!safeEqualString(header, expected)) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  return { ok: true }
}
