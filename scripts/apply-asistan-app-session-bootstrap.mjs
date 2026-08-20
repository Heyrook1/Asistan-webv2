/**
 * Apply asistan_app session bootstrap RLS (User / Business / TeamMember self).
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
  '20260721000700_asistan_app_session_bootstrap.sql',
)
const sql = fs.readFileSync(migrationPath, 'utf8')
const client = createPgClient(url)

async function run() {
  console.log('Connecting (owner/migrate preferred)…')
  await client.connect()
  console.log(`Applying ${migrationPath}…`)
  await client.query(sql)

  const policies = await client.query(`
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname in (
        'user_asistan_app',
        'business_asistan_app',
        'teammember_asistan_app_self'
      )
    order by tablename, policyname
  `)
  console.log('Policies:', policies.rows)
  if (policies.rows.length < 3) {
    throw new Error('Expected 3 asistan_app session bootstrap policies')
  }
  console.log('OK: asistan_app session bootstrap RLS applied')
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
