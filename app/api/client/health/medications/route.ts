/**
 * GET  /api/client/health/medications — active + previous lists for the patient.
 * POST /api/client/health/medications — create a patient-entered medication.
 */
import { type NextRequest } from 'next/server'
import { apiSuccess, apiValidationError, noStore } from '@/lib/api-response'
import {
  MedicationCreateSchema,
  createMedication,
  listMedications,
} from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const guard = await guardHealthRoute(request, { action: 'medications:list' })
  if (!guard.ok) return guard.response
  if (!guard.personId) return noStore(apiSuccess({ active: [], previous: [] }))

  try {
    return noStore(apiSuccess(await listMedications(guard.personId)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardHealthRoute(request, { action: 'medications:create', requirePerson: true })
  if (!guard.ok) return guard.response

  const body = await request.json().catch(() => null)
  const parsed = MedicationCreateSchema.safeParse(body)
  if (!parsed.success) return noStore(apiValidationError('Geçersiz ilaç bilgisi', parsed.error.issues))

  try {
    const created = await createMedication(guard.personId!, guard.auth.clientUser.id, parsed.data)
    return noStore(apiSuccess(created, 201))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
