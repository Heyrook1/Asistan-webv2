import 'server-only'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { tenantTransaction } from '@/lib/security/tenant-db-context'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export type PrescriptionPrintLine = {
  id: string
  drugName: string
  dosage: string | null
  frequency: string | null
  durationDays: number | null
  quantity: number | null
  form: string | null
  instructions: string | null
}

export type PrescriptionPrintView = {
  id: string
  businessId: string
  patientId: string
  protocolNo: string
  diagnosis: string
  notes: string | null
  allergyWarning: string | null
  issuedAt: Date
  validUntil: Date | null
  patientFullName: string
  patientIdentityNumber: string | null
  patientBirthDate: Date | null
  patientGender: string | null
  patientPhone: string | null
  patientAddress: string | null
  patientCity: string | null
  doctorTitle: string | null
  doctorFullName: string
  doctorSpecialty: string | null
  doctorKktcIdentityNo: string | null
  doctorMedicalLicenseNo: string | null
  doctorDiplomaNo: string | null
  clinicName: string
  clinicAddress: string | null
  clinicCity: string | null
  clinicPhone: string | null
  lines: PrescriptionPrintLine[]
}

const PRINT_SELECT = {
  id: true,
  businessId: true,
  patientId: true,
  protocolNo: true,
  diagnosis: true,
  notes: true,
  allergyWarning: true,
  issuedAt: true,
  validUntil: true,
  patientFullName: true,
  patientIdentityNumber: true,
  patientBirthDate: true,
  patientGender: true,
  patientPhone: true,
  patientAddress: true,
  patientCity: true,
  doctorTitle: true,
  doctorFullName: true,
  doctorSpecialty: true,
  doctorKktcIdentityNo: true,
  doctorMedicalLicenseNo: true,
  doctorDiplomaNo: true,
  clinicName: true,
  clinicAddress: true,
  clinicCity: true,
  clinicPhone: true,
  lines: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true,
      drugName: true,
      dosage: true,
      frequency: true,
      durationDays: true,
      quantity: true,
      form: true,
      instructions: true,
    },
  },
} satisfies Prisma.PrescriptionSelect

/**
 * Tenant-scoped prescription for clinic print view.
 * Explicit select avoids P2022 when additive columns (e.g. shareTokenHash) are not migrated —
 * list views used a narrow select and worked; full `include` crashed the print route.
 * Missing / cross-tenant rows → null (caller should 404).
 */
export async function getPrescriptionForPrint(
  businessId: string,
  patientId: string,
  prescriptionId: string,
): Promise<PrescriptionPrintView | null> {
  try {
    return await tenantTransaction(businessId, async (tx) => {
      return tx.prescription.findFirst({
        where: { id: prescriptionId, businessId, patientId },
        select: PRINT_SELECT,
      })
    })
  } catch (error) {
    console.error('[getPrescriptionForPrint] tenant read failed, trying direct', {
      code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
    })
    return prisma.prescription.findFirst({
      where: { id: prescriptionId, businessId, patientId },
      select: PRINT_SELECT,
    })
  }
}

/** Public verify path after HMAC token check. */
export async function getPrescriptionByIdForVerify(prescriptionId: string, businessId: string) {
  return runWithTenantBypassAsync('prescription-public-verify', async () => {
    return prisma.prescription.findFirst({
      where: { id: prescriptionId, businessId },
      select: PRINT_SELECT,
    })
  })
}
