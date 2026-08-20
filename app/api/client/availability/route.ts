import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import { z } from 'zod'
import { getAvailableSlotsDetailed } from '@/lib/client-marketplace/availability'
import { checkRateLimit, RATE_LIMITS, getRateLimitBackendPreference } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** DB ids are text — may be hyphenated UUID or legacy 32-char hex. */
const idSchema = z.string().trim().min(1).max(64)

const querySchema = z.object({
  doctorId: idSchema,
  serviceId: idSchema,
  businessId: idSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locationId: idSchema.optional(),
})

/**
 * GET /api/client/availability — gerçek slot listesi (misafir book + /client reschedule).
 * Her code path geçerli JSON döner; ham exception kullanıcıya gitmez.
 * emptyReason: OK | NO_RULES | CLOSED | FULL | NOT_BOOKABLE | INFRA
 */
export async function GET(request: NextRequest) {
  const rateLimitBackend = getRateLimitBackendPreference()

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    let allowed = true
    try {
      allowed = await checkRateLimit(
        `client-availability:${ip}`,
        RATE_LIMITS.api.limit,
        RATE_LIMITS.api.window,
      )
    } catch (rateLimitError) {
      // Misconfigured limiter must not blank the book grid.
      console.error('[api/client/availability] rate-limit skipped', rateLimitError)
    }
    if (!allowed) {
      return apiError('Çok fazla istek. Lütfen biraz sonra tekrar deneyin.', 429, 'RATE_LIMITED')
    }

    const params = request.nextUrl.searchParams
    const parsed = querySchema.safeParse({
      doctorId: params.get('doctorId'),
      serviceId: params.get('serviceId'),
      businessId: params.get('businessId'),
      date: params.get('date'),
      locationId: params.get('locationId') ?? undefined,
    })

    if (!parsed.success) {
      return apiValidationError('Geçersiz slot sorgusu', parsed.error.issues, 400)
    }

    const { slots, emptyReason } = await getAvailableSlotsDetailed(parsed.data)
    const degraded = emptyReason === 'INFRA'
    const syncedAt = new Date().toISOString()
    return NextResponse.json(
      {
        ok: true as const,
        data: { slots, syncedAt, emptyReason, degraded, rateLimitBackend },
        slots,
        syncedAt,
        emptyReason,
        degraded,
        rateLimitBackend,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      },
    )
  } catch (error) {
    // Never 500 the book UI — empty slots + retry is recoverable; hard 500 is not.
    const reason = error instanceof Error ? error.message.slice(0, 200) : 'unknown'
    console.error('[api/client/availability]', error)
    const syncedAt = new Date().toISOString()
    return NextResponse.json(
      {
        ok: true as const,
        data: {
          slots: [],
          syncedAt,
          emptyReason: 'INFRA' as const,
          degraded: true,
          rateLimitBackend,
        },
        slots: [],
        syncedAt,
        degraded: true,
        emptyReason: 'INFRA' as const,
        rateLimitBackend,
        reason,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      },
    )
  }
}
