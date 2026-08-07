/**
 * Apply Faz 4 NotificationOutbox migration (additive).
 */
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createPgClient } from './lib/rls-stack.mjs'

dotenv.config({ path: '.env.local' })
dotenv.config()

const url =
  process.env.DATABASE_URL_MIGRATE?.trim() ||
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim()

if (!url) {
  throw new Error('No DATABASE_URL_MIGRATE / DIRECT_URL / DATABASE_URL')
}

const migrationPath = path.join(
  'supabase',
  'migrations',
  '20260807000100_notification_outbox.sql',
)
const sql = fs.readFileSync(migrationPath, 'utf8')
const client = createPgClient(url)

async function run() {
  console.log('Connecting (owner/migrate preferred)…')
  await client.connect()
  console.log(`Applying ${migrationPath}…`)
  await client.query(sql)

  const table = await client.query(`
    select to_regclass('public."NotificationOutbox"') as reg
  `)
  const rls = await client.query(`
    select relrowsecurity
    from pg_class
    where relname = 'NotificationOutbox'
  `)

  console.log('NotificationOutbox:', table.rows[0]?.reg)
  console.log('RLS enabled:', rls.rows[0]?.relrowsecurity ?? 'MISSING')

  if (!table.rows[0]?.reg) throw new Error('NotificationOutbox missing')
  if (!rls.rows[0]?.relrowsecurity) throw new Error('NotificationOutbox RLS not enabled')

  console.log('OK: notification outbox migration applied')
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    try {
      await client.end()
    } catch {
      /* ignore */
    }
  })
