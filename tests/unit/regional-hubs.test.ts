import { describe, expect, it } from 'vitest'

import {
  INTERNATIONAL_GATE,
  LIVE_HUB_ID,
  REGIONAL_HUBS,
  getLiveHub,
  liveSiteOrigin,
  openInternationalGate,
  plannedHubs,
  reservedSeoHosts,
} from '@/lib/brand/regional-hubs'

describe('lib/brand/regional-hubs', () => {
  it('locks production SEO to the KKTC hub', () => {
    expect(LIVE_HUB_ID).toBe('kktc')
    expect(getLiveHub().host).toBe('kktc.asistan.online')
    expect(getLiveHub().status).toBe('live')
    expect(getLiveHub().seoRole).toBe('canonical-production')
    expect(liveSiteOrigin()).toBe('https://kktc.asistan.online')
  })

  it('keeps planned hubs out of live SEO', () => {
    expect(plannedHubs().every((h) => h.status === 'planned')).toBe(true)
    expect(reservedSeoHosts()).toContain('tr.asistan.online')
    expect(reservedSeoHosts()).toContain('cy.asistan.online')
    expect(reservedSeoHosts()).toContain('asistan.online')
    expect(reservedSeoHosts()).not.toContain('kktc.asistan.online')
  })

  it('keeps international gate closed until proofs and EN exist', () => {
    expect(INTERNATIONAL_GATE.verifiedClinicProofs).toBe(false)
    expect(INTERNATIONAL_GATE.enMarketingSurface).toBe(false)
    expect(INTERNATIONAL_GATE.billingStoryForNewMarket).toBe(false)
    expect(openInternationalGate()).toBe(false)
    expect(REGIONAL_HUBS.apex.seoRole).toBe('company-apex')
  })
})
