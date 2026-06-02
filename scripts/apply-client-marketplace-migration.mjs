import fs from 'fs'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const sql = fs.readFileSync(
  'supabase/migrations/20260529000100_client_marketplace_foundation.sql',
  'utf8'
)

const rawConnectionString =
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!rawConnectionString) {
  throw new Error('No database connection string found in environment')
}

const url = new URL(rawConnectionString)
url.searchParams.set('uselibpqcompat', 'true')
const connectionString = url.toString()

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

async function run() {
  console.log('Connecting to database...')
  await client.connect()
  console.log('Applying client marketplace migration...')
  await client.query(sql)
  console.log('Migration applied successfully.')
  await client.end()
}

run().catch(async (error) => {
  console.error('Migration failed:', error.message)
  try {
    await client.end()
  } catch {}
  process.exit(1)
})
