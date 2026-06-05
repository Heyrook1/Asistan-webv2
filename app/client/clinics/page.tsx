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
  } catch {
    // Keep the UI usable even if the database isn't available in the current environment.
    const mock: ClientDiscoveryItem[] = [
      {
        businessId: 'mock-1',
        businessName: 'Asistan Medical Center',
        businessSlug: 'asistan-medical-center',
        businessAddress: 'Main Street 12',
        businessCity: 'Nicosia',
        businessLogoUrl: null,
        businessDistanceKm: 1.4,
        doctorId: 'mock-doc-1',
        doctorName: 'Dr. Aylin Kaya',
        specialty: 'Dermatology',
        ratingAverage: 4.8,
        reviewCount: 312,
        serviceCount: 8,
        nextAvailableAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        minPrice: 750,
        maxPrice: 1800,
        openNow: true,
      },
      {
        businessId: 'mock-2',
        businessName: 'BlueCare Clinic',
        businessSlug: 'bluecare-clinic',
        businessAddress: 'Ataturk Avenue 88',
        businessCity: 'Famagusta',
        businessLogoUrl: null,
        businessDistanceKm: 4.9,
        doctorId: 'mock-doc-2',
        doctorName: 'Dr. Mert Demir',
        specialty: 'Orthopedics',
        ratingAverage: 4.6,
        reviewCount: 124,
        serviceCount: 6,
        nextAvailableAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        minPrice: 900,
        maxPrice: 2200,
        openNow: false,
      },
    ]

    return mock
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
        {clinics.map((item) => (
          <StaggerItem key={`${item.businessId}:${item.doctorId}`}>
            <ClinicCard item={item} />
          </StaggerItem>
        ))}
      </StaggerList>
    </main>
  )
}

