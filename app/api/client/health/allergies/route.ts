/**
 * GET  /api/client/health/allergies — known allergies list.
 * POST /api/client/health/allergies — create a patient-entered allergy.
 */
import { type NextRequest } from 'next/server'
import { apiSuccess, apiValidationError, noStore } from '@/lib/api-response'
import { AllergyCreateSchema, createAllergy, listAllergies } from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const guard = await guardHealthRoute(request, { action: 'allergies:list' })
  if (!guard.ok) return guard.response
  if (!guard.personId) return noStore(apiSuccess({ items: [] }))

  try {
    return noStore(apiSuccess({ items: await listAllergies(guard.personId) }))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardHealthRoute(request, { action: 'allergies:create', requirePerson: true })
  if (!guard.ok) return guard.response

  const body = await request.json().catch(() => null)
  const parsed = AllergyCreateSchema.safeParse(body)
  if (!parsed.success) return noStore(apiValidationError('Geçersiz alerji bilgisi', parsed.error.issues))

  try {
    const created = await createAllergy(guard.personId!, guard.auth.clientUser.id, parsed.data)
    return noStore(apiSuccess(created, 201))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
