import type { ClientDiscoveryFilters, ClientDiscoveryItem, ClientDiscoverySort } from '@/lib/client-marketplace/types'
import { searchMarketplace } from '@/lib/client-marketplace/discovery'
import { ClinicFilters } from '@/components/client/clinic-filters'
import { ClinicCard } from '@/components/client/clinic-card'
import { StaggerList, StaggerItem } from '@/components/client/stagger-list'

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
    return rows
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

  return (
    <main className="space-y-4 md:space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
          Clinics
        </h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground md:text-base">
          Compare ratings, prices, and the earliest available appointments.
        </p>
      </header>

      <ClinicFilters />

      <StaggerList className="space-y-3 md:space-y-4">
        {clinics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No clinics match your search yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting filters or check back when more clinics are listed on the platform.
            </p>
          </div>
        ) : (
          clinics.map((item) => (
            <StaggerItem key={`${item.businessId}:${item.doctorId}`}>
              <ClinicCard item={item} />
            </StaggerItem>
          ))
        )}
      </StaggerList>
    </main>
  )
}

