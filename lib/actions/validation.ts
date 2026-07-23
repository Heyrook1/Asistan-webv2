/**
 * Shared Zod primitives for server actions — validate before auth/DB.
 */
import { z } from 'zod'

import { err, type ActionResult } from '@/lib/actions/result'

/** Primary-key style ids passed from the client. */
export const entityIdSchema = z.string().uuid('Geçersiz kimlik')

/** Short free-text search (patient picker, command palette). */
export const patientSearchQuerySchema = z.string().trim().min(1).max(120)

/** Command palette — empty/1-char returns no hits client-side; cap length server-side. */
export const paletteSearchQuerySchema = z.string().trim().max(120)

/** Registration email availability probe. */
export const emailInputSchema = z.string().trim().email('E-posta adresinde @ işareti olmalı').max(254)

export function parseActionInput<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
  message = 'Form bilgileri eksik veya hatalı'
): { ok: true; data: z.infer<T> } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, result: err(message, parsed.error.issues) }
  }
  return { ok: true, data: parsed.data }
}

/** Validate a bare uuid argument before tenant-scoped queries. */
export function parseEntityId(
  id: unknown,
  message = 'Geçersiz kimlik'
): { ok: true; id: string } | { ok: false; result: ActionResult<never> } {
  const parsed = entityIdSchema.safeParse(id)
  if (!parsed.success) {
    return { ok: false, result: err(message, parsed.error.issues) }
  }
  return { ok: true, id: parsed.data }
}
