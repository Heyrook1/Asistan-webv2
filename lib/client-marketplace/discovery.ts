import 'server-only'

import { prisma } from '@/lib/prisma'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import { batchFindNextAvailable } from '@/lib/client-marketplace/discovery-next-available'
import type {
  ClientDiscoveryFilters,
  ClientDiscoveryItem,
  ClientDiscoverySort,
} from './types'
import { getCurrentDateAndTimeForTimezone, getWeekdayFromDateString } from './time'

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
    const filters = input.filters ?? {}
    const sort = input.sort ?? 'nearest'

    const doctors = await prisma.teamMember.findMany({
      where: {
        role: 'DOKTOR',
        isActive: true,
        isBookable: true,
        ...(filters.specialty
          ? { specialty: { contains: filters.specialty, mode: 'insensitive' } }
          : {}),
        business: {
          isActive: true,
          ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
        },
      },
      select: {
        id: true,
        businessId: true,
        fullName: true,
        specialty: true,
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
        const inDoctor = doctor.fullName.toLowerCase().includes(q)
        const inClinic = doctor.business.name.toLowerCase().includes(q)
        const inSpecialty = (doctor.specialty ?? '').toLowerCase().includes(q)
        if (!inDoctor && !inClinic && !inSpecialty) continue
      }

      const prices = services
        .map((service) => toNumber(service.price))
        .filter((price): price is number => price != null)

      const minPrice = prices.length > 0 ? Math.min(...prices) : null
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null

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

      if (filters.minRating != null && ratingAverage != null && ratingAverage < filters.minRating) {
        continue
      }

      const serviceIds = services.map((service) => service.id)

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
        specialty: doctor.specialty,
        ratingAverage,
        reviewCount,
        serviceCount: serviceIds.length,
        minPrice,
        maxPrice,
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

    filtered.sort((a, b) => {
      if (sort === 'highest-rated') {
        return (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0)
      }
      if (sort === 'earliest-available') {
        if (!a.nextAvailableAt && !b.nextAvailableAt) return 0
        if (!a.nextAvailableAt) return 1
        if (!b.nextAvailableAt) return -1
        return a.nextAvailableAt.localeCompare(b.nextAvailableAt)
      }
      if (sort === 'most-reviewed') {
        return b.reviewCount - a.reviewCount
      }
      if (a.businessDistanceKm == null && b.businessDistanceKm == null) return 0
      if (a.businessDistanceKm == null) return 1
      if (b.businessDistanceKm == null) return -1
      return a.businessDistanceKm - b.businessDistanceKm
    })

    return filtered
  })
}
