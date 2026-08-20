import 'server-only'

/**
 * Klinik işlemleri için Postgres GUC `app.business_id` (SET LOCAL / set_config).
 *
 * `asistan_app` (NOBYPASSRLS) + Dilim-C politikaları açıksa sorgular DB’de
 * bu businessId ile süzülür. Owner/privileged rolde GUC yazılır ama RLS
 * değerlendirilmez — o durumda asıl kapı `tenant-guard` kalır.
 */

import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

/**
 * Transaction açar ve `app.business_id` GUC’unu set eder (SET LOCAL).
 */
export async function withTenantDb<T>(
  businessId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return tenantTransaction(businessId, fn)
}

/**
 * Klinik kapsamlı etkileşimli Prisma transaction tercihi.
 * İş mantığından önce her zaman `app.business_id` yazar.
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

/** Açık bir interactive transaction üzerinde kiracı GUC yazar. */
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

/** Kiracı GUC temizler (aynı tx içinde platform/identity işi öncesi). */
export async function clearTenantBusinessId(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.business_id', '', true)`
}
