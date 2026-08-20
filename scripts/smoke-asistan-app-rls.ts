#!/usr/bin/env tsx
/**
 * Staging smoke for S2 Dilim-C: asistan_app role + GUC RLS.
 *
 * Usage:
 *   pnpm smoke:asistan-app-rls
 *
 * Owner-side checks run via DATABASE_URL_MIGRATE / DIRECT_URL (after the role
 * switch, runtime DATABASE_URL is asistan_app and cannot see catalog samples).
 *
 * Checks:
 *  1) Role asistan_app / asistan_identity exist and NOBYPASSRLS
 *  2) FORCE RLS on Appointment
 *  3) GUC policy present for asistan_app
 *  4) Live probes via ASISTAN_APP_DATABASE_URL (no GUC / correct / wrong tenant)
 */
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

// Owner connection for catalog + sample queries; falls back to DATABASE_URL.
const ownerUrl =
  process.env.DATABASE_URL_MIGRATE?.trim() ||
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim()

const prisma = new PrismaClient(
  ownerUrl ? { datasources: { db: { url: ownerUrl } } } : undefined,
)

async function main() {
  const checks: Array<{ name: string; pass: boolean; detail?: string }> = []

  const roles = await prisma.$queryRaw<Array<{ rolname: string; rolbypassrls: boolean }>>`
    SELECT rolname, rolbypassrls
    FROM pg_roles
    WHERE rolname IN ('asistan_app', 'asistan_identity')
  `
  const byName = new Map(roles.map((r) => [r.rolname, r]))

  for (const name of ['asistan_app', 'asistan_identity'] as const) {
    const row = byName.get(name)
    if (!row) {
      checks.push({ name: `role ${name}`, pass: false, detail: 'missing — apply 20260720000200_prisma_guc_rls.sql' })
      continue
    }
    checks.push({
      name: `role ${name} NOBYPASSRLS`,
      pass: row.rolbypassrls === false,
      detail: row.rolbypassrls ? 'BYPASSRLS still on — alter role' : 'ok',
    })
  }

  const force = await prisma.$queryRaw<Array<{ relname: string; relforcerowsecurity: boolean }>>`
    SELECT c.relname, c.relforcerowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'Appointment'
  `
  checks.push({
    name: 'Appointment FORCE RLS',
    pass: force[0]?.relforcerowsecurity === true,
    detail: force[0] ? `forcerowsecurity=${force[0].relforcerowsecurity}` : 'table missing',
  })

  const policies = await prisma.$queryRaw<Array<{ polname: string }>>`
    SELECT pol.polname::text AS polname
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'Appointment'
      AND pol.polname::text LIKE '%prisma_guc%'
  `
  checks.push({
    name: 'Appointment prisma_guc policy',
    pass: policies.length > 0,
    detail: policies.map((p) => p.polname).join(', ') || 'missing',
  })

  // Optional live probe when ASISTAN_APP_DATABASE_URL is set (asistan_app connection).
  const appUrl = process.env.ASISTAN_APP_DATABASE_URL?.trim()
  if (appUrl) {
    const app = new PrismaClient({ datasources: { db: { url: appUrl } } })
    try {
      const bare = await app.$queryRaw<Array<{ count: bigint }>>`SELECT count(*)::bigint AS count FROM "Appointment"`
      const bareCount = Number(bare[0]?.count ?? -1)
      checks.push({
        name: 'asistan_app SELECT without GUC',
        pass: bareCount === 0,
        detail: `count=${bareCount} (expect 0 when FORCE RLS + empty GUC)`,
      })

      const sample = await prisma.$queryRaw<Array<{ id: string; businessId: string }>>`
        SELECT id, "businessId" FROM "Appointment" WHERE "deletedAt" IS NULL LIMIT 1
      `
      if (sample[0]) {
        await app.$executeRaw`SELECT set_config('app.business_id', ${sample[0].businessId}, false)`
        const scoped = await app.$queryRaw<Array<{ count: bigint }>>`
          SELECT count(*)::bigint AS count FROM "Appointment" WHERE id = ${sample[0].id}
        `
        checks.push({
          name: 'asistan_app SELECT with correct GUC',
          pass: Number(scoped[0]?.count ?? 0) === 1,
          detail: `count=${scoped[0]?.count}`,
        })
        await app.$executeRaw`SELECT set_config('app.business_id', '00000000-0000-0000-0000-000000000000', false)`
        const wrong = await app.$queryRaw<Array<{ count: bigint }>>`
          SELECT count(*)::bigint AS count FROM "Appointment" WHERE id = ${sample[0].id}
        `
        checks.push({
          name: 'asistan_app SELECT with wrong GUC',
          pass: Number(wrong[0]?.count ?? -1) === 0,
          detail: `count=${wrong[0]?.count}`,
        })
      } else {
        checks.push({ name: 'asistan_app GUC probes', pass: true, detail: 'no Appointment rows to probe' })
      }
    } finally {
      await app.$disconnect()
    }
  } else {
    checks.push({
      name: 'asistan_app live probe',
      pass: true,
      detail: 'skipped — set ASISTAN_APP_DATABASE_URL to run connection smoke',
    })
  }

  let failed = 0
  for (const c of checks) {
    const mark = c.pass ? 'PASS' : 'FAIL'
    if (!c.pass) failed += 1
    console.log(`[${mark}] ${c.name}${c.detail ? ` — ${c.detail}` : ''}`)
  }

  console.log(
    failed === 0
      ? '\nS2 smoke OK. Next ops: point runtime DATABASE_URL at asistan_app; keep DATABASE_URL_MIGRATE as owner.'
      : `\n${failed} check(s) failed. Apply supabase/migrations/20260720000200_prisma_guc_rls.sql then re-run.`,
  )

  await prisma.$disconnect()
  process.exit(failed === 0 ? 0 : 1)
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
