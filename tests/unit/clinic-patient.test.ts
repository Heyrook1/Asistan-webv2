import { describe, expect, it } from 'vitest'

import { normalizePhoneE164, phoneLookupVariants } from '@/lib/identity/normalize'

describe('clinic patient phone variants (I5)', () => {
  it('includes raw + E.164 + TR local forms for the same mobile', () => {
    const variants = phoneLookupVariants('0532 111 22 33')
    expect(variants).toContain('0532 111 22 33')
    expect(variants).toContain('+905321112233')
    expect(variants).toContain('05321112233')
    expect(variants).toContain('5321112233')
  })

  it('dedupes when input is already E.164', () => {
    const variants = phoneLookupVariants('+905321112233')
    expect(new Set(variants).size).toBe(variants.length)
    expect(variants).toContain('+905321112233')
    expect(variants).toContain('05321112233')
  })

  it('aligns stored phone preference with Person normalize', () => {
    expect(normalizePhoneE164('05321112233')).toBe('+905321112233')
    expect(normalizePhoneE164('+90 532 111 22 33')).toBe('+905321112233')
  })
})
