import { Suspense } from 'react'
import Link from 'next/link'
import type { ClientDiscoveryFilters, ClientDiscoverySort } from '@/lib/client-marketplace/types'
import { searchMarketplace } from '@/lib/client-marketplace/discovery'
import { ClinicFilters } from '@/components/client/clinic-filters'
import { ClinicSearchInput } from '@/components/client/clinic-search-input'
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
  // Ignore unsupported distance filter until geolocation is live.
  const filters: ClientDiscoveryFilters = {
    query: parseString(searchParams.query) ?? undefined,
    specialty: parseString(searchParams.specialty) ?? undefined,
    serviceId: parseString(searchParams.serviceId) ?? undefined,
    minRating: parseNumber(searchParams.minRating),
    availableToday: parseBoolean(searchParams.availableToday),
    minPrice: parseNumber(searchParams.minPrice),
    maxPrice: parseNumber(searchParams.maxPrice),
    city: parseString(searchParams.city) ?? undefined,
  }

  const sort = (parseString(searchParams.sort) as ClientDiscoverySort | undefined) ?? 'nearest'

  try {
    const rows = await searchMarketplace({ filters, sort, clientLocation: null })
    return { clinics: Array.isArray(rows) ? rows : [], error: null as string | null }
  } catch (error) {
    console.error('[client/clinics] marketplace search failed:', error)
    return {
      clinics: [],
      error: 'Klinikler şu anda yüklenemiyor. Lütfen tekrar deneyin.',
    }
  }
}

export default async function ClientClinicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const { clinics, error } = await loadClinics(params)
  const query = parseString(params.query)?.trim()
  const specialty = parseString(params.specialty)?.trim()
  const heading = specialty
    ? specialty.charAt(0).toLocaleUpperCase('tr-TR') + specialty.slice(1)
    : query
      ? `“${query}”`
      : 'Uzman veya klinik ara'
  const hasIntent = Boolean(query || specialty)

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight text-slate-900">
          {heading}
        </h1>
        <p className="text-[13px] leading-relaxed text-slate-500">
          {error
            ? 'Arama geçici olarak kullanılamıyor'
            : hasIntent
              ? `${clinics.length} sonuç · puan ve gerçek müsaitlik`
              : `${clinics.length} klinik · gerçek müsaitlikle karşılaştırın`}
        </p>
      </header>

      <Suspense
        fallback={
          <div className="h-12 animate-pulse rounded-full bg-white/80 ring-1 ring-slate-200/80" />
        }
      >
        <ClinicSearchInput />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-11 animate-pulse rounded-full bg-white/80 ring-1 ring-slate-200/80" />
        }
      >
        <ClinicFilters />
      </Suspense>

      <div className="space-y-3">
        {error ? (
          <div className="rounded-[1.25rem] bg-white px-6 py-12 text-center ring-1 ring-rose-200/80">
            <p className="text-sm font-bold text-slate-900">{error}</p>
            <Link
              href="/client/clinics"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#0071E3] px-5 text-sm font-bold text-white"
            >
              Tekrar dene
            </Link>
          </div>
        ) : clinics.length === 0 ? (
          <div className="rounded-[1.25rem] bg-white px-6 py-12 text-center ring-1 ring-slate-200/80">
            <p className="text-sm font-bold text-slate-900">
              {specialty ? 'Bu branşta henüz klinik yok' : 'Eşleşen klinik yok'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {specialty
                ? 'Diğer branşlara bakın veya tüm klinikleri listeleyin — içerik engellenmiyor, katalog henüz boş.'
                : query
                  ? 'Farklı bir kelime deneyin veya filtreleri temizleyin.'
                  : 'Filtreleri gevşetin (özellikle “Bugün müsait”) veya daha sonra tekrar bakın.'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {hasIntent ? (
                <Link
                  href="/client/clinics"
                  className="inline-flex h-10 items-center rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-700"
                >
                  Tüm klinikleri göster
                </Link>
              ) : null}
              <Link
                href="/client"
                className="inline-flex h-10 items-center rounded-full bg-[#0071E3] px-4 text-sm font-bold text-white"
              >
                Ana sayfaya dön
              </Link>
            </div>
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
