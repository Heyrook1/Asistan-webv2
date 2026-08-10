import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'
import { getCancelMinHoursBefore } from '@/lib/client-marketplace/cancel-policy'
import { addCalendarDays, calendarDateInTimeZone } from '@/lib/datetime/calendar-label'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import { shouldIncludeTestClinicsInPublicIndex, isPublicTestClinic } from '@/lib/client-marketplace/public-clinic-filter'

function todayIso() {
  return calendarDateInTimeZone()
}

function toNumber(value: unknown) {
  if (value == null) return null
  const parsed = Number(typeof value === 'object' ? String(value) : value)
  return Number.isNaN(parsed) ? null : parsed
}

const WEEKDAY_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'] as const

export type ClinicOpeningHoursLine = {
  weekday: number
  label: string
  windows: Array<{ startTime: string; endTime: string }>
}

export type ClientClinicDetail = {
  id: string
  name: string
  slug: string
  description: string | null
  /** Unique doctor specialties — used when clinic description is empty. */
  specialtySummary: string[]
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  currency: string
  locationLat: number | null
  locationLng: number | null
  ratingAverage: number | null
  reviewCount: number
  verifiedDoctorCount: number
  /** Derived from active TeamMemberAvailability — empty when clinic has no rules. */
  openingHours: ClinicOpeningHoursLine[]
  bookingPolicy: {
    cancelMinHours: number
    depositEnabled: boolean
    depositAmount: number | null
    noShowFeeEnabled: boolean
    noShowFeeAmount: number | null
    noShowFeeNote: string | null
  }
  locations: Array<{
    id: string
    name: string
    address: string | null
    city: string | null
    phone: string | null
  }>
  services: Array<{
    id: string
    name: string
    description: string | null
    durationMin: number
    price: number | null
    currency: string
  }>
  doctors: Array<{
    id: string
    fullName: string
    specialty: string | null
    bio: string | null
    avatarUrl: string | null
    verified: boolean
    services: Array<{
      id: string
      name: string
      description: string | null
      durationMin: number
      price: number | null
    }>
    nextSlots: Array<{ date: string; startTime: string; endTime: string; serviceId: string }>
    reviews: { averageRating: number | null; reviewCount: number }
  }>
  recentReviews: Array<{
    id: string
    rating: number
    comment: string | null
    clientName: string
    createdAt: string
  }>
}

function summarizeOpeningHours(
  rules: Array<{ weekday: number; startTime: string; endTime: string }>,
): ClinicOpeningHoursLine[] {
  const byDay = new Map<number, Array<{ startTime: string; endTime: string }>>()
  for (const rule of rules) {
    if (rule.weekday < 0 || rule.weekday > 6) continue
    const list = byDay.get(rule.weekday) ?? []
    const key = `${rule.startTime}-${rule.endTime}`
    if (!list.some((w) => `${w.startTime}-${w.endTime}` === key)) {
      list.push({ startTime: rule.startTime, endTime: rule.endTime })
    }
    byDay.set(rule.weekday, list)
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekday, windows]) => ({
      weekday,
      label: WEEKDAY_TR[weekday] ?? `Gün ${weekday}`,
      windows: windows.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
}

/** Shared loader for GET /api/client/clinics/[id] and /client/clinics/[id] page. */
export async function getClientClinicDetail(id: string): Promise<ClientClinicDetail | null> {
  return runWithTenantBypassAsync('marketplace:clinic-detail', async () => {
    const prisma = catalogPrisma()
    const business = await prisma.business.findFirst({
      where: { id, isActive: true },
      include: {
        locations: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        members: {
          where: { role: 'DOKTOR', isActive: true, isBookable: true },
          orderBy: { fullName: 'asc' },
          include: {
            user: { select: { avatarUrl: true } },
            availabilityRules: {
              where: { isActive: true, deletedAt: null },
              select: { weekday: true, startTime: true, endTime: true },
            },
            serviceAssignments: {
              where: { isActive: true },
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    durationMin: true,
                    price: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        vendorAccount: { select: { isDemo: true } },
      },
    })

    if (!business) return null
    if (business.vendorAccount?.isDemo) return null
    if (
      !shouldIncludeTestClinicsInPublicIndex() &&
      isPublicTestClinic({ slug: business.slug, name: business.name })
    ) {
      return null
    }

    const city = business.city?.trim() ?? ''
    const blockedCity = /^(istanbul|i̇stanbul|ataşehir|ankara|izmir|i̇zmir)$/i.test(city)
    if (blockedCity) return null

    const [reviewAggregate, reviewCount, recentReviews, doctorReviewRows] = await Promise.all([
      prisma.review.aggregate({
        where: { businessId: id, deletedAt: null },
        _avg: { rating: true },
      }),
      prisma.review.count({
        where: { businessId: id, deletedAt: null },
      }),
      prisma.review.findMany({
        where: { businessId: id, deletedAt: null, comment: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          clientUser: { select: { fullName: true } },
        },
      }),
      prisma.review.groupBy({
        by: ['staffId'],
        where: {
          businessId: id,
          deletedAt: null,
          staffId: { not: null },
        },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ])

    const reviewByDoctorId = new Map(
      doctorReviewRows
        .filter((row): row is typeof row & { staffId: string } => Boolean(row.staffId))
        .map((row) => [
          row.staffId,
          {
            averageRating: row._avg.rating ? Number(row._avg.rating) : null,
            reviewCount: row._count._all,
          },
        ]),
    )

    const today = todayIso()
    const doctors = await Promise.all(
      business.members.map(async (doctor) => {
        const assigned = doctor.serviceAssignments.map((assignment) => assignment.service)
        const services = assigned.length > 0 ? assigned : business.services
        const firstService = services[0]
        const verified = Boolean(
          doctor.medicalLicenseNo || doctor.diplomaNo || doctor.kktcIdentityNo,
        )

        let nextSlots: Array<{
          date: string
          startTime: string
          endTime: string
          serviceId: string
        }> = []

        if (firstService) {
          for (let day = 0; day < 7 && nextSlots.length === 0; day += 1) {
            const date = addCalendarDays(today, day)
            const slots = await getAvailableSlots({
              businessId: business.id,
              doctorId: doctor.id,
              serviceId: firstService.id,
              date,
            })
            nextSlots = slots.slice(0, 6).map((slot) => ({
              date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              serviceId: firstService.id,
            }))
          }
        }

        return {
          id: doctor.id,
          fullName: doctor.fullName,
          specialty: doctor.specialty,
          bio: doctor.bio,
          avatarUrl: doctor.user?.avatarUrl ?? null,
          verified,
          services: services.map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            durationMin: service.durationMin,
            price: toNumber(service.price),
          })),
          nextSlots,
          reviews: reviewByDoctorId.get(doctor.id) ?? {
            averageRating: null,
            reviewCount: 0,
          },
        }
      }),
    )

    const verifiedDoctorCount = doctors.filter((d) => d.verified).length
    const specialtySummary = Array.from(
      new Set(
        doctors
          .map((d) => d.specialty?.trim())
          .filter((s): s is string => Boolean(s && s.length > 0)),
      ),
    ).slice(0, 6)

    const openingHours = summarizeOpeningHours(
      business.members.flatMap((m) => m.availabilityRules),
    )

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description,
      specialtySummary,
      address: business.address,
      city: business.city,
      phone: business.phone,
      email: business.email,
      logoUrl: business.logoUrl,
      currency: business.currency || 'TRY',
      locationLat: toNumber(business.locationLat),
      locationLng: toNumber(business.locationLng),
      ratingAverage: reviewAggregate._avg.rating ? Number(reviewAggregate._avg.rating) : null,
      reviewCount,
      verifiedDoctorCount,
      openingHours,
      bookingPolicy: {
        cancelMinHours: getCancelMinHoursBefore(),
        depositEnabled: business.depositEnabled,
        depositAmount: toNumber(business.depositAmount),
        noShowFeeEnabled: business.noShowFeeEnabled,
        noShowFeeAmount: toNumber(business.noShowFeeAmount),
        noShowFeeNote: business.noShowFeeNote,
      },
      locations: business.locations.map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        phone: location.phone,
      })),
      services: business.services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        price: toNumber(service.price),
        currency: service.currency,
      })),
      doctors,
      recentReviews: recentReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        clientName: review.clientUser.fullName,
        createdAt: review.createdAt.toISOString(),
      })),
    }
  })
}
