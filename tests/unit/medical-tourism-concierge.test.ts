import { describe, expect, it } from 'vitest'

import {
  getConciergeCopy,
  parseConciergeLang,
  tourismLeadSchema,
} from '@/lib/concierge'
import { looksLikeForbiddenClaim } from '@/lib/brand/claim-bank'
import { INTERNATIONAL_GATE } from '@/lib/brand/regional-hubs'

describe('medical tourism concierge (D3)', () => {
  it('parses langs and exposes TR/EN/RU copy', () => {
    expect(parseConciergeLang('ru')).toBe('ru')
    expect(parseConciergeLang('xx')).toBe('en')
    expect(getConciergeCopy('tr').title).toMatch(/Kuzey Kıbrıs/)
    expect(getConciergeCopy('en').honesty).toMatch(/not a travel agency/i)
    expect(getConciergeCopy('ru').langLabel).toBe('Русский')
  })

  it('validates lead payload', () => {
    const ok = tourismLeadSchema.safeParse({
      fullName: 'Anna Petrova',
      phone: '+905331112233',
      preferredLang: 'ru',
      procedureInterest: 'Dental',
      clinicSlug: 'demo-klinik',
    })
    expect(ok.success).toBe(true)

    const bad = tourismLeadSchema.safeParse({
      fullName: 'A',
      phone: '1',
      preferredLang: 'de',
      procedureInterest: '',
    })
    expect(bad.success).toBe(false)
  })

  it('keeps AI / medical overclaims forbidden; EN surface unlocked', () => {
    expect(looksLikeForbiddenClaim('yapay zeka concierge')).toBe(true)
    expect(INTERNATIONAL_GATE.enMarketingSurface).toBe(true)
  })
})
