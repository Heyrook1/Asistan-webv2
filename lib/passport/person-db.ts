import 'server-only'

/**
 * Person kapsamlı Prisma transaction — GUC `app.person_id` (SET LOCAL).
 *
 * Hasta pasaport RLS politikaları bu GUC’u okur. Klinik `app.business_id`
 * ile karıştırma; bitişte GUC temizlenir.
 */

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * `app.person_id` set ederek transaction çalıştırır; finally’de temizler.
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
