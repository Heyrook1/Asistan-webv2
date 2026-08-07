import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Capability token for public deposit pages.
 * Prevents UUID-only IDOR on /book/deposit — link must carry HMAC `t`.
 */
function depositSecret(): string {
  return (
    process.env.DEPOSIT_ACCESS_SECRET?.trim() ||
    process.env.INTAKE_TOKEN_PEPPER?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    'asistan-deposit-v1'
  )
}

export function signDepositAccessToken(depositId: string): string {
  const id = depositId.trim()
  return createHmac('sha256', depositSecret()).update(`deposit:v1:${id}`).digest('base64url')
}

export function verifyDepositAccessToken(
  depositId: string,
  token: string | null | undefined
): boolean {
  if (!token || !depositId.trim()) return false
  const expected = signDepositAccessToken(depositId)
  const a = Buffer.from(expected)
  const b = Buffer.from(token.trim())
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function buildPublicDepositPath(depositId: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({
    depositId,
    t: signDepositAccessToken(depositId),
    ...(extra ?? {}),
  })
  return `/book/deposit?${params.toString()}`
}

export function buildPublicDepositUrl(depositId: string, origin: string, extra?: Record<string, string>): string {
  const base = origin.replace(/\/$/, '')
  return `${base}${buildPublicDepositPath(depositId, extra)}`
}
