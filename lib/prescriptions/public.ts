import 'server-only'

import { PrescriptionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPrescriptionShareToken, maskIdentityNumber } from '@/lib/prescriptions/share-token'

export type SharedPrescriptionLine = {
  id: string
  drugName: string
  dosage: string | null
  frequency: string | null
  durationDays: number | null
  quantity: number | null
  form: string | null
  instructions: string | null
}

export type SharedPrescriptionView = {
  protocolNo: string
  issuedAt: string
  validUntil: string | null
  expired: boolean
  diagnosis: string
  notes: string | null
  allergyWarning: string | null
  patientFullName: string
  patientIdentityMasked: string | null
  patientBirthDate: string | null
  patientGender: string | null
  doctorTitle: string | null
  doctorFullName: string
  doctorSpecialty: string | null
  doctorMedicalLicenseNo: string | null
  doctorDiplomaNo: string | null
  clinicName: string
  clinicAddress: string | null
  clinicCity: string | null
  clinicPhone: string | null
  lines: SharedPrescriptionLine[]
}

type SharedPrescriptionResult =
  | { ok: true; prescription: SharedPrescriptionView }
  | { ok: false; error: 'not_found' | 'cancelled' }

export async function getSharedPrescription(token: string): Promise<SharedPrescriptionResult> {
  const cleaned = token?.trim()
  if (!cleaned) return { ok: false, error: 'not_found' }

  const tokenHash = hashPrescriptionShareToken(cleaned)
  const prescription = await prisma.prescription.findFirst({
    where: { shareTokenHash: tokenHash },
    include: { lines: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!prescription) return { ok: false, error: 'not_found' }
  if (prescription.status === PrescriptionStatus.CANCELLED) return { ok: false, error: 'cancelled' }

  const expired = prescription.validUntil ? prescription.validUntil.getTime() < Date.now() : false

  return {
    ok: true,
    prescription: {
      protocolNo: prescription.protocolNo,
      issuedAt: prescription.issuedAt.toISOString(),
      validUntil: prescription.validUntil?.toISOString() ?? null,
      expired,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      allergyWarning: prescription.allergyWarning,
      patientFullName: prescription.patientFullName,
      patientIdentityMasked: maskIdentityNumber(prescription.patientIdentityNumber),
      patientBirthDate: prescription.patientBirthDate?.toISOString() ?? null,
      patientGender: prescription.patientGender,
      doctorTitle: prescription.doctorTitle,
      doctorFullName: prescription.doctorFullName,
      doctorSpecialty: prescription.doctorSpecialty,
      doctorMedicalLicenseNo: prescription.doctorMedicalLicenseNo,
      doctorDiplomaNo: prescription.doctorDiplomaNo,
      clinicName: prescription.clinicName,
      clinicAddress: prescription.clinicAddress,
      clinicCity: prescription.clinicCity,
      clinicPhone: prescription.clinicPhone,
      lines: prescription.lines.map((line) => ({
        id: line.id,
        drugName: line.drugName,
        dosage: line.dosage,
        frequency: line.frequency,
        durationDays: line.durationDays,
        quantity: line.quantity,
        form: line.form,
        instructions: line.instructions,
      })),
    },
  }
}
