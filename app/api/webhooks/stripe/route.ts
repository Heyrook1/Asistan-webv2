import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { createHmac, timingSafeEqual } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { activateMembershipFromPayment } from '@/lib/payments/activate-membership'
import { trackFunnelEvent } from '@/lib/observability/funnel'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function verifyStripeSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((piece) => {
      const [k, v] = piece.split('=')
      return [k, v]
    })
  )
  const timestamp = parts.t
  const v1 = parts.v1
  if (!timestamp || !v1) return false
  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (Number.isNaN(ageSec) || ageSec > 60 * 5) return false

  const signed = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signed), Buffer.from(v1))
  } catch {
    return false
  }
}

/**
 * Stripe webhook for PaymentIntent success.
 * Without STRIPE_WEBHOOK_SECRET, endpoint returns 503 (manual confirm remains primary).
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    return apiError('Stripe webhook not configured', 503)
  }

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return apiError('Invalid signature', 400)
  }

  try {
    const event = JSON.parse(rawBody) as {
      id?: string
      type?: string
      data?: {
        object?: {
          id?: string
          metadata?: { paymentId?: string; depositId?: string; kind?: string }
        }
      }
    }

    // Event-level idempotency: claim the provider event id before doing any work so
    // Stripe retries / duplicate deliveries never process the same event twice.
    if (event.id) {
      try {
        await prisma.processedWebhookEvent.create({
          data: { provider: 'stripe', eventId: event.id, eventType: event.type ?? null },
        })
      } catch (claimError) {
        if (
          claimError instanceof Prisma.PrismaClientKnownRequestError &&
          claimError.code === 'P2002'
        ) {
          return NextResponse.json({ received: true, duplicate: true })
        }
        throw claimError
      }
    }

    try {
      if (
        event.type === 'payment_intent.succeeded' ||
        event.type === 'checkout.session.completed'
      ) {
        const obj = event.data?.object
        const metadata = obj?.metadata
        const paymentId = metadata?.paymentId
        const depositId = metadata?.depositId
        const kind = metadata?.kind

        if (depositId || kind === 'appointment_deposit') {
          let targetDepositId = depositId
          if (!targetDepositId && obj?.id && event.type === 'payment_intent.succeeded') {
            const row = await prisma.appointmentDeposit.findFirst({
              where: { providerRef: obj.id, status: 'PENDING' },
              select: { id: true },
            })
            targetDepositId = row?.id
          }
          if (targetDepositId) {
            const { markAppointmentDepositPaid } = await import('@/lib/payments/deposit')
            await markAppointmentDepositPaid(targetDepositId)
          }
        } else if (event.type === 'payment_intent.succeeded') {
          let targetId = paymentId
          if (!targetId && obj?.id) {
            const row = await prisma.membershipPayment.findFirst({
              where: { providerRef: obj.id, status: 'PENDING' },
              select: { id: true },
            })
            targetId = row?.id
          }
          if (targetId) {
            await activateMembershipFromPayment(targetId)
            trackFunnelEvent({
              step: 'deposit_paid',
              ok: true,
              metadata: { paymentId: targetId, provider: 'stripe', kind: 'membership' },
            })
          }
        }
      }
    } catch (processingError) {
      // Release the idempotency claim so Stripe's retry can reprocess this event.
      if (event.id) {
        await prisma.processedWebhookEvent
          .deleteMany({ where: { provider: 'stripe', eventId: event.id } })
          .catch(() => null)
      }
      throw processingError
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    Sentry.captureException(error)
    return apiError('Webhook handler failed', 500)
  }
}
