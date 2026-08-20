import 'server-only'

import { manualMembershipProvider } from './manual-provider'
import { stripeMembershipProvider } from './stripe-provider'
import type { MembershipPaymentProvider } from './types'

export function getMembershipPaymentProvider(): MembershipPaymentProvider {
  const mode = (process.env.PAYMENT_PROVIDER || 'manual').trim().toLowerCase()
  if (mode === 'stripe' && process.env.STRIPE_SECRET_KEY?.trim()) {
    return stripeMembershipProvider
  }
  return manualMembershipProvider
}

export function isStripeBillingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && (process.env.PAYMENT_PROVIDER || '').toLowerCase() === 'stripe')
}
