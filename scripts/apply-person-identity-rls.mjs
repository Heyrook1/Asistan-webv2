/**
 * Apply Person / GPI deny-default RLS migration (subset of full stack).
 * Prefer: pnpm db:rls:apply  or  pnpm db:deploy
 */
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import { createPgClient, resolveDatabaseUrl } from './lib/rls-stack.mjs'

dotenv.config({ path: '.env.local' })
dotenv.config()

const migrationPath = path.join(
  'supabase',
  'migrations',
  '20260716000100_person_identity_rls.sql'
)

const sql = fs.readFileSync(migrationPath, 'utf8')

const connectionString = resolveDatabaseUrl()
if (!connectionString) {
  throw new Error('No database connection string found (DIRECT_URL / DATABASE_URL)')
}

const client = createPgClient(connectionString)

async function run() {
  console.log('Connecting to database (direct/non-pooling preferred)...')
  await client.connect()
  console.log(`Applying ${migrationPath}...`)
  await client.query(sql)

  const check = await client.query(`
    select c.relname as table_name, c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('Person', 'PersonIdentityMatch', 'BookingIdempotency')
      and c.relkind = 'r'
    order by c.relname
  `)

  console.log('RLS status after migration:')
  for (const row of check.rows) {
    console.log(`  ${row.table_name}: rls_enabled=${row.rls_enabled}`)
  }

  const missing = check.rows.filter((row) => !row.rls_enabled)
  if (missing.length) {
    throw new Error(`RLS not enabled on: ${missing.map((r) => r.table_name).join(', ')}`)
  }

  console.log('Migration applied successfully.')
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
