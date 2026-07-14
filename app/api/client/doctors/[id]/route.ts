import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'
import { getDoctorReviewSummary } from '@/lib/client-marketplace/reviews'
import { getDoctorVerification } from '@/lib/trust/public'

export const dynamic = 'force-dynamic'

function toNumber(value: unknown) {
  if (value == null) return null
  const parsed = Number(typeof value === 'object' ? String(value) : value)
  return Number.isNaN(parsed) ? null : parsed
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const date = request.nextUrl.searchParams.get('date') ?? todayIso()
  const serviceId = request.nextUrl.searchParams.get('serviceId')

  const doctor = await prisma.teamMember.findFirst({
    where: {
      id,
      role: 'DOKTOR',
      isActive: true,
      isBookable: true,
      business: { isActive: true },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          city: true,
          locationLat: true,
          locationLng: true,
        },
      },
      serviceAssignments: {
        where: { isActive: true },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              durationMin: true,
              price: true,
              currency: true,
              isActive: true,
            },
          },
        },
      },
      availabilityRules: {
        where: { isActive: true },
        orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
        select: { weekday: true, startTime: true, endTime: true, locationId: true, slotIntervalMin: true },
      },
    },
  })

  if (!doctor) {
    return NextResponse.json({ error: 'Doktor bulunamadi' }, { status: 404 })
  }

  const services =
    doctor.serviceAssignments.length > 0
      ? doctor.serviceAssignments
          .map((assignment) => assignment.service)
          .filter((service) => service.isActive)
      : await prisma.service.findMany({
          where: { businessId: doctor.businessId, isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            durationMin: true,
            price: true,
            currency: true,
          },
          orderBy: { name: 'asc' },
        })

  const selectedServiceId = serviceId ?? services[0]?.id
  const slots =
    selectedServiceId
      ? await getAvailableSlots({
          businessId: doctor.businessId,
          doctorId: doctor.id,
          serviceId: selectedServiceId,
          date,
        })
      : []

  const [reviewSummary, ratingRows, completedAppointments, completedPatientRows] = await Promise.all([
    getDoctorReviewSummary(doctor.id),
    prisma.review.groupBy({
      by: ['rating'],
      where: { staffId: doctor.id, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.appointment.count({
      where: {
        staffId: doctor.id,
        status: 'COMPLETED',
        deletedAt: null,
      },
    }),
    prisma.appointment.findMany({
      where: {
        staffId: doctor.id,
        status: 'COMPLETED',
        deletedAt: null,
      },
      distinct: ['patientId'],
      select: { patientId: true },
    }),
  ])

  const ratingDistribution = buildRatingDistribution(ratingRows)
  const workingDayCount = new Set(doctor.availabilityRules.map((rule) => rule.weekday)).size
  const experienceSinceYear = doctor.createdAt.getFullYear()
  const expertiseLabel = doctor.specialty ?? 'Genel sağlık'
  const story = doctor.bio
    ? doctor.bio
    : `${doctor.fullName}, ${doctor.business.name} bünyesinde ${expertiseLabel.toLowerCase()} odaklı muayene ve takip hizmeti sunuyor.`

  const verification = getDoctorVerification({
    specialty: doctor.specialty,
    medicalLicenseNo: doctor.medicalLicenseNo,
    diplomaNo: doctor.diplomaNo,
    kktcIdentityNo: doctor.kktcIdentityNo,
    hasAvailability: doctor.availabilityRules.length > 0,
    hasServices: services.length > 0,
  })

  const credentials = [
    {
      id: 'verification',
      title: verification.label,
      issuer: 'Asistan Platform',
      status: verification.level === 'verified' ? 'Dogrulandi' : verification.level === 'partial' ? 'Devam ediyor' : 'Beklemede',
    },
    {
      id: 'license',
      title: doctor.medicalLicenseNo ? 'Tibbi ruhsat kaydi' : 'Tibbi ruhsat bilgisi',
      issuer: 'Klinik beyanı',
      status: doctor.medicalLicenseNo ? 'Kayitli' : 'Paylasilmadi',
    },
    {
      id: 'diploma',
      title: doctor.diplomaNo ? 'Diploma kaydi' : 'Diploma bilgisi',
      issuer: 'Klinik beyanı',
      status: doctor.diplomaNo ? 'Kayitli' : 'Paylasilmadi',
    },
    {
      id: 'specialty',
      title: doctor.specialty ? `${doctor.specialty} uzmanlik alani` : 'Uzmanlik alani bilgisi',
      issuer: 'Klinik beyani',
      status: doctor.specialty ? 'Beyan edildi' : 'Paylasilmadi',
    },
    {
      id: 'schedule',
      title: 'Randevu takvimi uygunluk kaydi',
      issuer: 'Asistan Platform',
      status: doctor.availabilityRules.length > 0 ? 'Aktif' : 'Pasif',
    },
  ]

  return NextResponse.json({
    doctor: {
      id: doctor.id,
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      bio: doctor.bio,
      story,
      clinic: {
        id: doctor.business.id,
        name: doctor.business.name,
        slug: doctor.business.slug,
        address: doctor.business.address,
        city: doctor.business.city,
        locationLat: toNumber(doctor.business.locationLat),
        locationLng: toNumber(doctor.business.locationLng),
      },
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        price: toNumber(service.price),
        currency: service.currency,
      })),
      workingHours: doctor.availabilityRules,
      slots,
      reviews: reviewSummary,
      ratingDistribution,
      verification,
      credentials,
      careApproach: [
        'Kisisellestirilmis muayene ve takip plani',
        'Hasta ile acik ve anlasilir iletisim',
        'Randevu surecinde zaman yonetimi odagi',
      ],
      analytics: {
        completedAppointments,
        uniquePatients: completedPatientRows.length,
        activeServiceCount: services.length,
        workingDayCount,
        nextAvailableAt: slots[0]?.startTime ?? null,
        experienceSinceYear,
      },
    },
  })
}
