import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { getPublicClinicBySlug } from '@/lib/public-booking/clinic-by-slug'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(`public-clinic:${ip}`, RATE_LIMITS.public.limit, RATE_LIMITS.public.window)
  if (!allowed) {
    return apiError('Çok fazla istek', 429)
  }

  const { slug } = await context.params
  const clinic = await getPublicClinicBySlug(slug)
  if (!clinic) {
    return apiError('Klinik bulunamadı', 404)
  }

  return NextResponse.json({ clinic })
}
