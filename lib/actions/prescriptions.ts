'use server'

import { revalidatePath } from 'next/cache'
import { PrescriptionStatus, TimelineEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { tenantTransaction } from '@/lib/security/tenant-db-context'
import { requirePermission, requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { buildPrescriptionDraft } from '@/lib/prescriptions/build-draft'
import {
  createPrescriptionInput,
  doctorPrescriptionProfileInput,
} from '@/lib/prescriptions/schema'
import { entityIdSchema } from '@/lib/actions/validation'
import { prescriptionUiCopy } from '@/lib/prescriptions/ui-copy'

export async function getPrescriptionDraft(patientId: string) {
  const parsed = entityIdSchema.safeParse(patientId)
  if (!parsed.success) return err('Geçersiz hasta kimli?i', parsed.error.issues)
  const session = await requirePermission('patient.view')
  const draft = await buildPrescriptionDraft({
    businessId: session.businessId,
    patientId: parsed.data,
    preferredDoctorId: null,
    sessionStaffMemberId: session.staffMemberId,
  })
  if (!draft) return err('Hasta bulunamad?')
  return ok(draft)
}

export async function createPrescription(rawInput: unknown): Promise<ActionResult<{ id: string; protocolNo: string }>> {
  const parsed = createPrescriptionInput.safeParse(rawInput)
  if (!parsed.success) return err('Form hatal?', parsed.error.issues)

  const session = await requirePermission('patient.edit')
  const data = parsed.data

  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, businessId: session.businessId },
    include: { allergies: { select: { name: true } } },
  })
  if (!patient) return err('Hasta bulunamad?')

  const doctor = await prisma.teamMember.findFirst({
    where: { id: data.doctorId, businessId: session.businessId, isActive: true, role: 'DOKTOR' },
  })
  if (!doctor) return err('Doktor bulunamad?')

  if (!data.patientIdentityNumber) {
    return err(prescriptionUiCopy.patientIdentityRequired)
  }

  const allergyWarning =
    patient.allergies.length > 0 ? patient.allergies.map((item) => item.name).join(', ') : null

  const year = new Date().getFullYear()

  const created = await tenantTransaction(session.businessId, async (tx) => {
    // Serialize protocolNo allocation per business+year inside the same tx.
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtext(${session.businessId}), ${year})
    `
    const count = await tx.prescription.count({
      where: {
        businessId: session.businessId,
        issuedAt: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    })
    const protocolNo = `RX-${year}-${String(count + 1).padStart(5, '0')}`

    const prescription = await tx.prescription.create({
      data: {
        businessId: session.businessId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        protocolNo,
        status: PrescriptionStatus.ISSUED,
        diagnosis: data.diagnosis,
        notes: data.notes ?? null,
        allergyWarning,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        patientFullName: data.patientFullName,
        patientIdentityNumber: data.patientIdentityNumber ?? null,
        patientBirthDate: data.patientBirthDate ? new Date(data.patientBirthDate) : null,
        patientGender: data.patientGender ?? null,
        patientPhone: data.patientPhone,
        patientAddress: data.patientAddress ?? null,
        patientCity: data.patientCity ?? null,
        doctorTitle: data.doctorTitle ?? null,
        doctorFullName: data.doctorFullName,
        doctorSpecialty: data.doctorSpecialty ?? null,
        doctorKktcIdentityNo: data.doctorKktcIdentityNo ?? null,
        doctorMedicalLicenseNo: data.doctorMedicalLicenseNo ?? null,
        doctorDiplomaNo: data.doctorDiplomaNo ?? null,
        doctorPhone: data.doctorPhone ?? null,
        clinicName: data.clinicName,
        clinicAddress: data.clinicAddress ?? null,
        clinicCity: data.clinicCity ?? null,
        clinicPhone: data.clinicPhone ?? null,
        createdByUserId: session.userId,
        lines: {
          create: data.lines.map((line, index) => ({
            sortOrder: index,
            drugName: line.drugName,
            dosage: line.dosage ?? null,
            frequency: line.frequency ?? null,
            durationDays: line.durationDays ?? null,
            quantity: line.quantity ?? null,
            form: line.form ?? null,
            instructions: line.instructions ?? null,
          })),
        },
      },
      select: { id: true, protocolNo: true },
    })

    await tx.patient.updateMany({
      where: { id: data.patientId, businessId: session.businessId },
      data: {
        identityNumber: data.patientIdentityNumber,
        birthDate: data.patientBirthDate ? new Date(data.patientBirthDate) : patient.birthDate,
        gender: data.patientGender ?? patient.gender,
        address: data.patientAddress ?? patient.address,
        city: data.patientCity ?? patient.city,
        lastDiagnosis: data.diagnosis,
      },
    })

    await tx.timelineEvent.create({
      data: {
        businessId: session.businessId,
        patientId: data.patientId,
        type: TimelineEventType.PATIENT_UPDATED,
        title: prescriptionUiCopy.timelineTitle,
        description: `${protocolNo} ? ${data.diagnosis}`,
        actorName: session.fullName,
        actorId: session.userId,
        metadata: { prescriptionId: prescription.id },
      },
    })

    return prescription
  })

  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok(created)
}

export async function updateDoctorPrescriptionProfile(rawInput: unknown): Promise<ActionResult> {
  const parsed = doctorPrescriptionProfileInput.safeParse(rawInput)
  if (!parsed.success) return err('Form hatal?', parsed.error.issues)

  const session = await requireSession()
  const targetId = parsed.data.teamMemberId ?? session.staffMemberId
  if (!targetId) return err('Doktor profili bulunamad?')

  const member = await prisma.teamMember.findFirst({
    where: { id: targetId, businessId: session.businessId },
  })
  if (!member) return err('Ekip üyesi bulunamad?')

  const isSelf = member.id === session.staffMemberId
  if (!isSelf && !session.permissions.includes('team.manage')) {
    return err(prescriptionUiCopy.otherDoctorProfileForbidden)
  }

  await prisma.teamMember.updateMany({
    where: { id: member.id, businessId: session.businessId },
    data: {
      prescriptionTitle: parsed.data.prescriptionTitle ?? member.prescriptionTitle,
      specialty: parsed.data.specialty ?? member.specialty,
      kktcIdentityNo:
        parsed.data.kktcIdentityNo === '' ? null : parsed.data.kktcIdentityNo ?? member.kktcIdentityNo,
      medicalLicenseNo: parsed.data.medicalLicenseNo ?? member.medicalLicenseNo,
      diplomaNo: parsed.data.diplomaNo ?? member.diplomaNo,
    },
  })

  revalidatePath('/dashboard/ayarlar')
  revalidatePath('/dashboard/takim')
  revalidatePath('/dashboard/hastalar')
  return ok(undefined)
}

export async function listPatientPrescriptions(patientId: string) {
  const parsed = entityIdSchema.safeParse(patientId)
  if (!parsed.success) return []
  const session = await requirePermission('patient.view')
  const rows = await prisma.prescription.findMany({
    where: { businessId: session.businessId, patientId: parsed.data },
    orderBy: { issuedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      protocolNo: true,
      diagnosis: true,
      issuedAt: true,
      doctorFullName: true,
      status: true,
    },
  })

  return rows.map((row) => ({
    ...row,
    issuedAt: row.issuedAt.toISOString(),
  }))
}
