/**
 * GET    /api/client/health/allergies/[id] — detail
 * PATCH  /api/client/health/allergies/[id] — edit patient-entered allergy
 * DELETE /api/client/health/allergies/[id] — soft-delete patient-entered allergy
 */
import { type NextRequest } from 'next/server'
import { apiError, apiSuccess, apiValidationError, noStore, parsePathId } from '@/lib/api-response'
import {
  AllergyUpdateSchema,
  deleteAllergy,
  getAllergy,
  updateAllergy,
} from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'allergies:get', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    return noStore(apiSuccess(await getAllergy(guard.personId!, id)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'allergies:update', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  const body = await request.json().catch(() => null)
  const parsed = AllergyUpdateSchema.safeParse(body)
  if (!parsed.success) return noStore(apiValidationError('Geçersiz alerji bilgisi', parsed.error.issues))

  try {
    return noStore(apiSuccess(await updateAllergy(guard.personId!, id, parsed.data)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'allergies:delete', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    await deleteAllergy(guard.personId!, id)
    return noStore(apiSuccess({ deleted: true }))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
