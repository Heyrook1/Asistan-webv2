import 'server-only'

import { createHash, randomBytes } from 'crypto'

export function createIntakeToken() {
  return randomBytes(24).toString('base64url')
}

export function hashIntakeToken(token: string) {
  const pepper = process.env.INTAKE_TOKEN_PEPPER?.trim() || 'asistan-intake-v1'
  return createHash('sha256').update(`${pepper}:${token}`).digest('hex')
}
