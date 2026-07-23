import 'server-only'

import { prisma } from '@/lib/prisma'
import { isStripeBillingConfigured } from '@/lib/payments'
import { trackFunnelEvent } from '@/lib/observability/funnel'
import { parseDepositPolicy, type DepositPolicy } from '@/lib/payments/deposit-policy'

export type { DepositPolicy }
export { parseDepositPolicy }

export type CreateAppointmentDepositResult = {
  depositId: string
  amount: number
  currency: string
  provider: 'MANUAL' | 'STRIPE'
  status: 'PENDING'
  checkoutUrl: string | null
  instructions: string
}

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    process.env.GOOGLE_CALENDAR_REDIRECT_ORIGIN?.replace(/\/$/, '') ||
    'https://kktc.asistan.online'
  )
}

async function createStripeDepositIntent(input: {
  depositId: string
  businessId: string
  appointmentId: string
  amount: number
  currency: string
  clinicName: string
}): Promise<{ providerRef: string; checkoutUrl: string; instructions: string } | null> {
  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secret || !isStripeBillingConfigured()) return null

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
      description: `Asistan Rezervasyon · depozito · ${input.clinicName}`,
      'metadata[kind]': 'appointment_deposit',
      'metadata[depositId]': input.depositId,
      'metadata[appointmentId]': input.appointmentId,
      'metadata[businessId]': input.businessId,
    }),
  })

  const json = (await res.json()) as {
    id?: string
    error?: { message?: string }
  }
  if (!res.ok || !json.id) {
    throw new Error(json.error?.message || 'Stripe deposit PaymentIntent oluşturulamadı')
  }

  const origin = siteOrigin()
  return {
    providerRef: json.id,
    checkoutUrl: `${origin}/book/deposit?depositId=${input.depositId}&pi=${json.id}`,
    instructions: [
      'Kart ödemesi Stripe ile oluşturuldu.',
      `Tutar: ${input.amount} ${input.currency}`,
      'Ödeme tamamlandığında depozito otomatik onaylanır.',
      // Never expose client_secret / PaymentIntent internals to patients.
    ].join('\n'),
  }
}

function manualDepositInstructions(input: {
  amount: number
  currency: string
  depositId: string
  clinicName: string
}) {
  return [
    `${input.clinicName} randevu depozitosu`,
    `Tutar: ${input.amount} ${input.currency}`,
    `Referans: ${input.depositId.slice(0, 8)}`,
    '',
    'Klinik depozitoyu elden / havale ile alabilir. Ödeme sonrası klinik paneli kaydı günceller.',
  ].join('\n')
}

/**
 * Soft-fail safe: booking already committed. Creates PENDING deposit + optional Stripe intent.
 */
export async function createAppointmentDeposit(input: {
  businessId: string
  appointmentId: string
  clinicName: string
  amount: number
  currency: string
}): Promise<CreateAppointmentDepositResult | null> {
  if (!(input.amount > 0)) return null

  const deposit = await prisma.appointmentDeposit.create({
    data: {
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      amount: input.amount,
      currency: input.currency,
      status: 'PENDING',
      provider: 'MANUAL',
      instructions: manualDepositInstructions({
        amount: input.amount,
        currency: input.currency,
        depositId: 'pending',
        clinicName: input.clinicName,
      }),
    },
    select: { id: true },
  })

  let provider: 'MANUAL' | 'STRIPE' = 'MANUAL'
  let providerRef: string | null = `manual_${deposit.id}`
  let checkoutUrl: string | null = null
  let instructions = manualDepositInstructions({
    amount: input.amount,
    currency: input.currency,
    depositId: deposit.id,
    clinicName: input.clinicName,
  })

  try {
    const stripe = await createStripeDepositIntent({
      depositId: deposit.id,
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      amount: input.amount,
      currency: input.currency,
      clinicName: input.clinicName,
    })
    if (stripe) {
      provider = 'STRIPE'
      providerRef = stripe.providerRef
      checkoutUrl = stripe.checkoutUrl
      instructions = stripe.instructions
    }
  } catch {
    // Soft-fail to manual instructions — booking remains valid.
    trackFunnelEvent({
      step: 'deposit_failed',
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      ok: false,
      metadata: { depositId: deposit.id, reason: 'stripe_intent_failed' },
    })
  }

  await prisma.appointmentDeposit.update({
    where: { id: deposit.id },
    data: {
      provider,
      providerRef,
      checkoutUrl,
      instructions,
    },
  })

  trackFunnelEvent({
    step: 'deposit_pending',
    businessId: input.businessId,
    appointmentId: input.appointmentId,
    ok: true,
    metadata: {
      depositId: deposit.id,
      provider,
      amount: input.amount,
      currency: input.currency,
    },
  })

  return {
    depositId: deposit.id,
    amount: input.amount,
    currency: input.currency,
    provider,
    status: 'PENDING',
    checkoutUrl,
    instructions,
  }
}

export async function markAppointmentDepositPaid(depositId: string) {
  const row = await prisma.appointmentDeposit.findUnique({
    where: { id: depositId },
    select: {
      id: true,
      businessId: true,
      appointmentId: true,
      status: true,
    },
  })
  if (!row) return { ok: false as const, error: 'Depozito bulunamadı' }
  if (row.status === 'PAID') {
    return { ok: true as const, alreadyPaid: true as const }
  }
  if (row.status !== 'PENDING') {
    return { ok: false as const, error: `Depozito durumu uygun değil: ${row.status}` }
  }

  await prisma.appointmentDeposit.update({
    where: { id: row.id },
    data: { status: 'PAID', paidAt: new Date() },
  })

  trackFunnelEvent({
    step: 'deposit_paid',
    businessId: row.businessId,
    appointmentId: row.appointmentId,
    ok: true,
    metadata: { depositId: row.id, kind: 'appointment_deposit' },
  })

  return { ok: true as const, alreadyPaid: false as const }
}
