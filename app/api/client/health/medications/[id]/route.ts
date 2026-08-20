/**
 * GET    /api/client/health/medications/[id] — detail
 * PATCH  /api/client/health/medications/[id] — edit patient-entered medication
 * DELETE /api/client/health/medications/[id] — soft-delete patient-entered medication
 */
import { type NextRequest } from 'next/server'
import { apiError, apiSuccess, apiValidationError, noStore, parsePathId } from '@/lib/api-response'
import {
  MedicationUpdateSchema,
  deleteMedication,
  getMedication,
  updateMedication,
} from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'medications:get', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    return noStore(apiSuccess(await getMedication(guard.personId!, id)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'medications:update', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  const body = await request.json().catch(() => null)
  const parsed = MedicationUpdateSchema.safeParse(body)
  if (!parsed.success) return noStore(apiValidationError('Geçersiz ilaç bilgisi', parsed.error.issues))

  try {
    return noStore(apiSuccess(await updateMedication(guard.personId!, id, parsed.data)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'medications:delete', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    await deleteMedication(guard.personId!, id)
    return noStore(apiSuccess({ deleted: true }))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
