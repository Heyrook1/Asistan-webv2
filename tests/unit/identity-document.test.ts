import { describe, expect, it } from 'vitest'

import {
  isValidIdentityDocument,
  normalizeIdentityDocument,
} from '@/lib/identity/identity-document'

describe('identity-document', () => {
  it('normalizes passport-style numbers', () => {
    expect(normalizeIdentityDocument(' u12345678 ')).toBe('U12345678')
    expect(isValidIdentityDocument('U12345678')).toBe(true)
  })

  it('rejects too short or invalid TC checksum', () => {
    expect(isValidIdentityDocument('12')).toBe(false)
    expect(isValidIdentityDocument('11111111111')).toBe(false)
  })
})
