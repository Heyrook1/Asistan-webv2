import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

/**
 * Open a transaction with Postgres GUC `app.business_id` set (SET LOCAL via set_config).
 *
 * When `DATABASE_URL` uses the `asistan_app` role (NOBYPASSRLS) and Dilim-C policies
 * are applied, queries are filtered to this businessId at the DB layer.
 * With a privileged/owner role the GUC is set but RLS is not evaluated — app
 * tenant-guard remains the primary door until ops switches the role.
 */
export async function withTenantDb<T>(
  businessId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return tenantTransaction(businessId, fn)
}

/**
 * Preferred wrapper for all clinic-scoped Prisma interactive transactions.
 * Always sets `app.business_id` before business logic runs.
 */
export async function tenantTransaction<T>(
  businessId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const id = businessId.trim()
  if (!id) {
    throw new Error('[tenantTransaction] businessId is required')
  }

  return prisma.$transaction(async (tx) => {
    await setTenantBusinessId(tx, id)
    return fn(tx)
  })
}

/** Set (or clear) tenant GUC on an existing interactive transaction. */
export async function setTenantBusinessId(
  tx: Prisma.TransactionClient,
  businessId: string,
): Promise<void> {
  const id = businessId.trim()
  if (!id) {
    throw new Error('[setTenantBusinessId] businessId is required')
  }
  await tx.$executeRaw`SELECT set_config('app.business_id', ${id}, true)`
}

/** Clear tenant GUC (e.g. before identity/platform work inside a longer tx). */
export async function clearTenantBusinessId(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.business_id', '', true)`
}
