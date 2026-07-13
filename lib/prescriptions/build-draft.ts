import 'server-only'

import { prisma } from '@/lib/prisma'
import type { PrescriptionLineInput } from '@/lib/prescriptions/schema'

export type PrescriptionDraft = {
  patientId: string
  doctorId: string | null
  diagnosis: string
  notes: string
  validUntil: string
  allergyWarning: string
  patient: {
    fullName: string
    identityNumber: string
    birthDate: string
    gender: string
    phone: string
    address: string
    city: string
  }
  doctor: {
    id: string
    title: string
    fullName: string
    specialty: string
    kktcIdentityNo: string
    medicalLicenseNo: string
    diplomaNo: string
    phone: string
  } | null
  clinic: {
    name: string
    address: string
    city: string
    phone: string
  }
  lines: PrescriptionLineInput[]
  missingFields: string[]
}

function isoDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : ''
}

function defaultValidUntil(days = 15) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function medicationToLine(input: {
  name: string
  dosage: string | null
  frequency: string | null
  notes: string | null
}): PrescriptionLineInput {
  return {
    drugName: input.name,
    dosage: input.dosage ?? undefined,
    frequency: input.frequency ?? undefined,
    instructions: input.notes ?? undefined,
  }
}

export async function buildPrescriptionDraft(input: {
  businessId: string
  patientId: string
  preferredDoctorId?: string | null
  sessionStaffMemberId?: string | null
}): Promise<PrescriptionDraft | null> {
  const [patient, business, doctors] = await Promise.all([
    prisma.patient.findFirst({
      where: { id: input.patientId, businessId: input.businessId },
      include: {
        medications: { where: { active: true }, orderBy: { createdAt: 'desc' }, take: 8 },
        allergies: { orderBy: { createdAt: 'desc' }, take: 8 },
        assignedDoctor: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            specialty: true,
            prescriptionTitle: true,
            kktcIdentityNo: true,
            medicalLicenseNo: true,
            diplomaNo: true,
            role: true,
          },
        },
      },
    }),
    prisma.business.findUnique({
      where: { id: input.businessId },
      select: { name: true, address: true, city: true, phone: true },
    }),
    prisma.teamMember.findMany({
      where: { businessId: input.businessId, isActive: true, role: 'DOKTOR' },
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        specialty: true,
        prescriptionTitle: true,
        kktcIdentityNo: true,
        medicalLicenseNo: true,
        diplomaNo: true,
        role: true,
      },
    }),
  ])

  if (!patient || !business) return null

  const doctorCandidate =
    doctors.find((doctor) => doctor.id === input.preferredDoctorId) ??
    doctors.find((doctor) => doctor.id === input.sessionStaffMemberId) ??
    patient.assignedDoctor ??
    doctors[0] ??
    null

  const lines =
    patient.medications.length > 0
      ? patient.medications.map(medicationToLine)
      : [{ drugName: '', dosage: '', frequency: '', instructions: '' }]

  const allergyWarning = patient.allergies.map((item) => item.name).join(', ')

  const draft: PrescriptionDraft = {
    patientId: patient.id,
    doctorId: doctorCandidate?.id ?? null,
    diagnosis: patient.lastDiagnosis ?? '',
    notes: patient.currentTreatment ?? '',
    validUntil: defaultValidUntil(),
    allergyWarning,
    patient: {
      fullName: patient.fullName,
      identityNumber: patient.identityNumber ?? '',
      birthDate: isoDate(patient.birthDate),
      gender: patient.gender ?? '',
      phone: patient.phone,
      address: patient.address ?? '',
      city: patient.city ?? '',
    },
    doctor: doctorCandidate
      ? {
          id: doctorCandidate.id,
          title: doctorCandidate.prescriptionTitle ?? 'Dr.',
          fullName: doctorCandidate.fullName,
          specialty: doctorCandidate.specialty ?? '',
          kktcIdentityNo: doctorCandidate.kktcIdentityNo ?? '',
          medicalLicenseNo: doctorCandidate.medicalLicenseNo ?? '',
          diplomaNo: doctorCandidate.diplomaNo ?? '',
          phone: doctorCandidate.phone ?? '',
        }
      : null,
    clinic: {
      name: business.name,
      address: business.address ?? '',
      city: business.city ?? '',
      phone: business.phone ?? '',
    },
    lines,
    missingFields: [],
  }

  if (!draft.patient.identityNumber) draft.missingFields.push('Hasta KKTC kimlik numarasi')
  if (!draft.patient.birthDate) draft.missingFields.push('Hasta dogum tarihi')
  if (!draft.doctor) draft.missingFields.push('Recete yazan doktor')
  if (draft.doctor && !draft.doctor.kktcIdentityNo) draft.missingFields.push('Doktor KKTC kimlik numarasi')
  if (draft.doctor && !draft.doctor.medicalLicenseNo) draft.missingFields.push('Doktor ruhsat/sicil numarasi')
  if (!draft.diagnosis) draft.missingFields.push('Tani')

  return draft
}
