import 'server-only'

import { PrismaClient } from '@prisma/client'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'

/**
 * Privileged / owner Prisma client for session bootstrap.
 *
 * When runtime `DATABASE_URL` is `asistan_app` (NOBYPASSRLS), User/Business
 * membership resolution should use `DATABASE_URL_MIGRATE` / `DIRECT_URL` (owner).
 * auth.uid()-oriented RLS has no asistan_app INSERT on "User".
 *
 * Pair with migration `20260721000700_asistan_app_session_bootstrap.sql` so
 * asistan_app can still bootstrap if migrate URL is unset.
 */
const globalForOwner = globalThis as unknown as { prismaOwner?: PrismaClient }

function resolveOwnerUrl(): string {
  return (
    env.databaseUrlMigrate?.trim() ||
    env.directUrl?.trim() ||
    env.databaseUrl
  )
}

export function isOwnerPrismaDistinct(): boolean {
  const owner = resolveOwnerUrl()
  return Boolean(owner && owner !== env.databaseUrl)
}

function getOwnerClient(): PrismaClient {
  if (!isOwnerPrismaDistinct()) return prisma
  if (!globalForOwner.prismaOwner) {
    globalForOwner.prismaOwner = new PrismaClient({
      datasources: { db: { url: resolveOwnerUrl() } },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForOwner.prismaOwner
}

/** Client for auth→User / Business / TeamMember session bootstrap. */
export function sessionPrisma(): PrismaClient {
  return getOwnerClient()
}

/**
 * Cross-tenant public catalog ( /client search, clinic detail, availability ).
 * asistan_app GUC RLS cannot list bookable doctors without app.business_id.
 */
export function catalogPrisma(): PrismaClient {
  return getOwnerClient()
}

/**
 * Person / GPI writes when runtime DATABASE_URL is asistan_app and
 * `SET LOCAL ROLE asistan_identity` is unavailable (pooler / missing GRANT).
 * Same owner/migrate URL as catalog — bypasses Person deny_app RLS.
 */
export function identityPrisma(): PrismaClient {
  return getOwnerClient()
}

export function isIdentityPrismaDistinct(): boolean {
  return isOwnerPrismaDistinct()
}
