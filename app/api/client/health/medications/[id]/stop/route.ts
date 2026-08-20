/**
 * POST /api/client/health/medications/[id]/stop — mark a medication as stopped
 * (status → ENDED, optional stoppedAt). Moves it to "Previous medications".
 */
import { type NextRequest } from 'next/server'
import { apiError, apiSuccess, apiValidationError, noStore, parsePathId } from '@/lib/api-response'
import { MedicationStopSchema, stopMedication } from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'medications:stop', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  const body = await request.json().catch(() => ({}))
  const parsed = MedicationStopSchema.safeParse(body ?? {})
  if (!parsed.success) return noStore(apiValidationError('Geçersiz istek', parsed.error.issues))

  try {
    return noStore(apiSuccess(await stopMedication(guard.personId!, id, parsed.data.stoppedAt)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
