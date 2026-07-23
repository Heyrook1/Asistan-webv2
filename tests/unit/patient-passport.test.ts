import { describe, expect, it } from 'vitest'

import { getClaim, looksLikeForbiddenClaim } from '@/lib/brand/claim-bank'

describe('patient passport claims (D2)', () => {
  it('allows Asistan passport visit-summary wording', () => {
    expect(getClaim('asistan-passport', 'tr')).toContain('Asistan pasaportu')
    expect(looksLikeForbiddenClaim('Asistan pasaportu (ziyaret özeti)')).toBe(false)
  })

  it('forbids medical / FHIR passport present-tense claims', () => {
    expect(looksLikeForbiddenClaim('tıbbi pasaport hazır')).toBe(true)
    expect(looksLikeForbiddenClaim('FHIR pasaport live')).toBe(true)
  })
})
