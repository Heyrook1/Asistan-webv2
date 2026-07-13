'use server'

import { revalidatePath } from 'next/cache'
import { PrescriptionStatus, TimelineEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requirePermission, requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { buildPrescriptionDraft } from '@/lib/prescriptions/build-draft'
import {
  createPrescriptionInput,
  doctorPrescriptionProfileInput,
} from '@/lib/prescriptions/schema'

async function nextProtocolNo(businessId: string) {
  const year = new Date().getFullYear()
  const count = await prisma.prescription.count({
    where: {
      businessId,
      issuedAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
  })
  return `RX-${year}-${String(count + 1).padStart(5, '0')}`
}

export async function getPrescriptionDraft(patientId: string) {
  const session = await requirePermission('patient.view')
  const draft = await buildPrescriptionDraft({
    businessId: session.businessId,
    patientId,
    preferredDoctorId: null,
    sessionStaffMemberId: session.staffMemberId,
  })
  if (!draft) return err('Hasta bulunamadi')
  return ok(draft)
}

export async function createPrescription(rawInput: unknown): Promise<ActionResult<{ id: string; protocolNo: string }>> {
  const parsed = createPrescriptionInput.safeParse(rawInput)
  if (!parsed.success) return err('Form hatali', parsed.error.issues)

  const session = await requirePermission('patient.edit')
  const data = parsed.data

  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, businessId: session.businessId },
    include: { allergies: { select: { name: true } } },
  })
  if (!patient) return err('Hasta bulunamadi')

  const doctor = await prisma.teamMember.findFirst({
    where: { id: data.doctorId, businessId: session.businessId, isActive: true, role: 'DOKTOR' },
  })
  if (!doctor) return err('Doktor bulunamadi')

  if (!data.patientIdentityNumber) {
    return err('E-recete icin hasta KKTC kimlik numarasi zorunludur')
  }

  const protocolNo = await nextProtocolNo(session.businessId)
  const allergyWarning =
    patient.allergies.length > 0 ? patient.allergies.map((item) => item.name).join(', ') : null

  const created = await prisma.$transaction(async (tx) => {
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

    await tx.patient.update({
      where: { id: data.patientId },
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
        title: 'E-recete olusturuldu',
        description: `${protocolNo} • ${data.diagnosis}`,
        actorName: session.fullName,
        actorId: session.userId,
      },
    })

    return prescription
  })

  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok(created)
}

export async function updateDoctorPrescriptionProfile(rawInput: unknown): Promise<ActionResult> {
  const parsed = doctorPrescriptionProfileInput.safeParse(rawInput)
  if (!parsed.success) return err('Form hatali', parsed.error.issues)

  const session = await requireSession()
  const targetId = parsed.data.teamMemberId ?? session.staffMemberId
  if (!targetId) return err('Doktor profili bulunamadi')

  const member = await prisma.teamMember.findFirst({
    where: { id: targetId, businessId: session.businessId },
  })
  if (!member) return err('Ekip uyesi bulunamadi')

  const isSelf = member.id === session.staffMemberId
  if (!isSelf && !session.permissions.includes('team.manage')) {
    return err('Baska doktorun recete profilini duzenleme yetkiniz yok')
  }

  await prisma.teamMember.update({
    where: { id: member.id },
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
  const session = await requirePermission('patient.view')
  const rows = await prisma.prescription.findMany({
    where: { businessId: session.businessId, patientId },
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
