/**
 * Apply legacy snake_case schema drop migration (after audit passes).
 * Usage: node scripts/apply-drop-legacy-schema.mjs
 */
import fs from 'fs'
import path from 'path'
import pg from 'pg'
import dotenv from 'dotenv'
import { spawnSync } from 'node:child_process'

dotenv.config({ path: '.env.local' })
dotenv.config()

const migrationPath = path.join(
  'supabase',
  'migrations',
  '20260716000200_drop_legacy_snake_schema.sql'
)

const audit = spawnSync(process.execPath, ['scripts/audit-legacy-public-schema.mjs', '--require-empty'], {
  stdio: 'inherit',
  cwd: process.cwd(),
})

if (audit.status !== 0) {
  process.exit(audit.status ?? 1)
}

const sql = fs.readFileSync(migrationPath, 'utf8')

const rawConnectionString =
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!rawConnectionString) {
  throw new Error('No database connection string found (DIRECT_URL / DATABASE_URL)')
}

const url = new URL(rawConnectionString)
url.searchParams.set('uselibpqcompat', 'true')

const client = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
})

const LEGACY_TABLES = [
  'users',
  'providers',
  'customers',
  'appointments',
  'services',
  'notifications',
  'reviews',
  'team_members',
  'activity_logs',
]

async function run() {
  console.log('Connecting to database (direct/non-pooling preferred)...')
  await client.connect()
  console.log(`Applying ${migrationPath}...`)
  await client.query(sql)

  const check = await client.query(
    `
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any($1::text[])
      and c.relkind = 'r'
    order by c.relname
    `,
    [LEGACY_TABLES]
  )

  if (check.rows.length) {
    throw new Error(
      `Legacy tables still present after migration: ${check.rows.map((r) => r.table_name).join(', ')}`
    )
  }

  console.log('Legacy public.* tables removed successfully.')
  await client.end()
}

run().catch(async (error) => {
  console.error('Migration failed:', error.message)
  try {
    await client.end()
  } catch {
    // ignore
  }
  process.exit(1)
})
