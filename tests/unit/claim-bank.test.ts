import { describe, it, expect } from 'vitest'

import {
  APPROVED_CLAIMS,
  FORBIDDEN_CLAIM_PATTERNS,
  STAGE_HONESTY,
  getClaim,
  looksLikeForbiddenClaim,
  looksLikeStageOverclaim,
} from '@/lib/brand/claim-bank'

describe('lib/brand/claim-bank', () => {
  it('exposes approved KVKK-minded wording', () => {
    expect(getClaim('kvkk-controls', 'tr')).toBe('KVKK odaklı kontroller')
    expect(getClaim('kvkk-controls', 'en')).toMatch(/KVKK/i)
    expect(APPROVED_CLAIMS.some((c) => c.id === 'rbac')).toBe(true)
    expect(getClaim('early-access', 'tr')).toBe('Erken erişim')
  })

  it('flags forbidden certification-style claims', () => {
    expect(looksLikeForbiddenClaim('KVKK Uyumlu')).toBe(true)
    expect(looksLikeForbiddenClaim('KVKK uyumu')).toBe(true)
    expect(looksLikeForbiddenClaim('%99.9 uptime')).toBe(true)
    expect(looksLikeForbiddenClaim('ISO 27001 certified')).toBe(true)
    expect(looksLikeForbiddenClaim('KVKK odaklı kontroller')).toBe(false)
    expect(FORBIDDEN_CLAIM_PATTERNS.length).toBeGreaterThan(3)
  })

  it('flags present-tense “ilk tercih” leadership as stage overclaim', () => {
    expect(STAGE_HONESTY.productStage).toBe('early-access')
    expect(looksLikeStageOverclaim('KKTC’de sağlık işletmelerinin ilk tercih ettiği altyapı')).toBe(
      true,
    )
    expect(looksLikeForbiddenClaim('KKTC’de sağlık işletmelerinin ilk tercih ettiği altyapı')).toBe(
      true,
    )
    expect(looksLikeStageOverclaim('piyasa lideri klinik SaaS')).toBe(true)
    expect(
      looksLikeStageOverclaim(
        'Hedefimiz: KKTC kliniklerinin kanıtladıkça tercih ettiği operasyon altyapısı olmak.',
      ),
    ).toBe(false)
  })

  it('flags hospital-depth claims postponed by product boundary', () => {
    expect(STAGE_HONESTY.productFocus).toBe('outpatient-smb')
    expect(looksLikeForbiddenClaim('Resmi e-reçete entegrasyonu')).toBe(true)
    expect(looksLikeForbiddenClaim('E-reçete oluşturuldu')).toBe(true)
    expect(looksLikeForbiddenClaim('telehealth hazır')).toBe(true)
    expect(looksLikeForbiddenClaim('LIS laboratuvar entegrasyon')).toBe(true)
    expect(looksLikeForbiddenClaim('Yazdırılabilir klinik reçete')).toBe(false)
  })
})
