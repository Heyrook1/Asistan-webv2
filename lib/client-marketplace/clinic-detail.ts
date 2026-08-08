import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'
import { addCalendarDays, calendarDateInTimeZone } from '@/lib/datetime/calendar-label'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

function todayIso() {
  return calendarDateInTimeZone()
}

function toNumber(value: unknown) {
  if (value == null) return null
  const parsed = Number(typeof value === 'object' ? String(value) : value)
  return Number.isNaN(parsed) ? null : parsed
}

export type ClientClinicDetail = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  locationLat: number | null
  locationLng: number | null
  ratingAverage: number | null
  reviewCount: number
  verifiedDoctorCount: number
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

    const verifiedDoctorCount = business.members.filter((member) =>
      Boolean(member.medicalLicenseNo || member.diplomaNo || member.kktcIdentityNo),
    ).length

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description,
      address: business.address,
      city: business.city,
      phone: business.phone,
      email: business.email,
      logoUrl: business.logoUrl,
      locationLat: toNumber(business.locationLat),
      locationLng: toNumber(business.locationLng),
      ratingAverage: reviewAggregate._avg.rating ? Number(reviewAggregate._avg.rating) : null,
      reviewCount,
      verifiedDoctorCount,
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
