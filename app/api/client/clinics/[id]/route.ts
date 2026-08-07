import { type NextRequest, NextResponse } from 'next/server'
import { apiError, parsePathId } from '@/lib/api-response'
import { getClientClinicDetail } from '@/lib/client-marketplace/clinic-detail'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/client/clinics/[id] — hasta klinik detay (gerçek DTO; uydurma metin yok).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(
    `client-clinic:${ip}`,
    RATE_LIMITS.api.limit,
    RATE_LIMITS.api.window,
  )
  if (!allowed) {
    return apiError('Çok fazla istek. Lütfen biraz sonra tekrar deneyin.', 429, 'RATE_LIMITED')
  }

  const id = parsePathId((await context.params).id)
  if (!id) {
    return apiError('Geçersiz klinik kimliği', 400)
  }

  try {
    const clinic = await getClientClinicDetail(id)
    if (!clinic) {
      return apiError('Klinik bulunamadı', 404)
    }
    // Dual shape: apiSuccess contract + top-level `clinic` for Expo clients.
    return NextResponse.json(
      { ok: true, data: { clinic }, clinic },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('[api/client/clinics/:id]', error)
    return apiError('Klinik bilgisi yüklenemedi. Lütfen tekrar deneyin.', 500)
  }
}
