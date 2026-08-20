import 'server-only'

import { IntakeInviteStatus, TimelineEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseIntakeFields, validateIntakeAnswers } from '@/lib/intake/schema'
import { hashIntakeToken } from '@/lib/intake/tokens'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

/**
 * Public intake is a capability-URL flow (tokenHash). Tenant-guard cannot see
 * businessId on token lookup — intentional bypass with scoped writes afterward.
 */
export async function getPublicIntakeByToken(token: string) {
  const tokenHash = hashIntakeToken(token)
  const invite = await runWithTenantBypassAsync('intake:public-token-read', () =>
    prisma.intakeInvite.findFirst({
      where: { tokenHash },
      include: {
        form: {
          select: { id: true, name: true, description: true, fields: true, isActive: true, deletedAt: true },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            status: true,
            service: { select: { name: true } },
          },
        },
        patient: { select: { fullName: true } },
        business: { select: { name: true, primaryColor: true, logoUrl: true } },
        response: { select: { id: true, submittedAt: true } },
      },
    })
  )

  if (!invite) return { ok: false as const, error: 'not_found' }
  if (invite.status === IntakeInviteStatus.REVOKED) return { ok: false as const, error: 'revoked' }
  if (invite.status === IntakeInviteStatus.SUBMITTED || invite.response) {
    return {
      ok: true as const,
      alreadySubmitted: true as const,
      clinicName: invite.business.name,
      formName: invite.form.name,
      submittedAt: invite.submittedAt ?? invite.response?.submittedAt ?? null,
    }
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    await runWithTenantBypassAsync('intake:public-expire', () =>
      prisma.intakeInvite.updateMany({
        where: { id: invite.id, businessId: invite.businessId },
        data: { status: IntakeInviteStatus.EXPIRED },
      })
    )
    return { ok: false as const, error: 'expired' }
  }
  if (!invite.form.isActive || invite.form.deletedAt) {
    return { ok: false as const, error: 'unavailable' }
  }

  return {
    ok: true as const,
    alreadySubmitted: false as const,
    inviteId: invite.id,
    clinicName: invite.business.name,
    primaryColor: invite.business.primaryColor || '#0071E3',
    logoUrl: invite.business.logoUrl,
    formName: invite.form.name,
    formDescription: invite.form.description,
    fields: parseIntakeFields(invite.form.fields),
    patientName: invite.patient.fullName,
    appointment: {
      date: invite.appointment.date.toISOString().slice(0, 10),
      startTime: invite.appointment.startTime,
      serviceName: invite.appointment.service.name,
    },
  }
}

export async function submitPublicIntake(token: string, rawAnswers: unknown) {
  const tokenHash = hashIntakeToken(token)
  const invite = await runWithTenantBypassAsync('intake:public-token-read', () =>
    prisma.intakeInvite.findFirst({
      where: { tokenHash },
      include: {
        form: { select: { id: true, name: true, fields: true, isActive: true, deletedAt: true } },
      },
    })
  )

  if (!invite) return { ok: false as const, error: 'Bağlantı geçersiz' }
  if (invite.status === IntakeInviteStatus.SUBMITTED) {
    return { ok: false as const, error: 'Bu form zaten gönderilmiş' }
  }
  if (invite.status === IntakeInviteStatus.REVOKED) {
    return { ok: false as const, error: 'Bağlantı iptal edilmiş' }
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: 'Bağlantının süresi dolmuş' }
  }
  if (!invite.form.isActive || invite.form.deletedAt) {
    return { ok: false as const, error: 'Form artık kullanılamıyor' }
  }

  const fields = parseIntakeFields(invite.form.fields)
  if (fields.length === 0) return { ok: false as const, error: 'Form boş' }

  const answersObj =
    rawAnswers && typeof rawAnswers === 'object' && !Array.isArray(rawAnswers)
      ? (rawAnswers as Record<string, unknown>)
      : {}
  const validated = validateIntakeAnswers(fields, answersObj)
  if (!validated.ok) {
    return { ok: false as const, error: 'Eksik veya geçersiz cevaplar', fieldErrors: validated.errors }
  }

  const now = new Date()
  await runWithTenantBypassAsync('intake:public-submit', () =>
    prisma.$transaction(async (tx) => {
      await tx.intakeResponse.create({
        data: {
          businessId: invite.businessId,
          formId: invite.formId,
          inviteId: invite.id,
          appointmentId: invite.appointmentId,
          patientId: invite.patientId,
          answers: validated.answers,
          formSnapshot: fields,
        },
      })
      await tx.intakeInvite.updateMany({
        where: { id: invite.id, businessId: invite.businessId },
        data: { status: IntakeInviteStatus.SUBMITTED, submittedAt: now },
      })
      await tx.timelineEvent.create({
        data: {
          businessId: invite.businessId,
          patientId: invite.patientId,
          type: TimelineEventType.INTAKE_SUBMITTED,
          title: 'Ön kayıt formu dolduruldu',
          description: invite.form.name,
          actorName: 'Hasta (ön kayıt)',
          actorId: null,
        },
      })
    })
  )

  return { ok: true as const, message: 'Formunuz alındı. Teşekkürler.' }
}
