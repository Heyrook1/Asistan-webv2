import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import { batchFindNextAvailable } from '@/lib/client-marketplace/discovery-next-available'
import type {
  ClientDiscoveryFilters,
  ClientDiscoveryItem,
  ClientDiscoverySort,
} from './types'
import { matchesSpecialtyTerms, specialtySearchTerms } from './specialty-aliases'
import { getCurrentDateAndTimeForTimezone, getWeekdayFromDateString } from './time'
import {
  shouldIncludeDemoClinicsInPublicIndex,
  shouldIncludeTestClinicsInPublicIndex,
} from './public-clinic-filter'
import { CLIENT_GEOLOCATION_ENABLED } from './geolocation-policy'
import { compareRecommended } from './discovery-ranking'

function toNumber(value: unknown) {
  if (value == null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (typeof value === 'object' && value && typeof (value as { toString?: () => string }).toString === 'function') {
    const parsed = Number((value as { toString: () => string }).toString())
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return 6371 * c
}

function formatDate(offsetDays = 0) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function isBusinessOpenNow() {
  return true
}

export async function searchMarketplace(input: {
  filters?: ClientDiscoveryFilters
  sort?: ClientDiscoverySort
  clientLocation?: { lat: number; lng: number } | null
}) {
  // Public catalog intentionally spans tenants; availability batch stays businessId-scoped in queries.
  return runWithTenantBypassAsync('marketplace:search-catalog', async () => {
    const prisma = catalogPrisma()
    const filters = input.filters ?? {}
    const sort = input.sort ?? 'highest-rated'
    const includeDemoClinics = shouldIncludeDemoClinicsInPublicIndex()

    const specialtyTerms = specialtySearchTerms(filters.specialty)

    const doctors = await prisma.teamMember.findMany({
      where: {
        role: 'DOKTOR',
        isActive: true,
        isBookable: true,
        ...(specialtyTerms.length > 0
          ? {
              OR: specialtyTerms.map((term) => ({
                specialty: { contains: term, mode: 'insensitive' as const },
              })),
            }
          : {}),
        business: {
          isActive: true,
          // Demo vendor accounts, mainland-TR seeds, and *-asistan-test clinics stay out of public index.
          NOT: {
            OR: [
              ...(includeDemoClinics ? [] : [{ vendorAccount: { isDemo: true } }]),
              ...(shouldIncludeTestClinicsInPublicIndex()
                ? []
                : [
                    { slug: { endsWith: '-asistan-test' } },
                    { name: { contains: 'Test Klinik', mode: 'insensitive' as const } },
                    { name: { contains: 'Test Kliniği', mode: 'insensitive' as const } },
                    { name: { contains: 'Asistan Test', mode: 'insensitive' as const } },
                  ]),
              { city: { equals: 'İstanbul', mode: 'insensitive' } },
              { city: { equals: 'Istanbul', mode: 'insensitive' } },
              { city: { equals: 'Ataşehir', mode: 'insensitive' } },
              { city: { equals: 'Ankara', mode: 'insensitive' } },
              { city: { equals: 'İzmir', mode: 'insensitive' } },
              { city: { equals: 'Izmir', mode: 'insensitive' } },
              { address: { contains: 'Ataşehir', mode: 'insensitive' } },
              { address: { contains: 'Istanbul', mode: 'insensitive' } },
              { address: { contains: 'İstanbul', mode: 'insensitive' } },
            ],
          },
          ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
        },
      },
      select: {
        id: true,
        businessId: true,
        fullName: true,
        specialty: true,
        kktcIdentityNo: true,
        medicalLicenseNo: true,
        diplomaNo: true,
        user: { select: { avatarUrl: true } },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            logoUrl: true,
            locationLat: true,
            locationLng: true,
            timezone: true,
          },
        },
        availabilityRules: {
          where: { isActive: true },
          select: { weekday: true, startTime: true, endTime: true },
        },
        serviceAssignments: {
          where: { isActive: true },
          select: {
            service: {
              select: {
                id: true,
                name: true,
                isActive: true,
                price: true,
              },
            },
          },
        },
      },
      take: 120,
    })

    if (doctors.length === 0) return [] as ClientDiscoveryItem[]

    const businessIds = Array.from(new Set(doctors.map((doctor) => doctor.businessId)))
    const businessServices = await prisma.service.findMany({
      where: {
        businessId: { in: businessIds },
        isActive: true,
      },
      select: {
        id: true,
        businessId: true,
        name: true,
        price: true,
        isActive: true,
      },
    })
    const servicesByBusiness = new Map<string, typeof businessServices>()
    for (const service of businessServices) {
      const current = servicesByBusiness.get(service.businessId) ?? []
      current.push(service)
      servicesByBusiness.set(service.businessId, current)
    }

    const doctorIds = doctors.map((doctor) => doctor.id)
    const reviewStats = await prisma.review.groupBy({
      by: ['staffId'],
      where: {
        staffId: { in: doctorIds },
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { _all: true },
    })
    const statsMap = new Map(
      reviewStats
        .filter((item) => item.staffId)
        .map((item) => [item.staffId as string, { avg: item._avg.rating, count: item._count._all }])
    )

    type Draft = Omit<ClientDiscoveryItem, 'nextAvailableAt'> & {
      serviceIds: string[]
      timezone: string
    }

    const drafts: Draft[] = []

    for (const doctor of doctors) {
      const assignedServices = doctor.serviceAssignments
        .map((item) => item.service)
        .filter((service) => service.isActive)
      const fallbackServices = servicesByBusiness.get(doctor.businessId) ?? []
      const services = assignedServices.length > 0 ? assignedServices : fallbackServices

      if (filters.serviceId && !services.some((service) => service.id === filters.serviceId)) {
        continue
      }

      if (filters.query) {
        const q = filters.query.toLowerCase()
        const queryTerms = specialtySearchTerms(filters.query)
        const inDoctor = doctor.fullName.toLowerCase().includes(q)
        const inClinic = doctor.business.name.toLowerCase().includes(q)
        const inSpecialty =
          (doctor.specialty ?? '').toLowerCase().includes(q) ||
          matchesSpecialtyTerms(doctor.specialty, queryTerms)
        const inService = services.some(
          (service) =>
            service.name.toLowerCase().includes(q) ||
            matchesSpecialtyTerms(service.name, queryTerms),
        )
        if (!inDoctor && !inClinic && !inSpecialty && !inService) continue
      }

      const prices = services
        .map((service) => ({ name: service.name, price: toNumber(service.price) }))
        .filter((row): row is { name: string; price: number } => row.price != null)

      const minPrice = prices.length > 0 ? Math.min(...prices.map((row) => row.price)) : null
      const maxPrice = prices.length > 0 ? Math.max(...prices.map((row) => row.price)) : null
      const fromPriceServiceName =
        minPrice != null
          ? (prices.find((row) => row.price === minPrice)?.name ?? null)
          : null

      if (filters.minPrice != null && minPrice != null && minPrice < filters.minPrice) {
        continue
      }
      if (filters.maxPrice != null && minPrice != null && minPrice > filters.maxPrice) {
        continue
      }

      const lat = toNumber(doctor.business.locationLat)
      const lng = toNumber(doctor.business.locationLng)
      const distance =
        input.clientLocation && lat != null && lng != null
          ? haversineKm(input.clientLocation.lat, input.clientLocation.lng, lat, lng)
          : null

      if (filters.maxDistanceKm != null && distance != null && distance > filters.maxDistanceKm) {
        continue
      }

      const review = statsMap.get(doctor.id)
      const ratingAverage = review?.avg != null ? Number(review.avg) : null
      const reviewCount = review?.count ?? 0

      // Unrated ("Yeni") clinics must not pass a min-rating filter.
      if (filters.minRating != null) {
        if (ratingAverage == null || reviewCount < 1 || ratingAverage < filters.minRating) {
          continue
        }
      }

      const serviceIds = services.map((service) => service.id)
      const doctorVerified = Boolean(
        doctor.kktcIdentityNo || doctor.medicalLicenseNo || doctor.diplomaNo,
      )

      drafts.push({
        businessId: doctor.business.id,
        businessName: doctor.business.name,
        businessSlug: doctor.business.slug,
        businessAddress: doctor.business.address,
        businessCity: doctor.business.city,
        businessLogoUrl: doctor.business.logoUrl,
        businessDistanceKm: distance,
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        doctorAvatarUrl: doctor.user?.avatarUrl ?? null,
        doctorVerified,
        specialty: doctor.specialty,
        ratingAverage,
        reviewCount,
        serviceCount: serviceIds.length,
        minPrice,
        maxPrice,
        fromPriceServiceName,
        isSponsored: false,
        serviceIds,
        timezone: doctor.business.timezone || 'Europe/Istanbul',
        openNow: (() => {
          if (doctor.availabilityRules.length === 0) return isBusinessOpenNow()
          const now = getCurrentDateAndTimeForTimezone(
            doctor.business.timezone || 'Europe/Istanbul'
          )
          const weekday = getWeekdayFromDateString(now.date)
          return doctor.availabilityRules.some(
            (rule) =>
              rule.weekday === weekday &&
              rule.startTime <= now.time &&
              rule.endTime > now.time
          )
        })(),
      })
    }

    // One batched rules/appts/blocks load — not per doctor×day×service getAvailableSlots.
    const nextByDoctor = await batchFindNextAvailable(
      drafts.map((d) => ({
        businessId: d.businessId,
        doctorId: d.doctorId,
        serviceIds: d.serviceIds,
        timezone: d.timezone,
        availableTodayOnly: filters.availableToday ?? false,
      }))
    )

    const today = formatDate(0)
    const filtered: ClientDiscoveryItem[] = []

    for (const draft of drafts) {
      const nextAvailableAt = nextByDoctor.get(draft.doctorId) ?? null
      if (filters.availableToday && (!nextAvailableAt || !nextAvailableAt.startsWith(today))) {
        continue
      }
      const { serviceIds: _s, timezone: _tz, ...rest } = draft
      filtered.push({ ...rest, nextAvailableAt })
    }

    // Sponsored rows (when product exists) stay first but must be UI-labeled via isSponsored.
    const organic = filtered.filter((row) => !row.isSponsored)
    const sponsored = filtered.filter((row) => row.isSponsored)

    organic.sort((a, b) => {
      // Never claim nearest without geolocation policy + coordinates.
      const effectiveSort =
        sort === 'nearest' &&
        (!CLIENT_GEOLOCATION_ENABLED || input.clientLocation == null)
          ? 'highest-rated'
          : sort
      if (effectiveSort === 'highest-rated') {
        // "Önerilen" = documented composite, not raw rating alone.
        return compareRecommended(a, b, filters.city)
      }
      if (effectiveSort === 'earliest-available') {
        if (!a.nextAvailableAt && !b.nextAvailableAt) return 0
        if (!a.nextAvailableAt) return 1
        if (!b.nextAvailableAt) return -1
        return a.nextAvailableAt.localeCompare(b.nextAvailableAt)
      }
      if (effectiveSort === 'most-reviewed') {
        return b.reviewCount - a.reviewCount
      }
      if (a.businessDistanceKm == null && b.businessDistanceKm == null) return 0
      if (a.businessDistanceKm == null) return 1
      if (b.businessDistanceKm == null) return -1
      return a.businessDistanceKm - b.businessDistanceKm
    })

    return [...sponsored, ...organic]
  })
}

/** True when the public catalog has at least one appointment-backed review. */
export async function publicCatalogHasRatings(): Promise<boolean> {
  // Fail-soft: a ratings-availability probe must never crash the discovery page.
  // On a DB outage, return false so the page renders its graceful degraded state.
  try {
    return await runWithTenantBypassAsync('marketplace:catalog-has-ratings', async () => {
      const prisma = catalogPrisma()
      const row = await prisma.review.findFirst({
        where: {
          deletedAt: null,
          business: {
            isActive: true,
            deletedAt: null,
          },
        },
        select: { id: true },
      })
      return row != null
    })
  } catch (error) {
    console.error('[marketplace] catalog-has-ratings probe failed:', error)
    return false
  }
}
