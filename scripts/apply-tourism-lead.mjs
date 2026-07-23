/**
 * Apply D3 TourismLead migration.
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

const migrationPath = path.join('supabase', 'migrations', '20260721000600_tourism_lead.sql')
const sql = fs.readFileSync(migrationPath, 'utf8')
const client = createPgClient(url)

async function run() {
  console.log('Connecting…')
  await client.connect()
  console.log(`Applying ${migrationPath}…`)
  await client.query(sql)
  const table = await client.query(`select to_regclass('public."TourismLead"') as reg`)
  console.log('TourismLead:', table.rows[0]?.reg)
  if (!table.rows[0]?.reg) throw new Error('TourismLead missing')
  console.log('OK: tourism lead migration applied')
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    try {
      await client.end()
    } catch {
      /* ignore */
    }
  })
