import { describe, expect, it } from 'vitest'

import {
  isValidIdentityDocument,
  normalizeIdentityDocument,
} from '@/lib/identity/identity-document'

describe('identity-document', () => {
  it('accepts KKTC 10-digit IDs', () => {
    expect(normalizeIdentityDocument('1234567890')).toBe('1234567890')
    expect(isValidIdentityDocument(' 1234567890 ')).toBe(true)
  })

  it('rejects pure digit lengths that are not 10 (KKTC) or 11 (TR)', () => {
    expect(isValidIdentityDocument('123456789')).toBe(false) // 9
    expect(isValidIdentityDocument('123456')).toBe(false) // legacy 6 without padding
    expect(isValidIdentityDocument('11111111111')).toBe(false) // bad TC checksum
  })

  it('normalizes passport-style numbers', () => {
    expect(normalizeIdentityDocument(' u12345678 ')).toBe('U12345678')
    expect(isValidIdentityDocument('U12345678')).toBe(true)
  })

  it('rejects too short', () => {
    expect(isValidIdentityDocument('12')).toBe(false)
  })
})
