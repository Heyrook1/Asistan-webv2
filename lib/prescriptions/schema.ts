import 'server-only'

import { z } from 'zod'

const kktcIdentityRegex = /^[0-9A-Za-z]{6,20}$/

export const prescriptionLineInput = z.object({
  drugName: z.string().trim().min(1).max(200),
  dosage: z.string().trim().max(120).optional(),
  frequency: z.string().trim().max(120).optional(),
  durationDays: z.coerce.number().int().min(1).max(365).optional(),
  quantity: z.coerce.number().int().min(1).max(999).optional(),
  form: z.string().trim().max(80).optional(),
  instructions: z.string().trim().max(500).optional(),
})

export const createPrescriptionInput = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  diagnosis: z.string().trim().min(2).max(500),
  notes: z.string().trim().max(2000).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  patientFullName: z.string().trim().min(2).max(120),
  patientIdentityNumber: z
    .string()
    .trim()
    .regex(kktcIdentityRegex, 'Gecerli bir KKTC kimlik numarasi girin')
    .optional(),
  patientBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  patientGender: z.string().trim().max(40).optional(),
  patientPhone: z.string().trim().min(7).max(40),
  patientAddress: z.string().trim().max(300).optional(),
  patientCity: z.string().trim().max(120).optional(),
  doctorTitle: z.string().trim().max(20).optional(),
  doctorFullName: z.string().trim().min(2).max(120),
  doctorSpecialty: z.string().trim().max(120).optional(),
  doctorKktcIdentityNo: z
    .string()
    .trim()
    .regex(kktcIdentityRegex, 'Gecerli bir KKTC kimlik numarasi girin')
    .optional(),
  doctorMedicalLicenseNo: z.string().trim().max(80).optional(),
  doctorDiplomaNo: z.string().trim().max(80).optional(),
  doctorPhone: z.string().trim().max(40).optional(),
  clinicName: z.string().trim().min(2).max(200),
  clinicAddress: z.string().trim().max(300).optional(),
  clinicCity: z.string().trim().max(120).optional(),
  clinicPhone: z.string().trim().max(40).optional(),
  lines: z.array(prescriptionLineInput).min(1).max(20),
})

export const doctorPrescriptionProfileInput = z.object({
  teamMemberId: z.string().uuid().optional(),
  prescriptionTitle: z.string().trim().max(20).optional(),
  specialty: z.string().trim().max(120).optional(),
  kktcIdentityNo: z
    .string()
    .trim()
    .regex(kktcIdentityRegex, 'Gecerli bir KKTC kimlik numarasi girin')
    .optional()
    .or(z.literal('')),
  medicalLicenseNo: z.string().trim().max(80).optional(),
  diplomaNo: z.string().trim().max(80).optional(),
})

export type PrescriptionLineInput = z.infer<typeof prescriptionLineInput>
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionInput>
