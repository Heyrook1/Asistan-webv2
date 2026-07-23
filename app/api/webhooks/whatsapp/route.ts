import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-response'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { handleFrontDeskMessage, sendWhatsAppFrontDeskReply } from '@/lib/front-desk'
import { prisma } from '@/lib/prisma'
import { authorizeWhatsAppWebhookRequest } from '@/lib/security/whatsapp-webhook-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function normalizePeerKey(raw: string) {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 8 ? digits : raw.trim()
}

/**
 * Meta-style verify (optional). Set WHATSAPP_WEBHOOK_VERIFY_TOKEN.
 * GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 */
export async function GET(request: NextRequest) {
  const verify = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim()
  if (!verify) return apiError('Verify token not configured', 503)

  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')
  if (mode === 'subscribe' && token === verify && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return apiError('Forbidden', 403)
}

type InboundBody = {
  slug?: string
  businessSlug?: string
  from?: string
  peerKey?: string
  text?: string
  body?: string
  messageId?: string
  id?: string
  /** Meta Cloud API nested shape (partial) */
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string }
        messages?: Array<{
          from?: string
          id?: string
          text?: { body?: string }
          type?: string
        }>
      }
    }>
  }>
}

function resolveSlug(request: NextRequest, body: InboundBody): string {
  return (
    request.nextUrl.searchParams.get('slug')?.trim() ||
    body.slug?.trim() ||
    body.businessSlug?.trim() ||
    ''
  )
}

/**
 * Inbound WhatsApp → rules front-desk → slot engine → guest booking.
 *
 * Auth (fail-closed, BUG-001):
 * - Meta: `X-Hub-Signature-256` + `WHATSAPP_APP_SECRET`
 * - Adapter: slug-bound bearer (HMAC of `NOTIFICATION_PROVIDER_TOKEN` or `WHATSAPP_INBOUND_TOKENS`)
 * - Raw global bearer alone is rejected; wrong slug ↔ token → 403
 */
export async function POST(request: NextRequest) {
  if (!isFeatureEnabled('whatsappBookingAgent')) {
    return apiError('WhatsApp booking agent disabled', 503)
  }

  const rawBody = await request.text()

  let body: InboundBody = {}
  try {
    body = rawBody ? (JSON.parse(rawBody) as InboundBody) : {}
  } catch {
    return apiError('Invalid JSON', 400)
  }

  const slug = resolveSlug(request, body)
  const auth = authorizeWhatsAppWebhookRequest(request, rawBody, slug)
  if (!auth.ok) {
    return apiError(auth.message, auth.status)
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const allowed = await checkRateLimit(
    `wa-front-desk:${ip}`,
    Math.min(RATE_LIMITS.public.limit, 30),
    RATE_LIMITS.public.window
  )
  if (!allowed) return apiError('Too many requests', 429)

  let from = body.from || body.peerKey || ''
  let text = body.text || body.body || ''
  let messageId = body.messageId || body.id || null

  const metaMsg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (metaMsg) {
    from = from || metaMsg.from || ''
    text = text || metaMsg.text?.body || ''
    messageId = messageId || metaMsg.id || null
  }

  if (!slug) return apiError('slug required', 400)
  if (!from || !text.trim()) return apiError('from and text required', 400)

  const peerKey = normalizePeerKey(from)
  const peerAllowed = await checkRateLimit(`wa-peer:${peerKey}`, 20, '1 m')
  if (!peerAllowed) return apiError('Too many messages', 429)

  const clinic = await prisma.business.findFirst({
    where: { slug: slug.toLowerCase(), isActive: true },
    select: { id: true, whatsappAgentEnabled: true },
  })
  if (!clinic) return apiError('Clinic not found', 404)
  if (!clinic.whatsappAgentEnabled) {
    return apiError('Agent disabled for clinic', 403)
  }

  try {
    const result = await handleFrontDeskMessage({
      slug: slug.toLowerCase(),
      peerKey,
      text: text.trim(),
      inboundId: messageId,
    })

    const delivery = []
    for (const reply of result.replies) {
      delivery.push(
        await sendWhatsAppFrontDeskReply({
          businessId: clinic.id,
          to: peerKey,
          text: reply,
        })
      )
    }

    return apiSuccess({
      step: result.step,
      replies: result.replies,
      bookedAppointmentId: result.bookedAppointmentId ?? null,
      delivery: delivery.map((d) => ({
        ok: d.ok,
        status: d.status,
      })),
    })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Front desk failed', 500)
  }
}
