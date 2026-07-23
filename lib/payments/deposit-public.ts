import 'server-only'

import { prisma } from '@/lib/prisma'
import { isStripeBillingConfigured } from '@/lib/payments'
import { markAppointmentDepositPaid } from '@/lib/payments/deposit'

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    process.env.GOOGLE_CALENDAR_REDIRECT_ORIGIN?.replace(/\/$/, '') ||
    'https://kktc.asistan.online'
  )
}

export type PublicDepositView = {
  depositId: string
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'WAIVED'
  provider: 'MANUAL' | 'STRIPE'
  instructions: string | null
  clinicName: string
  /** Stripe Checkout URL when payment still needed */
  payUrl: string | null
  stripeStatus: string | null
  error: string | null
}

/**
 * Public-safe deposit status for /book/deposit (no PHI beyond clinic name).
 */
export async function getPublicDepositView(input: {
  depositId: string
  paymentIntentId?: string | null
  checkoutSessionId?: string | null
}): Promise<PublicDepositView> {
  const row = await prisma.appointmentDeposit.findUnique({
    where: { id: input.depositId },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      provider: true,
      providerRef: true,
      checkoutUrl: true,
      instructions: true,
      business: { select: { name: true } },
    },
  })

  if (!row) {
    return {
      depositId: input.depositId,
      amount: 0,
      currency: 'TRY',
      status: 'FAILED',
      provider: 'MANUAL',
      instructions: null,
      clinicName: '',
      payUrl: null,
      stripeStatus: null,
      error: 'Depozito bulunamadı',
    }
  }

  const base: PublicDepositView = {
    depositId: row.id,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    provider: row.provider,
    instructions: row.instructions,
    clinicName: row.business.name,
    payUrl: row.checkoutUrl,
    stripeStatus: null,
    error: null,
  }

  if (row.status === 'PAID') {
    return { ...base, payUrl: null }
  }

  if (row.provider !== 'STRIPE' || !isStripeBillingConfigured()) {
    return base
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secret) return base

  // Prefer Checkout Session confirmation when returning from Stripe
  if (input.checkoutSessionId) {
    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(input.checkoutSessionId)}`,
      { headers: { authorization: `Bearer ${secret}` } }
    )
    const session = (await sessionRes.json()) as {
      payment_status?: string
      metadata?: { depositId?: string }
      error?: { message?: string }
    }
    if (
      sessionRes.ok &&
      session.metadata?.depositId === row.id &&
      session.payment_status === 'paid'
    ) {
      await markAppointmentDepositPaid(row.id)
      return { ...base, status: 'PAID', payUrl: null, stripeStatus: 'paid' }
    }
  }

  const piId = input.paymentIntentId || row.providerRef
  if (piId && !piId.startsWith('manual_')) {
    if (input.paymentIntentId && row.providerRef && input.paymentIntentId !== row.providerRef) {
      return { ...base, error: 'Ödeme referansı eşleşmiyor', payUrl: null }
    }
    const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(piId)}`, {
      headers: { authorization: `Bearer ${secret}` },
    })
    const pi = (await piRes.json()) as { status?: string; error?: { message?: string } }
    if (piRes.ok && pi.status) {
      base.stripeStatus = pi.status
      if (pi.status === 'succeeded') {
        await markAppointmentDepositPaid(row.id)
        return { ...base, status: 'PAID', payUrl: null, stripeStatus: 'succeeded' }
      }
    }
  }

  // Ensure a fresh Checkout Session URL for card payment (no stripe.js required)
  const payUrl = await ensureDepositCheckoutSession({
    depositId: row.id,
    amount: Number(row.amount),
    currency: row.currency,
    clinicName: row.business.name,
  })
  if (payUrl) {
    await prisma.appointmentDeposit.update({
      where: { id: row.id },
      data: { checkoutUrl: payUrl },
    })
    base.payUrl = payUrl
  }

  return base
}

async function ensureDepositCheckoutSession(input: {
  depositId: string
  amount: number
  currency: string
  clinicName: string
}): Promise<string | null> {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secret || !isStripeBillingConfigured()) return null

  const origin = siteOrigin()
  const amountMinor = Math.round(input.amount * 100)
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${origin}/book/deposit?depositId=${input.depositId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book/deposit?depositId=${input.depositId}&cancelled=1`,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': input.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(amountMinor),
    'line_items[0][price_data][product_data][name]': `Randevu depozitosu · ${input.clinicName}`,
    'metadata[kind]': 'appointment_deposit',
    'metadata[depositId]': input.depositId,
    'payment_intent_data[metadata][kind]': 'appointment_deposit',
    'payment_intent_data[metadata][depositId]': input.depositId,
  })

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const json = (await res.json()) as { url?: string; error?: { message?: string } }
  if (!res.ok || !json.url) return null
  return json.url
}
