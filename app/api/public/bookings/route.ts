import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { createGuestPublicBooking } from '@/lib/public-booking/create-guest-booking'
import {
  getIdempotentBookingResponse,
  isValidIdempotencyKey,
} from '@/lib/public-booking/idempotency'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(
    `public-book:${ip}`,
    Math.min(RATE_LIMITS.public.limit, 8),
    RATE_LIMITS.public.window
  )
  if (!allowed) {
    return apiError('Çok fazla randevu denemesi. Biraz sonra tekrar deneyin.', 429)
  }

  const idempotencyKey = request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key')

  try {
    // Fast path: return the winner's response without redoing any work.
    if (isValidIdempotencyKey(idempotencyKey)) {
      const cached = await getIdempotentBookingResponse(idempotencyKey)
      if (cached) {
        return NextResponse.json({ ok: true, ...cached, idempotentReplay: true })
      }
    }

    const body = await request.json().catch(() => null)
    // The idempotency key is claimed transactionally inside the booking to prevent
    // TOCTOU double-booking on concurrent same-key requests.
    const result = await createGuestPublicBooking(body, idempotencyKey)
    if (!result.ok) {
      return apiValidationError(result.error, 'issues' in result ? result.issues : undefined, 400)
    }

    return NextResponse.json({ ok: true, ...result.data, idempotentReplay: result.replay })
  } catch (error) {
    Sentry.captureException(error)
    return apiError(error instanceof Error ? error.message : 'Randevu oluşturulamadı', 500)
  }
}
