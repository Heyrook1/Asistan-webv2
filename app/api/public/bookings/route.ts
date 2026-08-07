import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { createGuestPublicBooking } from '@/lib/public-booking/create-guest-booking'
import {
  getIdempotentBookingResponse,
  hashBookingPayload,
  IDEMPOTENCY_PAYLOAD_HASH_FIELD,
  isValidIdempotencyKey,
  stripIdempotencyMeta,
} from '@/lib/public-booking/idempotency'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/public/bookings — misafir randevu.
 * Idempotency-Key: aynı key+payload → replay; aynı key+farklı payload → 409.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(
    `public-book:${ip}`,
    Math.min(RATE_LIMITS.public.limit, 8),
    RATE_LIMITS.public.window,
  )
  if (!allowed) {
    return apiError('Çok fazla randevu denemesi. Biraz sonra tekrar deneyin.', 429)
  }

  const idempotencyKey =
    request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key')

  try {
    const body = await request.json().catch(() => null)
    const payloadHash = hashBookingPayload(body)

    if (isValidIdempotencyKey(idempotencyKey)) {
      const cached = await getIdempotentBookingResponse(idempotencyKey)
      if (cached) {
        const storedHash = cached[IDEMPOTENCY_PAYLOAD_HASH_FIELD]
        if (typeof storedHash === 'string' && storedHash !== payloadHash) {
          return apiError(
            'Bu istek anahtarı farklı bir randevu için kullanılmış. Sayfayı yenileyip tekrar deneyin.',
            409,
            'IDEMPOTENCY_PAYLOAD_MISMATCH',
          )
        }
        return NextResponse.json({
          ok: true,
          ...stripIdempotencyMeta(cached),
          idempotentReplay: true,
        })
      }
    }

    // The idempotency key is claimed transactionally inside the booking to prevent
    // TOCTOU double-booking on concurrent same-key requests.
    const result = await createGuestPublicBooking(body, idempotencyKey)
    if (!result.ok) {
      const status =
        typeof result.error === 'string' && /doldu|çakış|saat/i.test(result.error) ? 409 : 400
      if (status === 409) {
        return apiError(result.error, 409, 'SLOT_TAKEN')
      }
      return apiValidationError(result.error, 'issues' in result ? result.issues : undefined, 400)
    }

    const rawData = result.data as Record<string, unknown>
    const data = stripIdempotencyMeta(rawData)

    return NextResponse.json({ ok: true, ...data, idempotentReplay: result.replay })
  } catch (error) {
    Sentry.captureException(error)
    return apiError(
      'Randevu oluşturulamadı. Lütfen tekrar deneyin.',
      500,
      'BOOKING_FAILED',
    )
  }
}
