import { describe, expect, it } from 'vitest'

import {
  isValidIdentityDocument,
  normalizeIdentityDocument,
} from '@/lib/identity/identity-document'

describe('identity-document', () => {
  it('accepts KKTC 10-digit IDs', () => {
    expect(normalizeIdentityDocument('1234567890', 'KKTC')).toBe('1234567890')
    expect(isValidIdentityDocument(' 1234567890 ', 'KKTC')).toBe(true)
  })

  it('rejects 10 digits when type is TC', () => {
    expect(isValidIdentityDocument('1234567890', 'TC')).toBe(false)
  })

  it('accepts numeric passport for tourists', () => {
    expect(normalizeIdentityDocument('123456789', 'PASSPORT')).toBe('123456789')
    expect(normalizeIdentityDocument('AB1234567', 'PASSPORT')).toBe('AB1234567')
    expect(isValidIdentityDocument('12', 'PASSPORT')).toBe(false)
  })

  it('infers passport for digit lengths that are not 10/11', () => {
    expect(isValidIdentityDocument('123456789')).toBe(true) // tourist numeric passport
    expect(isValidIdentityDocument('11111111111')).toBe(false) // bad TC checksum
  })
})
