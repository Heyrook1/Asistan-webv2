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

export type BuildClientBookingSchemaOptions = {
  /**
   * When true, KKTC / TC / passport is required.
   * Default false — data minimization (P0.6); clinics opt in via Business.requireGuestIdentity.
   */
  requireIdentity?: boolean
}

/**
 * Client + guest booking payload.
 * Identity is optional unless `requireIdentity` (clinic policy) is set.
 */
export function buildClientBookingSchema(options?: BuildClientBookingSchemaOptions) {
  const requireIdentity = options?.requireIdentity ?? false

  return z
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
      identityDocumentType: identityDocumentTypeSchema.optional().nullable().default('KKTC'),
      /**
       * Optional by default. When present, validated + hashed into Person.identityHash
       * (never log raw). Clinic Patient card does not store plaintext from guest book.
       */
      identityNumber: z
        .string()
        .trim()
        .max(40)
        .optional()
        .nullable()
        .transform((v) => (v && v.length > 0 ? v : null)),
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
      /**
       * P0.7 — Required acknowledgment of privacy notice / roles for booking
       * (service fulfilment). Must NOT be bundled with marketing.
       */
      privacyNoticeAccepted: z.boolean(),
      /**
       * Optional marketing / promo messages — separate from booking consent.
       * Default false; never inferred from privacyNoticeAccepted.
       */
      marketingOptIn: z.boolean().optional().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.privacyNoticeAccepted !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['privacyNoticeAccepted'],
          message: 'Randevu için gizlilik aydınlatmasını kabul etmelisiniz',
        })
      }

      const raw = data.identityNumber?.trim() ?? ''
      if (!raw) {
        if (requireIdentity) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identityNumber'],
            message: 'Bu klinik kimlik veya pasaport numarası ister',
          })
        }
        return
      }

      const docType = (data.identityDocumentType ?? 'KKTC') as IdentityDocumentType
      if (!isValidIdentityDocument(raw, docType)) {
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
      const docType = (data.identityDocumentType ?? 'KKTC') as IdentityDocumentType
      const raw = data.identityNumber?.trim() ?? ''
      const identityNumber = raw ? normalizeIdentityDocument(raw, docType) : null
      return {
        ...data,
        identityDocumentType: identityNumber ? docType : null,
        identityNumber,
        nationality: identityNumber && docType === 'PASSPORT' ? data.nationality : null,
        privacyNoticeAccepted: true as const,
        marketingOptIn: Boolean(data.marketingOptIn),
      }
    })
}

/** Privacy notice version stamped on guest/client booking consent metadata. */
export const BOOKING_PRIVACY_NOTICE_VERSION = '2026-08-10'

/** Default schema — identity optional (P0.6 data minimization). */
export const createClientBookingSchema = buildClientBookingSchema({ requireIdentity: false })

export type CreateClientBookingInput = z.infer<typeof createClientBookingSchema>
