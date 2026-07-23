import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Transaction with Postgres GUC `app.person_id` for patient passport RLS policies.
 */
export async function withPersonDb<T>(
  personId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const id = personId.trim()
  if (!id) throw new Error('[withPersonDb] personId is required')

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.person_id', ${id}, true)`
    try {
      return await fn(tx)
    } finally {
      await tx.$executeRaw`SELECT set_config('app.person_id', '', true)`
    }
  })
}
