import 'server-only'

import {
  AppointmentStatus,
  Prisma,
  TimelineEventType,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAvailableSlotsTx } from '@/lib/client-marketplace/availability'
import type { CreateClientBookingInput } from '@/lib/client-marketplace/booking-schema'
import { BOOKING_PRIVACY_NOTICE_VERSION } from '@/lib/client-marketplace/booking-schema'
import { resolveOrCreateClinicPatient } from '@/lib/identity/clinic-patient'
import { ensurePatientCardOnConfirm } from '@/lib/identity/ensure-patient-card-on-confirm'
import { setTenantBusinessId } from '@/lib/security/tenant-db-context'

export class SlotConflictError extends Error {
  constructor() {
    super('Bu saat az önce doldu. Lütfen başka bir saat seçin.')
  }
}

export type CreateSlotAppointmentInput = {
  payload: CreateClientBookingInput
  /** Authenticated client app user; null for guest public book. */
  clientUserId: string | null
  /** Timeline actor (auth user id); null for guest. */
  actorUserId: string | null
  notes: string | null
  timelineTitle: string
  /**
   * Client app: throw when locationId is set but not found.
   * Guest public: allow booking with null locationId.
   */
  requireLocationIfIdProvided: boolean
  /** Channel-specific writes after appointment + timeline (idempotency claim, clientNotification). */
  onAfterAppointment?: (
    tx: Prisma.TransactionClient,
    ctx: {
      appointmentId: string
      patientId: string
      status: AppointmentStatus
      doctorName: string
      serviceName: string
      locationName: string | null
    }
  ) => Promise<void>
}

export type CreateSlotAppointmentResult = {
  appointmentId: string
  patientId: string
  status: AppointmentStatus
  locationName: string | null
  serviceName: string
  doctorName: string
}

/** In-transaction core shared by guest public book and client marketplace book (I5). */
export async function createSlotAppointmentTx(
  tx: Prisma.TransactionClient,
  input: CreateSlotAppointmentInput
): Promise<CreateSlotAppointmentResult> {
  const { payload } = input

  const [business, doctor, service] = await Promise.all([
    tx.business.findFirst({
      where: { id: payload.businessId, isActive: true },
      select: { id: true, autoConfirmClientAppointments: true },
    }),
    tx.teamMember.findFirst({
      where: {
        id: payload.doctorId,
        businessId: payload.businessId,
        role: 'DOKTOR',
        isBookable: true,
        isActive: true,
      },
      select: { id: true, fullName: true },
    }),
    tx.service.findFirst({
      where: {
        id: payload.serviceId,
        businessId: payload.businessId,
        isActive: true,
      },
      select: { id: true, name: true, durationMin: true, price: true },
    }),
  ])

  if (!business || !doctor || !service) {
    throw new Error('Klinik, doktor veya hizmet bilgisi bulunamadı')
  }

  // P0.8 — serialize concurrent books for this doctor+day (not just identical startTime).
  // Overlapping starts (e.g. 09:45–10:05 vs 10:00–10:20) must take the same lock;
  // FOR UPDATE alone only locks *existing* rows, so empty-day races need this key.
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      hashtext(${payload.businessId}),
      hashtext(${`${payload.doctorId}:${payload.date}`})
    )
  `

  // IDs are text (Prisma String), not postgres uuid — do not cast ::uuid
  await tx.$queryRaw`
    select "id"
    from "Appointment"
    where "businessId" = ${payload.businessId}
      and "staffId" = ${payload.doctorId}
      and "date" = ${payload.date}::date
      and "status" in ('SCHEDULED', 'CONFIRMED')
    for update
  `

  const availableSlots = await getAvailableSlotsTx(tx, {
    businessId: payload.businessId,
    doctorId: payload.doctorId,
    serviceId: payload.serviceId,
    date: payload.date,
    locationId: payload.locationId ?? null,
  })

  const matched = availableSlots.find((slot) => slot.startTime === payload.startTime)
  if (!matched) throw new SlotConflictError()

  const location = payload.locationId
    ? await tx.location.findFirst({
        where: {
          id: payload.locationId,
          businessId: payload.businessId,
          isActive: true,
        },
        select: { id: true, name: true },
      })
    : await tx.location.findFirst({
        where: { businessId: payload.businessId, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, name: true },
      })

  if (input.requireLocationIfIdProvided && payload.locationId && !location) {
    throw new Error('Seçilen şube bulunamadı')
  }

  const { patientId } = await resolveOrCreateClinicPatient(tx, {
    businessId: payload.businessId,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    identityNumber: payload.identityNumber,
    address: payload.address,
    city: payload.city,
    // Guest public book: never write plaintext national ID to Patient card.
    persistIdentityOnPatientCard: Boolean(input.clientUserId),
  })

  const status = business.autoConfirmClientAppointments
    ? AppointmentStatus.CONFIRMED
    : AppointmentStatus.SCHEDULED // Model B: clinic-approved request (Onay bekliyor)

  const appointment = await tx.appointment.create({
    data: {
      businessId: payload.businessId,
      locationId: location?.id ?? null,
      patientId,
      serviceId: payload.serviceId,
      staffId: payload.doctorId,
      clientUserId: input.clientUserId,
      date: new Date(payload.date),
      startTime: matched.startTime,
      endTime: matched.endTime,
      status,
      source: 'CLIENT_APP',
      notes: input.notes,
      price: service.price,
    },
    select: { id: true, status: true },
  })

  // Auto-confirm clinics: promote patient card immediately (same as manual approve).
  if (status === AppointmentStatus.CONFIRMED) {
    await ensurePatientCardOnConfirm(tx, {
      businessId: payload.businessId,
      patientId,
      staffId: payload.doctorId,
      appointmentSource: 'CLIENT_APP',
    })
  }

  await tx.timelineEvent.create({
    data: {
      businessId: payload.businessId,
      patientId,
      type: TimelineEventType.APPOINTMENT_CREATED,
      title: input.timelineTitle,
      description: `${service.name} • ${payload.date} ${payload.startTime}`,
      actorName: payload.fullName,
      actorId: input.actorUserId,
      metadata: {
        appointmentId: appointment.id,
        source: 'client_book',
        identityDocumentType: payload.identityDocumentType,
        ...(payload.nationality ? { nationality: payload.nationality } : {}),
        privacyNoticeAccepted: payload.privacyNoticeAccepted,
        marketingOptIn: payload.marketingOptIn,
        privacyNoticeVersion: BOOKING_PRIVACY_NOTICE_VERSION,
      },
    },
  })

  const result: CreateSlotAppointmentResult = {
    appointmentId: appointment.id,
    patientId,
    status: appointment.status,
    locationName: location?.name ?? null,
    serviceName: service.name,
    doctorName: doctor.fullName,
  }

  if (input.onAfterAppointment) {
    await input.onAfterAppointment(tx, result)
  }

  return result
}

export async function runSlotAppointmentTransaction(
  input: CreateSlotAppointmentInput
): Promise<CreateSlotAppointmentResult> {
  return prisma.$transaction(
    async (tx) => {
      // asistan_app RLS: without GUC, doctor/service/appointment reads are empty.
      await setTenantBusinessId(tx, input.payload.businessId)
      return createSlotAppointmentTx(tx, input)
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 8_000,
      timeout: 15_000,
    }
  )
}
