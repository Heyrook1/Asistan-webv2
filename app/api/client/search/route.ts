import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import type { ClientDiscoveryFilters, ClientDiscoverySort } from '@/lib/client-marketplace/types'
import { searchMarketplace } from '@/lib/client-marketplace/discovery'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function parseNumber(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(`client-search:${ip}`, RATE_LIMITS.api.limit, RATE_LIMITS.api.window)
  if (!allowed) {
    return apiError('Çok fazla istek', 429)
  }

  try {
    const params = request.nextUrl.searchParams

    const filters: ClientDiscoveryFilters = {
      query: params.get('query') ?? undefined,
      specialty: params.get('specialty') ?? undefined,
      serviceId: params.get('serviceId') ?? undefined,
      maxDistanceKm: parseNumber(params.get('maxDistanceKm')),
      minRating: parseNumber(params.get('minRating')),
      availableToday: params.get('availableToday') === 'true',
      minPrice: parseNumber(params.get('minPrice')),
      maxPrice: parseNumber(params.get('maxPrice')),
      city: params.get('city') ?? undefined,
    }

    const sort = (params.get('sort') as ClientDiscoverySort | null) ?? 'nearest'
    const lat = parseNumber(params.get('lat'))
    const lng = parseNumber(params.get('lng'))

    const rows = await searchMarketplace({
      filters,
      sort,
      clientLocation:
        lat != null && lng != null
          ? {
              lat,
              lng,
            }
          : null,
    })

    return NextResponse.json({ items: rows })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    if (/can't reach database server|prisma|p1001/i.test(message)) {
      return apiError('Veritabani baglantisi kurulamadi. Lutfen backend/.env.local ayarlarinizi ve internet baglantinizi kontrol edin.', 503)
    }

    return apiError('Arama sonuclari yuklenemedi.', 500)
  }
}
