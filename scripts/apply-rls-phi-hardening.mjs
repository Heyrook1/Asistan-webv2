/**
 * Apply RLS PHI business-scope hardening migration (subset of full stack).
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
  '20260717000100_rls_phi_business_scope_hardening.sql'
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

  const policies = await client.query(`
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('Waitlist', 'Review', 'Appointment', 'ClientNotification')
      and policyname in (
        'waitlist_deny_authenticated',
        'review_member_select',
        'appointment_client_select',
        'client_notification_business_select'
      )
  `)

  const found = new Set(policies.rows.map((r) => r.policyname))
  const required = [
    'waitlist_deny_authenticated',
    'review_member_select',
    'appointment_client_select',
    'client_notification_business_select',
  ]
  const missing = required.filter((p) => !found.has(p))
  if (missing.length) {
    throw new Error(`Expected policies missing after migration: ${missing.join(', ')}`)
  }

  console.log('RLS PHI hardening applied successfully.')
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
