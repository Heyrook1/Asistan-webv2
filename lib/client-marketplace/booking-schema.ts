import { z } from 'zod'

import {
  isValidIdentityDocument,
  normalizeIdentityDocument,
  type IdentityDocumentType,
} from '@/lib/identity/identity-document'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

/** Prisma String ids — hyphenated UUID or legacy 32-char hex. */
const idSchema = z.string().trim().min(1).max(64)

const identityDocumentTypeSchema = z.enum(['KKTC', 'TC', 'PASSPORT'])

export const createClientBookingSchema = z
  .object({
    businessId: idSchema,
    doctorId: idSchema,
    serviceId: idSchema,
    locationId: idSchema.optional().nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(timeRegex),
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(40),
    /** KKTC | TC | PASSPORT — tourists use PASSPORT on this island. */
    identityDocumentType: identityDocumentTypeSchema.default('KKTC'),
    /** Required — hashed into Person.identityHash (never log raw). */
    identityNumber: z.string().trim().min(5).max(40),
    /** ISO-ish nationality for passport bookings (e.g. GB, DE, RU). */
    nationality: z
      .string()
      .trim()
      .max(80)
      .optional()
      .nullable()
      .transform((v) => (v && v.length > 0 ? v.toUpperCase() : null)),
    email: z.string().trim().email().optional().nullable(),
    note: z.string().trim().max(2000).optional().nullable(),
    address: z.string().trim().max(300).optional().nullable(),
    city: z.string().trim().max(120).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const docType = data.identityDocumentType as IdentityDocumentType
    if (!isValidIdentityDocument(data.identityNumber, docType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identityNumber'],
        message:
          docType === 'PASSPORT'
            ? 'Geçerli pasaport numarası girin (6–20 karakter)'
            : docType === 'TC'
              ? 'Geçerli TC kimlik numarası girin (11 hane)'
              : 'Geçerli KKTC kimlik numarası girin (10 hane)',
      })
    }
    if (docType === 'PASSPORT' && data.nationality && data.nationality.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nationality'],
        message: 'Ülke kodu en az 2 karakter olmalı (örn. GB, DE)',
      })
    }
  })
  .transform((data) => {
    const docType = data.identityDocumentType as IdentityDocumentType
    const identityNumber = normalizeIdentityDocument(data.identityNumber, docType)!
    return { ...data, identityDocumentType: docType, identityNumber }
  })

export type CreateClientBookingInput = z.infer<typeof createClientBookingSchema>
