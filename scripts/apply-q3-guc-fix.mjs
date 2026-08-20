/**
 * One-shot: apply Q3 deposit/invoice/front-desk + GUC fix, then ensure DEPOSIT_ACCESS_SECRET.
 * Usage: node scripts/apply-q3-guc-fix.mjs
 */
import fs from 'fs'
import { randomBytes } from 'crypto'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const FILES = [
  '20260721000200_appointment_deposit.sql',
  '20260721000300_clinic_invoice_kktc.sql',
  '20260721000400_whatsapp_front_desk.sql',
  '20260730000100_fix_guc_business_id_q3.sql',
]

const raw =
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!raw) {
  throw new Error('No DIRECT_URL / DATABASE_URL')
}

const url = new URL(raw)
url.searchParams.set('uselibpqcompat', 'true')
const client = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60000,
})

async function main() {
  await client.connect()
  console.log('[db] Connected')

  for (const file of FILES) {
    const sql = fs.readFileSync(`supabase/migrations/${file}`, 'utf8')
    console.log(`[db] Applying ${file}...`)
    await client.query(sql)
    console.log(`[db] OK ${file}`)
  }

  const { rows } = await client.query(`
    select tablename, policyname, qual
    from pg_policies
    where schemaname = 'public'
      and tablename in ('AppointmentDeposit', 'ClinicInvoice', 'FrontDeskSession')
      and policyname like '%prisma_guc%'
  `)

  for (const row of rows) {
    const qual = String(row.qual || '')
    const ok = qual.includes('app.business_id')
    const stale = qual.includes('app.current_business_id')
    console.log(
      `[verify] ${row.tablename}.${row.policyname}: ${ok ? 'GUC_OK' : 'GUC_BAD'}${stale ? ' STILL_OLD' : ''}`
    )
  }

  await client.end()

  const envPath = '.env.local'
  let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
  if (!/^\s*DEPOSIT_ACCESS_SECRET=/m.test(envText)) {
    const secret = randomBytes(32).toString('base64url')
    if (envText.length && !envText.endsWith('\n')) envText += '\n'
    envText += `\n# Public deposit link HMAC (do not commit)\nDEPOSIT_ACCESS_SECRET=${secret}\n`
    fs.writeFileSync(envPath, envText)
    console.log('[env] DEPOSIT_ACCESS_SECRET written to .env.local')
  } else {
    console.log('[env] DEPOSIT_ACCESS_SECRET already present')
  }

  console.log('[done]')
}

main().catch(async (error) => {
  console.error('[fail]', error.message)
  try {
    await client.end()
  } catch {
    /* ignore */
  }
  process.exit(1)
})
