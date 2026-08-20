import 'server-only'

import { IntakeInviteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/seo'
import { getIntakePath } from '@/lib/intake/schema'
import { resolveIntakeFormForAppointment } from '@/lib/intake/resolve-form'
import { createIntakeToken, hashIntakeToken } from '@/lib/intake/tokens'

function defaultExpiry(appointmentDate: Date) {
  const expires = new Date(appointmentDate)
  expires.setUTCDate(expires.getUTCDate() + 2)
  expires.setUTCHours(23, 59, 59, 999)
  return expires
}

/**
 * Creates (or returns existing pending) intake invite for an appointment.
 * Returns raw token + public URL only when a new token is issued.
 */
export async function ensureIntakeInviteForAppointment(input: {
  businessId: string
  appointmentId: string
  patientId: string
  serviceId: string
  appointmentDate: Date
}): Promise<{ inviteId: string; token: string | null; intakeUrl: string | null; formName: string } | null> {
  const form = await resolveIntakeFormForAppointment({
    businessId: input.businessId,
    serviceId: input.serviceId,
  })
  if (!form) return null

  const existing = await prisma.intakeInvite.findUnique({
    where: { appointmentId: input.appointmentId },
    select: { id: true, status: true, formId: true },
  })

  if (existing?.status === IntakeInviteStatus.SUBMITTED) {
    return { inviteId: existing.id, token: null, intakeUrl: null, formName: form.name }
  }

  if (existing?.status === IntakeInviteStatus.PENDING && existing.formId === form.id) {
    // Cannot recover raw token; staff must regenerate.
    return { inviteId: existing.id, token: null, intakeUrl: null, formName: form.name }
  }

  if (existing) {
    await prisma.intakeInvite.deleteMany({
      where: { id: existing.id, businessId: input.businessId },
    })
  }

  const token = createIntakeToken()
  const invite = await prisma.intakeInvite.create({
    data: {
      businessId: input.businessId,
      formId: form.id,
      appointmentId: input.appointmentId,
      patientId: input.patientId,
      tokenHash: hashIntakeToken(token),
      status: IntakeInviteStatus.PENDING,
      expiresAt: defaultExpiry(input.appointmentDate),
    },
    select: { id: true },
  })

  const path = getIntakePath(token)
  return {
    inviteId: invite.id,
    token,
    intakeUrl: absoluteUrl(path),
    formName: form.name,
  }
}

/** Force-rotate token for staff copy-link. */
export async function regenerateIntakeInviteToken(input: {
  businessId: string
  appointmentId: string
}) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: input.appointmentId, businessId: input.businessId },
    select: {
      id: true,
      patientId: true,
      serviceId: true,
      date: true,
      intakeInvite: { select: { id: true, status: true } },
    },
  })
  if (!appointment) return null
  if (appointment.intakeInvite?.status === IntakeInviteStatus.SUBMITTED) {
    return { error: 'Form zaten doldurulmuş' as const }
  }

  if (appointment.intakeInvite) {
    await prisma.intakeInvite.deleteMany({
      where: { id: appointment.intakeInvite.id, businessId: input.businessId },
    })
  }

  return ensureIntakeInviteForAppointment({
    businessId: input.businessId,
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    serviceId: appointment.serviceId,
    appointmentDate: appointment.date,
  })
}
