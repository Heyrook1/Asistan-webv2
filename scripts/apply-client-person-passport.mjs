/**
 * Apply D2 ClientUser.personId + passport RLS policies.
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
  '20260721000500_client_person_passport.sql',
)
const sql = fs.readFileSync(migrationPath, 'utf8')
const client = createPgClient(url)

async function run() {
  console.log('Connecting (owner/migrate preferred)…')
  await client.connect()
  console.log(`Applying ${migrationPath}…`)
  await client.query(sql)

  const col = await client.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'ClientUser'
      and column_name = 'personId'
  `)
  console.log('ClientUser.personId:', col.rows[0]?.column_name ?? 'MISSING')
  if (!col.rows[0]) throw new Error('personId missing on ClientUser')
  console.log('OK: client person passport migration applied')
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
