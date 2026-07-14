import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const createClientBookingSchema = z.object({
  businessId: z.string().uuid(),
  doctorId: z.string().uuid(),
  serviceId: z.string().uuid(),
  locationId: z.string().uuid().optional().nullable(),
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
