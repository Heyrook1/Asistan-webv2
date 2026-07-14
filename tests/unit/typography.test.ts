import { describe, expect, it } from 'vitest'

import { BRAND_TYPOGRAPHY, cssFontStack } from '@/lib/brand/typography'

describe('lib/brand/typography', () => {
  it('leads stacks with shipped Manrope', () => {
    expect(BRAND_TYPOGRAPHY.stacks.sans[0]).toBe('Manrope')
    expect(BRAND_TYPOGRAPHY.stacks.heading[0]).toBe('Manrope')
    expect(BRAND_TYPOGRAPHY.primary).toBe('Manrope')
    expect(BRAND_TYPOGRAPHY.delivery).toBe('@fontsource/manrope')
  })

  it('does not lead with aspirational OS fonts', () => {
    for (const lead of BRAND_TYPOGRAPHY.forbiddenLead) {
      expect(BRAND_TYPOGRAPHY.stacks.sans[0]).not.toBe(lead)
      expect(BRAND_TYPOGRAPHY.stacks.heading[0]).not.toBe(lead)
    }
  })

  it('formats CSS stacks with quoted multi-word families', () => {
    expect(cssFontStack('sans')).toContain('Manrope')
    expect(cssFontStack('sans')).toContain("'Segoe UI'")
    expect(cssFontStack('mono')).toContain("'JetBrains Mono'")
  })
})
