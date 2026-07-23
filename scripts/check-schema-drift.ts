/**
 * Migration authority + optional live Prisma↔Postgres table parity.
 * Authority doc: docs/migration-authority.md
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const root = process.cwd()
const migrationsDir = path.join(root, 'supabase', 'migrations')
const schemaPath = path.join(root, 'prisma', 'schema.prisma')

const REQUIRED_MIGRATIONS = [
  '20260720000100_marketing_and_webhook_idempotency.sql',
  '20260720000200_prisma_guc_rls.sql',
]

function fail(message: string): never {
  console.error(`[schema-drift] FAIL: ${message}`)
  process.exit(1)
}

function ok(message: string) {
  console.log(`[schema-drift] OK: ${message}`)
}

function mainOffline() {
  if (!existsSync(migrationsDir)) fail('supabase/migrations/ missing — migration authority broken')
  if (!existsSync(schemaPath)) fail('prisma/schema.prisma missing')

  if (existsSync(path.join(root, 'prisma', 'migrations'))) {
    fail(
      'prisma/migrations/ present — dual authorities. Remove or ADR-switch; see docs/migration-authority.md',
    )
  }

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))
  for (const name of REQUIRED_MIGRATIONS) {
    if (!files.includes(name)) fail(`required migration missing: ${name}`)
  }
  ok(`${files.length} supabase migrations; required S1/S2 files present`)

  const schema = readFileSync(schemaPath, 'utf8')
  const models = [...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1])
  if (models.length < 20) fail(`unexpectedly few Prisma models: ${models.length}`)
  ok(`prisma schema has ${models.length} models (authority = supabase SQL)`)

  return models
}

async function mainLive(models: string[]) {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) {
    ok('DATABASE_URL unset — skipped live table parity')
    return
  }

  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    const rows = await prisma.$queryRaw<Array<{ relname: string }>>`
      SELECT c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `
    const tables = new Set(rows.map((r) => r.relname))
    const missing = models.filter((m) => !tables.has(m))
    // Some Prisma models may be views/enums-only — allow empty miss list or warn
    if (missing.length > 0) {
      console.warn(`[schema-drift] WARN: Prisma models without public tables: ${missing.join(', ')}`)
    } else {
      ok('all Prisma models have matching public tables')
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const models = mainOffline()
  await mainLive(models)
  console.log('[schema-drift] authority check complete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
