/**
 * Audit legacy snake_case public.* tables before drop migration.
 *
 * Usage:
 *   node scripts/audit-legacy-public-schema.mjs
 *   node scripts/audit-legacy-public-schema.mjs --require-empty   # exit 1 if any rows
 */
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const requireEmpty = process.argv.includes('--require-empty')

const LEGACY_TABLES = [
  'appointment_status_history',
  'reviews',
  'appointments',
  'calendar_availability',
  'calendar_blocks',
  'notifications',
  'services',
  'team_members',
  'activity_logs',
  'user_consents',
  'data_deletion_requests',
  'customers',
  'providers',
  'categories',
  'specialties',
  'users',
]

const rawConnectionString =
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL

if (!rawConnectionString) {
  console.error('No database connection string (DIRECT_URL / DATABASE_URL)')
  process.exit(1)
}

const url = new URL(rawConnectionString)
url.searchParams.set('uselibpqcompat', 'true')

const client = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
})

async function tableExists(name) {
  const result = await client.query(
    `select to_regclass($1) as regclass`,
    [`public.${name}`]
  )
  return result.rows[0]?.regclass != null
}

async function rowCount(name) {
  const result = await client.query(`select count(*)::bigint as c from public.${name}`)
  return Number(result.rows[0].c)
}

async function run() {
  console.log('Connecting to database (direct/non-pooling preferred)...')
  await client.connect()

  const present = []
  const missing = []
  const nonEmpty = []

  for (const table of LEGACY_TABLES) {
    if (await tableExists(table)) {
      const count = await rowCount(table)
      present.push({ table, count })
      if (count > 0) nonEmpty.push({ table, count })
    } else {
      missing.push(table)
    }
  }

  console.log('\nLegacy public.* schema audit')
  console.log(`  Tables in inventory: ${LEGACY_TABLES.length}`)
  console.log(`  Still present: ${present.length}`)
  console.log(`  Already dropped: ${missing.length}`)

  if (present.length) {
    console.log('\n  Present tables:')
    for (const { table, count } of present) {
      const flag = count > 0 ? ' ⚠ HAS ROWS' : ''
      console.log(`    public.${table}: ${count} rows${flag}`)
    }
  }

  if (missing.length) {
    console.log('\n  Already absent (OK):')
    for (const table of missing) {
      console.log(`    public.${table}`)
    }
  }

  if (nonEmpty.length) {
    console.error('\nFAILED — legacy tables still hold data:')
    for (const { table, count } of nonEmpty) {
      console.error(`  public.${table}: ${count} rows`)
    }
    console.error('\nArchive or truncate before applying 20260716000200_drop_legacy_snake_schema.sql')
    await client.end()
    process.exit(1)
  }

  if (present.length === 0) {
    console.log('\nOK — all legacy tables already removed.')
  } else if (requireEmpty) {
    console.log('\nOK — all present legacy tables are empty. Safe to apply drop migration.')
  } else {
    console.log('\nOK — no row data in legacy tables (re-run with --require-empty to enforce in CI).')
  }

  await client.end()
}

run().catch(async (error) => {
  console.error('Audit failed:', error.message)
  try {
    await client.end()
  } catch {
    // ignore
  }
  process.exit(1)
})
