import 'server-only'

import type { CreatePaymentIntentResult, MembershipPaymentProvider } from './types'
import { manualMembershipProvider } from './manual-provider'

/**
 * Stripe PaymentIntent stub — activates when STRIPE_SECRET_KEY is set.
 * Without keys, factory falls back to MANUAL (no hard dependency on stripe SDK).
 */
export const stripeMembershipProvider: MembershipPaymentProvider = {
  kind: 'STRIPE',
  async createIntent(input): Promise<CreatePaymentIntentResult> {
    const secret = process.env.STRIPE_SECRET_KEY?.trim()
    if (!secret) {
      return manualMembershipProvider.createIntent(input)
    }

    const amountMinor = Math.round(input.amount * 100)
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secret}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(amountMinor),
        currency: input.currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        description: `Asistan Health · ${input.planName} · ${input.billingPeriod}`,
        'metadata[paymentId]': input.paymentId,
        'metadata[businessId]': input.businessId,
        'metadata[planCode]': input.planCode,
        ...(input.customerEmail ? { receipt_email: input.customerEmail } : {}),
      }),
    })

    const json = (await res.json()) as {
      id?: string
      client_secret?: string
      error?: { message?: string }
    }

    if (!res.ok || !json.id) {
      throw new Error(json.error?.message || 'Stripe PaymentIntent oluşturulamadı')
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      process.env.GOOGLE_CALENDAR_REDIRECT_ORIGIN?.replace(/\/$/, '') ||
      'https://kktc.asistan.online'

    return {
      provider: 'STRIPE',
      providerRef: json.id,
      checkoutUrl: `${origin}/dashboard/ayarlar?tab=abonelik&payment=${input.paymentId}&stripe=1`,
      instructions: [
        'Kart ödemesi Stripe ile oluşturuldu.',
        `PaymentIntent: ${json.id}`,
        'Ödeme tamamlandığında webhook paketi otomatik etkinleştirir.',
        json.client_secret ? `client_secret alındı (checkout UI sonraki adım).` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }
  },
}
