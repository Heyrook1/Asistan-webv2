import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import { z } from 'zod'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

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
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    const allowed = await checkRateLimit(
      `client-availability:${ip}`,
      RATE_LIMITS.api.limit,
      RATE_LIMITS.api.window,
    )
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

    const slots = await getAvailableSlots(parsed.data)
    return NextResponse.json(
      {
        ok: true as const,
        data: { slots },
        slots,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('[api/client/availability]', error)
    return apiError(
      'Uygun saatler şu anda alınamıyor. Lütfen tekrar deneyin.',
      500,
      'AVAILABILITY_UNAVAILABLE',
    )
  }
}
