import 'server-only'

/**
 * Passport health-summary counts — cheap aggregate queries (never fetch full
 * records just to count them). Person-scoped via app.person_id.
 */
import type { Prisma } from '@prisma/client'
import { withPersonDb } from '@/lib/passport/person-db'
import type { HealthRecordsSummary } from './types'

export async function countHealthRecords(
  tx: Prisma.TransactionClient,
  personId: string
): Promise<HealthRecordsSummary> {
  const [activeMedications, totalMedications, allergies, documents] = await Promise.all([
    tx.personMedication.count({ where: { personId, deletedAt: null, status: 'ACTIVE' } }),
    tx.personMedication.count({ where: { personId, deletedAt: null } }),
    tx.personAllergy.count({ where: { personId, deletedAt: null } }),
    tx.personDocument.count({ where: { personId, deletedAt: null } }),
  ])
  return { activeMedications, totalMedications, allergies, documents }
}

export async function getHealthRecordsSummary(personId: string): Promise<HealthRecordsSummary> {
  return withPersonDb(personId, (tx) => countHealthRecords(tx, personId))
}

/** Plan alias — same person-scoped counts. */
export const getHealthSummaryCounts = getHealthRecordsSummary
