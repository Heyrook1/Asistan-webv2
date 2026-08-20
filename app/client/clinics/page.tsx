import { Suspense } from 'react'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { EmptyState } from '@/components/client/ui'
import type { ClientDiscoveryFilters, ClientDiscoverySort } from '@/lib/client-marketplace/types'
import {
  publicCatalogHasRatings,
  searchMarketplace,
} from '@/lib/client-marketplace/discovery'
import { shouldIncludeTestClinicsInPublicIndex } from '@/lib/client-marketplace/public-clinic-filter'
import { ClinicFilters } from '@/components/client/clinic-filters'
import { ClinicSearchInput } from '@/components/client/clinic-search-input'
import { ClinicCard } from '@/components/client/clinic-card'
import { ClientMarketplaceDemoBanner } from '@/components/client/marketplace-demo-banner'
import { getServerLanguage } from '@/lib/server-language'

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

async function loadClinics(
  searchParams: Record<string, string | string[] | undefined>,
  ratingFilterEnabled: boolean,
) {
  // Ignore unsupported distance filter until geolocation is live.
  // Ignore minRating when catalog has no appointment-backed reviews.
  const filters: ClientDiscoveryFilters = {
    query: parseString(searchParams.query) ?? undefined,
    specialty: parseString(searchParams.specialty) ?? undefined,
    serviceId: parseString(searchParams.serviceId) ?? undefined,
    minRating: ratingFilterEnabled ? parseNumber(searchParams.minRating) : undefined,
    availableToday: parseBoolean(searchParams.availableToday),
    minPrice: parseNumber(searchParams.minPrice),
    maxPrice: parseNumber(searchParams.maxPrice),
    city: parseString(searchParams.city) ?? undefined,
  }

  let sort = (parseString(searchParams.sort) as ClientDiscoverySort | undefined) ?? 'highest-rated'
  if (!ratingFilterEnabled && sort === 'most-reviewed') sort = 'highest-rated'

  try {
    const rows = await searchMarketplace({ filters, sort, clientLocation: null })
    return { clinics: Array.isArray(rows) ? rows : [], failed: false }
  } catch (error) {
    console.error('[client/clinics] marketplace search failed:', error)
    // Localized at render time — this runs on the server, away from the request locale.
    return { clinics: [], failed: true }
  }
}

export default async function ClientClinicsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const { language, t } = await getServerLanguage()
  const ratingFilterEnabled = await publicCatalogHasRatings()
  const { clinics, failed } = await loadClinics(params, ratingFilterEnabled)
  const query = parseString(params.query)?.trim()
  const specialty = parseString(params.specialty)?.trim()
  const heading = specialty
    ? specialty.charAt(0).toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US') +
      specialty.slice(1)
    : query
      ? `“${query}”`
      : t({ tr: 'Uzman veya klinik ara', en: 'Search a specialist or clinic' })
  const hasIntent = Boolean(query || specialty)
  const sortHint = ratingFilterEnabled
    ? t({
        tr: 'önerilen sıra · doğrulama, müsaitlik ve yorum',
        en: 'recommended order · verification, availability and reviews',
      })
    : t({
        tr: 'önerilen sıra · doğrulama ve gerçek müsaitlik',
        en: 'recommended order · verification and real availability',
      })
  const countLabel = hasIntent
    ? t({ tr: `${clinics.length} sonuç`, en: `${clinics.length} result${clinics.length === 1 ? '' : 's'}` })
    : t({ tr: `${clinics.length} klinik`, en: `${clinics.length} clinic${clinics.length === 1 ? '' : 's'}` })

  return (
    <main className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight text-slate-900">
          {heading}
        </h1>
        <p className="text-[13px] leading-relaxed text-slate-500" aria-live="polite">
          {failed
            ? t({ tr: 'Arama geçici olarak kullanılamıyor', en: 'Search is temporarily unavailable' })
            : `${countLabel} · ${sortHint}`}
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
        <ClinicFilters ratingFilterEnabled={ratingFilterEnabled} />
      </Suspense>

      <div className="space-y-3">
        {shouldIncludeTestClinicsInPublicIndex() ? (
          <ClientMarketplaceDemoBanner mode="test-clinics-visible" />
        ) : null}
        {failed ? (
          <div className="rounded-[1.25rem] bg-white px-6 py-12 text-center ring-1 ring-rose-200/80">
            <p className="text-sm font-bold text-slate-900">
              {t({
                tr: 'Klinikler şu anda yüklenemiyor. Lütfen tekrar deneyin.',
                en: 'Clinics cannot be loaded right now. Please try again.',
              })}
            </p>
            <Link
              href="/client/clinics"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#0071E3] px-5 text-sm font-bold text-white"
            >
              {t({ tr: 'Tekrar dene', en: 'Try again' })}
            </Link>
          </div>
        ) : clinics.length === 0 ? (
          <div className="space-y-3">
            {!hasIntent ? <ClientMarketplaceDemoBanner mode="empty-catalog" /> : null}
            <EmptyState
              icon={SearchX}
              title={
                specialty
                  ? t({ tr: 'Bu branşta henüz klinik yok', en: 'No clinics in this specialty yet' })
                  : t({ tr: 'Eşleşen klinik yok', en: 'No matching clinics' })
              }
              description={
                specialty
                  ? t({
                      tr: 'Diğer branşlara bakın veya tüm klinikleri listeleyin — içerik engellenmiyor, katalog henüz boş.',
                      en: 'Try other specialties or list every clinic — nothing is being hidden, the catalogue is simply still empty.',
                    })
                  : query
                    ? t({
                        tr: 'Farklı bir kelime deneyin veya filtreleri temizleyin.',
                        en: 'Try a different word or clear the filters.',
                      })
                    : t({
                        tr: 'Filtreleri gevşetin (özellikle “Bugün müsait”) veya daha sonra tekrar bakın.',
                        en: 'Loosen the filters (especially “Available today”) or check back later.',
                      })
              }
              actionLabel={
                hasIntent
                  ? t({ tr: 'Tüm klinikleri göster', en: 'Show all clinics' })
                  : t({ tr: 'Ana sayfaya dön', en: 'Back to home' })
              }
              actionHref={hasIntent ? '/client/clinics' : '/client'}
            />
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
