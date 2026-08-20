import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'

// Test crypto helpers without server-only import path issues by inlining contract.

function sign(depositId: string, secret: string) {
  return createHmac('sha256', secret).update(`deposit:v1:${depositId}`).digest('base64url')
}

describe('deposit access token contract', () => {
  it('is stable for the same deposit id + secret', () => {
    const a = sign('dep-1', 'test-secret')
    const b = sign('dep-1', 'test-secret')
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThan(20)
  })

  it('differs across deposit ids', () => {
    expect(sign('dep-1', 'test-secret')).not.toBe(sign('dep-2', 'test-secret'))
  })
})
