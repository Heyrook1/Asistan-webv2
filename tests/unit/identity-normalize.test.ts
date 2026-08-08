import { describe, expect, it } from 'vitest'

import {
  canonicalizeFullName,
  generateGpiDisplay,
  hashIdentityDocument,
  hasDualStrongSignal,
  normalizeEmail,
  normalizePhoneE164,
  scoreIdentityMatch,
  shouldAutoLinkPerson,
  shouldSuggestPersonMatch,
} from '@/lib/identity/normalize'

describe('identity normalize', () => {
  it('normalizes TR mobiles to E.164', () => {
    expect(normalizePhoneE164('0532 111 22 33')).toBe('+905321112233')
    expect(normalizePhoneE164('+90 532 111 22 33')).toBe('+905321112233')
    expect(normalizePhoneE164('5321112233')).toBe('+905321112233')
  })

  it('normalizes email and name', () => {
    expect(normalizeEmail('  Ali@Example.COM ')).toBe('ali@example.com')
    expect(canonicalizeFullName('  Ali   Veli ')).toBe('ali veli')
  })

  it('hashes identity with pepper stably', () => {
    const a = hashIdentityDocument('U12345678', 'pepper-test-value')
    const b = hashIdentityDocument('U12345678', 'pepper-test-value')
    const c = hashIdentityDocument('U12345678', 'other-pepper')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toHaveLength(64)
  })

  it('generates opaque non-sequential GPI codes', () => {
    const a = generateGpiDisplay()
    const b = generateGpiDisplay()
    expect(a).toMatch(/^GPI-[0-9A-F]{10}$/)
    expect(a).not.toBe(b)
  })
})

describe('identity score matrix', () => {
  const base = {
    phoneE164: '+905321112233',
    emailNorm: 'a@b.com',
    identityHash: 'abc',
    fullNameCanon: 'ali veli',
    birthDateIso: '1990-01-01',
  }

  it('does NOT auto-link on a single weak signal (phone-only)', () => {
    const score = scoreIdentityMatch(base, {
      ...base,
      emailNorm: null,
      identityHash: null,
      fullNameCanon: 'other',
      birthDateIso: null,
    })
    expect(score.phone).toBe(0.25)
    // phone-only must not silently merge across a possibly different-context Person
    expect(shouldAutoLinkPerson(score)).toBe(false)
  })

  it('does NOT auto-link on a single weak signal (email-only)', () => {
    const score = scoreIdentityMatch(base, {
      ...base,
      phoneE164: null,
      identityHash: null,
      fullNameCanon: 'other',
      birthDateIso: null,
    })
    expect(score.email).toBe(0.15)
    expect(shouldAutoLinkPerson(score)).toBe(false)
  })

  it('auto-links on a matching identity document hash alone', () => {
    const score = scoreIdentityMatch(base, {
      ...base,
      phoneE164: null,
      emailNorm: null,
      fullNameCanon: 'other',
      birthDateIso: null,
    })
    expect(score.identityHash).toBeGreaterThan(0)
    expect(shouldAutoLinkPerson(score)).toBe(true)
  })

  it('auto-links on dual strong signals (phone + email)', () => {
    const score = scoreIdentityMatch(base, {
      ...base,
      identityHash: null,
      fullNameCanon: 'other',
      birthDateIso: null,
    })
    expect(score.phone).toBe(0.25)
    expect(score.email).toBe(0.15)
    expect(shouldAutoLinkPerson(score)).toBe(true)
  })

  it('requires dual strong signals for silent merge bar', () => {
    const score = scoreIdentityMatch(base, base)
    expect(score.total).toBeGreaterThanOrEqual(0.95)
    expect(hasDualStrongSignal(score)).toBe(true)
  })

  it('does not auto-link on name alone', () => {
    const score = scoreIdentityMatch(
      { ...base, phoneE164: null, emailNorm: null, identityHash: null },
      { ...base, phoneE164: '+905399999999', emailNorm: 'x@y.com', identityHash: 'zzz' },
    )
    expect(score.phone).toBe(0)
    expect(shouldAutoLinkPerson(score)).toBe(false)
  })

  it('suggests queue for phone-only partial match', () => {
    const score = scoreIdentityMatch(
      { ...base, emailNorm: null, identityHash: null, fullNameCanon: 'other', birthDateIso: null },
      { ...base, emailNorm: null, identityHash: null, fullNameCanon: 'zz', birthDateIso: null },
    )
    expect(score.phone).toBe(0.25)
    expect(shouldAutoLinkPerson(score)).toBe(false)
    expect(shouldSuggestPersonMatch(score)).toBe(true)
  })
})
