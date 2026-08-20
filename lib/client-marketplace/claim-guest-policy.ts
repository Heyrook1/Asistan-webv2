/**
 * Pure helpers for guest-booking claim policy (unit-tested).
 * Phone / national-ID claim is intentionally unsupported without OTP.
 */

import { normalizeEmail } from '@/lib/identity/normalize'

export function claimEmailFromAuth(email: string | null | undefined): string | null {
  return normalizeEmail(email)
}

/** True when we have a verified-email signal strong enough to claim orphans. */
export function canClaimGuestBookingsByEmail(email: string | null | undefined): boolean {
  return Boolean(claimEmailFromAuth(email))
}
