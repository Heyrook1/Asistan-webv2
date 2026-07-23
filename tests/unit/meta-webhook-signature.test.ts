import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import {
  verifyBearerToken,
  verifyMetaHubSignature256,
} from '@/lib/security/meta-webhook-signature'

describe('verifyMetaHubSignature256', () => {
  const secret = 'test-app-secret'
  const body = '{"object":"whatsapp_business_account"}'

  it('accepts a valid sha256 signature', () => {
    const digest = createHmac('sha256', secret).update(body, 'utf8').digest('hex')
    expect(verifyMetaHubSignature256(body, `sha256=${digest}`, secret)).toBe(true)
  })

  it('rejects missing, malformed, or wrong signatures', () => {
    expect(verifyMetaHubSignature256(body, null, secret)).toBe(false)
    expect(verifyMetaHubSignature256(body, 'sha1=abc', secret)).toBe(false)
    expect(verifyMetaHubSignature256(body, 'sha256=deadbeef', secret)).toBe(false)
    expect(verifyMetaHubSignature256(body, `sha256=${'a'.repeat(64)}`, 'other')).toBe(false)
  })
})

describe('verifyBearerToken', () => {
  it('accepts Authorization Bearer or x-webhook-token', () => {
    expect(verifyBearerToken('Bearer secret-token', null, 'secret-token')).toBe(true)
    expect(verifyBearerToken(null, 'secret-token', 'secret-token')).toBe(true)
  })

  it('rejects mismatches and empty token', () => {
    expect(verifyBearerToken('Bearer other', null, 'secret-token')).toBe(false)
    expect(verifyBearerToken('Bearer secret-token', null, '')).toBe(false)
    expect(verifyBearerToken(null, null, 'secret-token')).toBe(false)
  })
})
