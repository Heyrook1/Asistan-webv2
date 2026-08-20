import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Meta Cloud API webhook signature:
 * `X-Hub-Signature-256: sha256=<hex>` over the raw request body with the App Secret.
 */
export function verifyMetaHubSignature256(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false
  const match = signatureHeader.trim().match(/^sha256=([a-fA-F0-9]+)$/)
  if (!match) return false

  const expected = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')
  const provided = match[1]
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(provided, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function verifyBearerToken(
  authorizationHeader: string | null | undefined,
  altHeader: string | null | undefined,
  token: string
): boolean {
  if (!token) return false
  const header = authorizationHeader?.trim() || ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  const alt = altHeader?.trim() || ''
  if (!bearer && !alt) return false

  const expected = Buffer.from(token)
  const check = (value: string) => {
    const got = Buffer.from(value)
    if (got.length !== expected.length) return false
    try {
      return timingSafeEqual(got, expected)
    } catch {
      return false
    }
  }

  return check(bearer) || check(alt)
}
