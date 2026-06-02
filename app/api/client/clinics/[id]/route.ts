import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'

export const dynamic = 'force-dynamic'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function toNumber(value: unknown) {
  if (value == null) return null
  const parsed = Number(typeof value === 'object' ? String(value) : value)
  return Number.isNaN(parsed) ? null : parsed
}

function buildRatingDistribution(rows: Array<{ rating: number; _count: { _all: number } }>) {
  const counts = new Map<number, number>()
  for (const row of rows) counts.set(row.rating, row._count._all)
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: counts.get(rating) ?? 0,
  }))
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

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
                select: { id: true, name: true, durationMin: true, price: true, description: true },
              },
            },
          },
          availabilityRules: {
            where: { isActive: true },
            orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
            select: { weekday: true, startTime: true, endTime: true, locationId: true },
          },
        },
      },
    },
  })

  if (!business) {
    return NextResponse.json({ error: 'Klinik bulunamadi' }, { status: 404 })
  }

  const [reviewAggregate, reviewCount, ratingRows, completedAppointments, completedPatientRows, recentReviews, doctorReviewRows] = await Promise.all([
    prisma.review.aggregate({
      where: { businessId: id, deletedAt: null },
      _avg: { rating: true },
    }),
    prisma.review.count({
      where: { businessId: id, deletedAt: null },
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { businessId: id, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.appointment.count({
      where: {
        businessId: id,
        status: 'COMPLETED',
        deletedAt: null,
      },
    }),
    prisma.appointment.findMany({
      where: {
        businessId: id,
        status: 'COMPLETED',
        deletedAt: null,
      },
      distinct: ['clientUserId'],
      select: { clientUserId: true },
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

  const ratingDistribution = buildRatingDistribution(ratingRows)
  const reviewByDoctorId = new Map(
    doctorReviewRows
      .filter((row): row is typeof row & { staffId: string } => Boolean(row.staffId))
      .map((row) => [
        row.staffId,
        {
          averageRating: row._avg.rating ? Number(row._avg.rating) : null,
          reviewCount: row._count._all,
        },
      ])
  )

  const today = todayIso()
  const doctors = await Promise.all(
    business.members.map(async (doctor) => {
      const assigned = doctor.serviceAssignments.map((assignment) => assignment.service)
      const services = assigned.length > 0 ? assigned : business.services
      const firstService = services[0]
      const slots =
        firstService
          ? await getAvailableSlots({
              businessId: business.id,
              doctorId: doctor.id,
              serviceId: firstService.id,
              date: today,
            })
          : []

      return {
        id: doctor.id,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        bio: doctor.bio,
        story: doctor.bio
          ? doctor.bio
          : `${doctor.fullName}, ${business.name} bunyesinde hasta kabul etmektedir.`,
        services: services.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          durationMin: service.durationMin,
          price: toNumber(service.price),
        })),
        workingHours: doctor.availabilityRules,
        nextSlots: slots.slice(0, 6),
        reviews: reviewByDoctorId.get(doctor.id) ?? {
          averageRating: null,
          reviewCount: 0,
        },
      }
    })
  )

  const story = business.description
    ? business.description
    : `${business.name}, ${business.city ?? 'bolgesinde'} hasta odakli muayene, takip ve randevu sureci yurutmektedir.`

  const credentials = [
    {
      id: 'operations',
      title: 'Randevu ve operasyon sureci',
      issuer: 'Asistan Platform',
      status: business.autoConfirmClientAppointments ? 'Otomasyon aktif' : 'Manuel onay sureci',
    },
    {
      id: 'coverage',
      title: `${business.services.length} aktif hizmet kalemi`,
      issuer: business.name,
      status: business.services.length > 0 ? 'Yayinda' : 'Guncelleniyor',
    },
    {
      id: 'team',
      title: `${business.members.length} aktif uzman hekim`,
      issuer: 'Klinik kaydi',
      status: business.members.length > 0 ? 'Dogrulandi' : 'Beklemede',
    },
  ]

  return NextResponse.json({
    clinic: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description,
      story,
      address: business.address,
      city: business.city,
      phone: business.phone,
      email: business.email,
      logoUrl: business.logoUrl,
      locationLat: toNumber(business.locationLat),
      locationLng: toNumber(business.locationLng),
      ratingAverage: reviewAggregate._avg.rating ? Number(reviewAggregate._avg.rating) : null,
      reviewCount,
      ratingDistribution,
      credentials,
      analytics: {
        completedAppointments,
        uniqueClients: completedPatientRows.filter((row) => row.clientUserId).length,
        doctorCount: business.members.length,
        serviceCount: business.services.length,
        locationCount: business.locations.length,
        activeSinceYear: business.createdAt.getFullYear(),
      },
      qualityHighlights: [
        'Randevu planlama ve takipte sureklilik',
        'Klinik genelinde hizmet standardizasyonu',
        'Hasta memnuniyeti odakli geri bildirim dongusu',
      ],
      patientVoice: recentReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        clientName: review.clientUser.fullName,
        createdAt: review.createdAt.toISOString(),
      })),
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
    },
  })
}
