import { describe, expect, it } from 'vitest'

import {
  canClaimGuestBookingsByEmail,
  claimEmailFromAuth,
} from '@/lib/client-marketplace/claim-guest-policy'

describe('guest booking claim policy', () => {
  it('requires a normalized verified email', () => {
    expect(canClaimGuestBookingsByEmail(null)).toBe(false)
    expect(canClaimGuestBookingsByEmail('')).toBe(false)
    expect(canClaimGuestBookingsByEmail('  ')).toBe(false)
    expect(canClaimGuestBookingsByEmail('hasta@ornek.com')).toBe(true)
    expect(claimEmailFromAuth('  Hasta@Ornek.COM ')).toBe('hasta@ornek.com')
  })

  it('does not treat phone as a claim secret (policy is email-only)', () => {
    // Phone is intentionally absent from the claim policy API — ownership proof would need OTP.
    expect(canClaimGuestBookingsByEmail('+905551112233')).toBe(false)
  })
})
