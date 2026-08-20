/**
 * GET /api/client/health/summary — Passport health-record counts (cheap aggregates).
 */
import { type NextRequest } from 'next/server'
import { apiSuccess, noStore } from '@/lib/api-response'
import { getHealthRecordsSummary } from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

const EMPTY = { activeMedications: 0, totalMedications: 0, allergies: 0, documents: 0 }

export async function GET(request: NextRequest) {
  const guard = await guardHealthRoute(request, { action: 'summary' })
  if (!guard.ok) return guard.response
  if (!guard.personId) return noStore(apiSuccess(EMPTY))

  try {
    const summary = await getHealthRecordsSummary(guard.personId)
    return noStore(apiSuccess(summary))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
