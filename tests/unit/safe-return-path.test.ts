import { describe, expect, it } from 'vitest'

import { sanitizeReturnPath } from '@/lib/auth/safe-return-path'

describe('sanitizeReturnPath', () => {
  it('allows /client paths', () => {
    expect(sanitizeReturnPath('/client/bookings')).toBe('/client/bookings')
    expect(sanitizeReturnPath('/client/profile?x=1')).toBe('/client/profile?x=1')
  })

  it('allows reset-password', () => {
    expect(sanitizeReturnPath('/auth/reset-password')).toBe('/auth/reset-password')
  })

  it('rejects open redirects', () => {
    expect(sanitizeReturnPath('https://evil.com')).toBe('/')
    expect(sanitizeReturnPath('//evil.com')).toBe('/')
    expect(sanitizeReturnPath('/\\evil')).toBe('/')
    expect(sanitizeReturnPath('/client/../admin')).toBe('/')
  })

  it('rejects unknown absolute-looking paths', () => {
    expect(sanitizeReturnPath('/evil-admin')).toBe('/')
  })

  it('uses fallback', () => {
    expect(sanitizeReturnPath(null, '/dashboard')).toBe('/dashboard')
    expect(sanitizeReturnPath('', '/client')).toBe('/client')
  })
})
