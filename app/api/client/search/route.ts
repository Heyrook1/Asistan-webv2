import { NextResponse, type NextRequest } from 'next/server'
import type { ClientDiscoveryFilters, ClientDiscoverySort } from '@/lib/client-marketplace/types'
import { searchMarketplace } from '@/lib/client-marketplace/discovery'

export const dynamic = 'force-dynamic'

function parseNumber(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        {
          error:
            'Veritabani baglantisi kurulamadi. Lutfen backend/.env.local ayarlarinizi ve internet baglantinizi kontrol edin.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: 'Arama sonuclari yuklenemedi.' }, { status: 500 })
  }
}
