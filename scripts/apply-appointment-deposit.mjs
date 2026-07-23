/**
 * Apply Q3 appointment deposit migration (additive).
 * Prefer: DATABASE_URL_MIGRATE (owner) → DIRECT_URL → DATABASE_URL
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
  '20260721000200_appointment_deposit.sql',
)
const sql = fs.readFileSync(migrationPath, 'utf8')
const client = createPgClient(url)

async function run() {
  console.log('Connecting (owner/migrate preferred)…')
  await client.connect()
  console.log(`Applying ${migrationPath}…`)
  await client.query(sql)

  const cols = await client.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'Business'
      and column_name in (
        'depositEnabled',
        'depositAmount',
        'noShowFeeEnabled',
        'noShowFeeAmount',
        'noShowFeeNote'
      )
    order by column_name
  `)
  const table = await client.query(`
    select to_regclass('public."AppointmentDeposit"') as reg
  `)
  const enums = await client.query(`
    select t.typname
    from pg_type t
    where t.typname in ('AppointmentDepositStatus', 'AppointmentDepositProvider')
    order by 1
  `)

  console.log('Business columns:', cols.rows.map((r) => r.column_name).join(', '))
  console.log('AppointmentDeposit:', table.rows[0]?.reg)
  console.log('Enums:', enums.rows.map((r) => r.typname).join(', '))

  if (cols.rows.length !== 5) {
    throw new Error('Missing Business deposit columns after migration')
  }
  if (!table.rows[0]?.reg) {
    throw new Error('AppointmentDeposit table missing after migration')
  }

  console.log('OK: deposit migration applied')
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
