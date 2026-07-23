import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

/** Prisma String ids — hyphenated UUID or legacy 32-char hex. */
const idSchema = z.string().trim().min(1).max(64)

export const createClientBookingSchema = z.object({
  businessId: idSchema,
  doctorId: idSchema,
  serviceId: idSchema,
  locationId: idSchema.optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(timeRegex),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().optional().nullable(),
  note: z.string().trim().max(2000).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
})

export type CreateClientBookingInput = z.infer<typeof createClientBookingSchema>
