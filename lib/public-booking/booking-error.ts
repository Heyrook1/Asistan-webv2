import { Prisma } from '@prisma/client'

import { IdentityPepperMissingError } from '@/lib/identity/resolve'
import { SlotConflictError } from '@/lib/booking/create-slot-appointment'

export type BookingFailureReason =
  | 'IDENTITY_PEPPER'
  | 'SLOT_TAKEN'
  | 'RLS_OR_ROLE'
  | 'UNIQUE_CONFLICT'
  | 'SERIALIZATION'
  | 'NOT_FOUND'
  | 'PATIENT_NUMBER'
  | 'UNKNOWN'

export function classifyBookingError(error: unknown): {
  reason: BookingFailureReason
  userMessage: string
  /** Safe for logs / API `reason` — never includes PHI. */
  logMessage: string
} {
  if (error instanceof IdentityPepperMissingError) {
    return {
      reason: 'IDENTITY_PEPPER',
      userMessage:
        'Sunucu kimlik yapılandırması eksik (PERSON_IDENTITY_PEPPER). Yöneticiye bildirin.',
      logMessage: error.message,
    }
  }
  if (error instanceof SlotConflictError) {
    return {
      reason: 'SLOT_TAKEN',
      userMessage: error.message,
      logMessage: error.message,
    }
  }

  const message = error instanceof Error ? error.message : String(error)
  const prismaCode =
    error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined

  if (
    /row-level security|42501|permission denied to set role|asistan_identity/i.test(message)
  ) {
    return {
      reason: 'RLS_OR_ROLE',
      userMessage:
        'Randevu kimlik kaydı şu an yapılamıyor (veritabanı rol/RLS). Yöneticiye bildirin.',
      logMessage: message.slice(0, 240),
    }
  }

  if (prismaCode === 'P2002' || /unique constraint/i.test(message)) {
    return {
      reason: 'UNIQUE_CONFLICT',
      userMessage: 'Randevu oluşturulurken bir çakışma oldu. Lütfen tekrar deneyin.',
      logMessage: `P2002 ${message.slice(0, 160)}`,
    }
  }

  if (prismaCode === 'P2034') {
    return {
      reason: 'SERIALIZATION',
      userMessage: 'Randevu oluşturulurken geçici bir çakışma oldu. Lütfen tekrar deneyin.',
      logMessage: 'P2034',
    }
  }

  if (/Klinik, doktor veya hizmet|şube bulunamadı/i.test(message)) {
    return {
      reason: 'NOT_FOUND',
      userMessage: message,
      logMessage: message,
    }
  }

  if (/Hasta numarası/i.test(message)) {
    return {
      reason: 'PATIENT_NUMBER',
      userMessage: 'Hasta kaydı oluşturulamadı. Lütfen tekrar deneyin.',
      logMessage: message,
    }
  }

  return {
    reason: 'UNKNOWN',
    userMessage: 'Randevu oluşturulamadı. Lütfen tekrar deneyin.',
    logMessage: message.slice(0, 240),
  }
}
