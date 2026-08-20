import { z } from 'zod'

export const tourismLeadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(40),
  email: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().email().max(160).optional()
  ),
  preferredLang: z.enum(['tr', 'en', 'ru']),
  procedureInterest: z.string().trim().min(2).max(200),
  travelDates: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().max(120).optional()
  ),
  clinicSlug: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug')
      .max(80)
      .optional()
  ),
  notes: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().max(1000).optional()
  ),
})

export type TourismLeadInput = z.infer<typeof tourismLeadSchema>
