import 'server-only'

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

const ALGO = 'aes-256-gcm'

function requireEncryptionKey(): Buffer {
  const raw = process.env.CALENDAR_TOKEN_ENCRYPTION_KEY?.trim()
  if (!raw) {
    throw new Error('CALENDAR_TOKEN_ENCRYPTION_KEY is not configured')
  }
  // Accept 64-char hex or any passphrase (hashed to 32 bytes).
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex')
  }
  return createHash('sha256').update(raw).digest()
}

/** Encrypt a secret at rest. Returns `iv:tag:ciphertext` (base64url segments). */
export function encryptSecret(plaintext: string): string {
  const key = requireEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':')
}

export function decryptSecret(payload: string): string {
  const key = requireEncryptionKey()
  const [ivB64, tagB64, dataB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted secret payload')
  }
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export function signOAuthState(payload: Record<string, unknown>): string {
  const key = requireEncryptionKey()
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = createHmac('sha256', key).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyOAuthState<T extends Record<string, unknown>>(token: string, maxAgeMs = 15 * 60 * 1000): T {
  const key = requireEncryptionKey()
  const [body, sig] = token.split('.')
  if (!body || !sig) throw new Error('Invalid OAuth state')
  const expected = createHmac('sha256', key).update(body).digest('base64url')
  if (sig.length !== expected.length || !timingSafeEqualStr(sig, expected)) {
    throw new Error('OAuth state signature mismatch')
  }
  const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T & { exp?: number }
  if (typeof parsed.exp === 'number' && Date.now() > parsed.exp) {
    throw new Error('OAuth state expired')
  }
  if (typeof parsed.exp === 'number' && parsed.exp - Date.now() > maxAgeMs + 60_000) {
    throw new Error('OAuth state invalid expiry')
  }
  return parsed
}

function timingSafeEqualStr(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
