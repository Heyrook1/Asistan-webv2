import 'server-only'

import {
  AppointmentStatus,
  NotificationActionType,
  NotificationPriority,
  NotificationType,
  Prisma,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications/service'
import { notifyPatientChannels } from '@/lib/notifications/patient-channels'
import {
  createAppointmentDeposit,
  parseDepositPolicy,
} from '@/lib/payments/deposit'
import { ensureIntakeInviteForAppointment } from '@/lib/intake/invites'
import {
  createClientBookingSchema,
  type CreateClientBookingInput,
} from '@/lib/client-marketplace/booking-schema'
import { trackFunnelEvent } from '@/lib/observability/funnel'
import {
  claimIdempotentBookingResponseTx,
  getIdempotentBookingResponse,
  IdempotencyConflictError,
  isValidIdempotencyKey,
  hashBookingPayload,
  IDEMPOTENCY_PAYLOAD_HASH_FIELD,
} from '@/lib/public-booking/idempotency'
import {
  runSlotAppointmentTransaction,
  SlotConflictError,
} from '@/lib/booking/create-slot-appointment'
import { setTenantBusinessId } from '@/lib/security/tenant-db-context'

function bookingMessage(status: AppointmentStatus): string {
  return status === AppointmentStatus.CONFIRMED
    ? 'Randevunuz onaylandı.'
    : 'Randevu talebiniz alındı. Klinik onayından sonra bilgilendirileceksiniz.'
}

async function notifyClinic(input: {
  businessId: string
  appointmentId: string
  patientId: string
  patientName: string
  serviceName: string
  locationName: string | null
  date: string
  startTime: string
  staffId: string
  pendingApproval: boolean
}) {
  const [assigned, business] = await Promise.all([
    prisma.$transaction(async (tx) => {
      await setTenantBusinessId(tx, input.businessId)
      return tx.teamMember.findFirst({
        where: { id: input.staffId, businessId: input.businessId },
        select: { userId: true },
      })
    }),
    prisma.business.findUnique({
      where: { id: input.businessId },
      select: { ownerUserId: true },
    }),
  ])

  const message = `Genel randevu linki: ${input.patientName}, ${input.date} ${input.startTime}${
    input.locationName ? ` (${input.locationName})` : ''
  }`

  if (input.pendingApproval) {
    await createNotification({
      businessId: input.businessId,
      recipientUserId: assigned?.userId,
      recipientUserIds: [business?.ownerUserId],
      roles: assigned?.userId ? undefined : ['DOKTOR', 'ISLETME_SAHIBI', 'SEKRETER'],
      actorUserId: null,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_pending_approval',
      title: 'Onay bekleyen randevu (genel link)',
      message,
      entityType: 'appointment',
      entityId: input.appointmentId,
      link: `/dashboard/ajanda?mode=liste&id=${input.appointmentId}&status=SCHEDULED`,
      priority: NotificationPriority.HIGH,
      actionRequired: true,
      metadata: {
        appointmentId: input.appointmentId,
        patientName: input.patientName,
        serviceName: input.serviceName,
        date: input.date,
        startTime: input.startTime,
        channel: 'public_book',
      },
      actions: [
        { label: 'Onayla', actionType: NotificationActionType.APPOINTMENT_APPROVE, payload: { appointmentId: input.appointmentId } },
        { label: 'İptal Et', actionType: NotificationActionType.APPOINTMENT_CANCEL, payload: { appointmentId: input.appointmentId } },
        { label: 'Ertele', actionType: NotificationActionType.APPOINTMENT_RESCHEDULE, payload: { appointmentId: input.appointmentId } },
        { label: 'Hastayı Aç', actionType: NotificationActionType.OPEN_PATIENT, payload: { patientId: input.patientId } },
      ],
    })
    return
  }

  await createNotification({
    businessId: input.businessId,
    recipientUserId: assigned?.userId,
    recipientUserIds: [business?.ownerUserId],
    roles: assigned?.userId ? undefined : ['DOKTOR', 'ISLETME_SAHIBI', 'SEKRETER'],
    actorUserId: null,
    type: NotificationType.APPOINTMENT,
    subtype: 'appointment_assigned',
    title: 'Yeni randevu (genel link)',
    message,
    entityType: 'appointment',
    entityId: input.appointmentId,
    link: `/dashboard/ajanda?mode=liste&id=${input.appointmentId}`,
    priority: NotificationPriority.NORMAL,
    metadata: {
      appointmentId: input.appointmentId,
      patientName: input.patientName,
      serviceName: input.serviceName,
      date: input.date,
      startTime: input.startTime,
      channel: 'public_book',
    },
  })
}

async function createGuestBookingOnce(
  payload: CreateClientBookingInput,
  idempotencyKey: string | null
) {
  const payloadHash = hashBookingPayload(payload)
  return runSlotAppointmentTransaction({
    payload,
    clientUserId: null,
    actorUserId: null,
    notes: payload.note ? `[Genel link] ${payload.note}` : '[Genel link]',
    timelineTitle: 'Genel randevu linkinden randevu oluşturuldu',
    requireLocationIfIdProvided: false,
    onAfterAppointment: idempotencyKey
      ? async (tx, ctx) => {
          // Claim last in the transaction so concurrent same-key requests never both create.
          await claimIdempotentBookingResponseTx(tx, idempotencyKey, {
            appointmentId: ctx.appointmentId,
            status: ctx.status,
            doctorName: ctx.doctorName,
            serviceName: ctx.serviceName,
            intakeUrl: null,
            intakeFormName: null,
            message: bookingMessage(ctx.status),
            [IDEMPOTENCY_PAYLOAD_HASH_FIELD]: payloadHash,
          })
        }
      : undefined,
  })
}

export const publicBookingSchema = createClientBookingSchema

export async function createGuestPublicBooking(raw: unknown, idempotencyKeyRaw?: string | null) {
  const parsed = publicBookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false as const, error: 'Form hatalı', issues: parsed.error.issues }
  }

  const idempotencyKey =
    idempotencyKeyRaw && isValidIdempotencyKey(idempotencyKeyRaw) ? idempotencyKeyRaw : null

  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const booking = await createGuestBookingOnce(parsed.data, idempotencyKey)
      try {
        await notifyClinic({
          businessId: parsed.data.businessId,
          appointmentId: booking.appointmentId,
          patientId: booking.patientId,
          patientName: parsed.data.fullName,
          serviceName: booking.serviceName,
          locationName: booking.locationName,
          date: parsed.data.date,
          startTime: parsed.data.startTime,
          staffId: parsed.data.doctorId,
          pendingApproval: booking.status === AppointmentStatus.SCHEDULED,
        })
      } catch (notifyError) {
        // Appointment already committed — do not fail the guest response.
        console.error('[public-book] clinic notify failed', notifyError)
      }

      let intakeUrl: string | null = null
      let intakeFormName: string | null = null
      try {
        const invite = await ensureIntakeInviteForAppointment({
          businessId: parsed.data.businessId,
          appointmentId: booking.appointmentId,
          patientId: booking.patientId,
          serviceId: parsed.data.serviceId,
          appointmentDate: new Date(parsed.data.date),
        })
        intakeUrl = invite?.intakeUrl ?? null
        intakeFormName = invite?.formName ?? null
      } catch {
        // Booking still succeeds if intake invite fails.
      }

      trackFunnelEvent({
        step: 'book_requested',
        businessId: parsed.data.businessId,
        appointmentId: booking.appointmentId,
        ok: true,
        metadata: { status: booking.status },
      })
      if (booking.status === AppointmentStatus.CONFIRMED) {
        trackFunnelEvent({
          step: 'book_confirmed',
          businessId: parsed.data.businessId,
          appointmentId: booking.appointmentId,
          ok: true,
        })
      }

      const business = await prisma.business.findUnique({
        where: { id: parsed.data.businessId },
        select: {
          name: true,
          currency: true,
          depositEnabled: true,
          depositAmount: true,
        },
      })

      if (booking.status === AppointmentStatus.CONFIRMED) {
        // Soft-fail: auto-confirm book still succeeds if SMS/WA webhook is down.
        try {
          await notifyPatientChannels({
            businessId: parsed.data.businessId,
            appointmentId: booking.appointmentId,
            patientId: booking.patientId,
            patientName: parsed.data.fullName,
            patientPhone: parsed.data.phone,
            patientEmail: parsed.data.email,
            serviceName: booking.serviceName,
            startsAt: `${parsed.data.date}T${parsed.data.startTime}:00`,
            clinicName: business?.name,
            kind: 'confirm',
          })
        } catch (patientNotifyError) {
          console.error('[public-book] patient notify failed', patientNotifyError)
        }
      }

      let deposit: Awaited<ReturnType<typeof createAppointmentDeposit>> = null
      try {
        const policy = parseDepositPolicy(business ?? {})
        if (policy.depositEnabled && policy.depositAmount && policy.depositAmount > 0) {
          deposit = await createAppointmentDeposit({
            businessId: parsed.data.businessId,
            appointmentId: booking.appointmentId,
            clinicName: business?.name ?? 'Klinik',
            amount: policy.depositAmount,
            currency: policy.currency,
          })
        }
      } catch {
        // Soft-fail: booking remains valid without deposit intent.
      }

      return {
        ok: true as const,
        data: {
          appointmentId: booking.appointmentId,
          status: booking.status,
          doctorName: booking.doctorName,
          serviceName: booking.serviceName,
          intakeUrl,
          intakeFormName,
          message: bookingMessage(booking.status),
          deposit,
        },
        replay: false,
      }
    } catch (error) {
      if (error instanceof SlotConflictError) {
        return { ok: false as const, error: error.message }
      }
      // Same idempotency key already claimed: transaction rolled back; replay winner.
      if (error instanceof IdempotencyConflictError && idempotencyKey) {
        const stored = await getIdempotentBookingResponse(idempotencyKey)
        if (stored) {
          return { ok: true as const, data: stored, replay: true }
        }
        return {
          ok: false as const,
          error: 'Randevu talebiniz işleniyor. Lütfen birkaç saniye sonra tekrar deneyin.',
        }
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < maxAttempts) {
        continue
      }
      throw error
    }
  }

  return {
    ok: false as const,
    error: 'Randevu oluşturulurken geçici bir çakışma oldu. Lütfen tekrar deneyin.',
  }
}
