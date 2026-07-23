/**
 * Apply D1 WhatsApp front-desk migration (additive).
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
  '20260721000400_whatsapp_front_desk.sql',
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
      and column_name = 'whatsappAgentEnabled'
  `)
  const table = await client.query(`
    select to_regclass('public."FrontDeskSession"') as reg
  `)

  console.log('Business.whatsappAgentEnabled:', cols.rows[0]?.column_name ?? 'MISSING')
  console.log('FrontDeskSession:', table.rows[0]?.reg)

  if (!cols.rows[0]) throw new Error('whatsappAgentEnabled missing')
  if (!table.rows[0]?.reg) throw new Error('FrontDeskSession missing')

  console.log('OK: whatsapp front-desk migration applied')
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
