import { Suspense } from 'react'
import type { ClientDiscoveryFilters, ClientDiscoverySort } from '@/lib/client-marketplace/types'
import { searchMarketplace } from '@/lib/client-marketplace/discovery'
import { ClinicFilters } from '@/components/client/clinic-filters'
import { ClinicCard } from '@/components/client/clinic-card'

function parseNumber(input: string | string[] | undefined) {
  const value = Array.isArray(input) ? input[0] : input
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function parseString(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input
}

function parseBoolean(input: string | string[] | undefined) {
  const value = Array.isArray(input) ? input[0] : input
  return value === 'true' || value === '1'
}

async function loadClinics(searchParams: Record<string, string | string[] | undefined>) {
  const filters: ClientDiscoveryFilters = {
    query: parseString(searchParams.query) ?? undefined,
    specialty: parseString(searchParams.specialty) ?? undefined,
    serviceId: parseString(searchParams.serviceId) ?? undefined,
    maxDistanceKm: parseNumber(searchParams.maxDistanceKm),
    minRating: parseNumber(searchParams.minRating),
    availableToday: parseBoolean(searchParams.availableToday),
    minPrice: parseNumber(searchParams.minPrice),
    maxPrice: parseNumber(searchParams.maxPrice),
    city: parseString(searchParams.city) ?? undefined,
  }

  const sort = (parseString(searchParams.sort) as ClientDiscoverySort | undefined) ?? 'nearest'

  try {
    const rows = await searchMarketplace({ filters, sort, clientLocation: null })
    return Array.isArray(rows) ? rows : []
  } catch (error) {
    console.error('[client/clinics] marketplace search failed:', error)
    return []
  }
}

export default async function ClientClinicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const clinics = await loadClinics(params)
  const query = parseString(params.query)

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight text-slate-900">
          {query ? `“${query}”` : 'Uzman veya klinik ara'}
        </h1>
        <p className="text-[13px] leading-relaxed text-slate-500">
          {query
            ? `${clinics.length} sonuç · puan, fiyat ve en erken saat`
            : `${clinics.length} klinik · gerçek müsaitlikle karşılaştırın`}
        </p>
      </header>

      <Suspense
        fallback={
          <div className="h-11 animate-pulse rounded-full bg-white/80 ring-1 ring-slate-200/80" />
        }
      >
        <ClinicFilters />
      </Suspense>

      <div className="space-y-3">
        {clinics.length === 0 ? (
          <div className="rounded-[1.25rem] bg-white px-6 py-12 text-center ring-1 ring-slate-200/80">
            <p className="text-sm font-bold text-slate-900">Eşleşen klinik yok</p>
            <p className="mt-2 text-sm text-slate-500">Filtreleri gevşetin veya farklı bir arama deneyin.</p>
          </div>
        ) : (
          clinics.map((item) => (
            <ClinicCard key={`${item.businessId}:${item.doctorId}`} item={item} />
          ))
        )}
      </div>
    </main>
  )
}
