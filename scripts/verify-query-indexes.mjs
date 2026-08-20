import dotenv from 'dotenv'
import pg from 'pg'
import { PRODUCTION_QUERY_INDEXES } from '../lib/security/query-index-inventory.ts'

dotenv.config({ path: '.env.local' })
dotenv.config()

const url = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!url) {
  console.error('No DATABASE_URL')
  process.exit(1)
}

const u = new URL(url)
u.searchParams.set('uselibpqcompat', 'true')
const client = new pg.Client({
  connectionString: u.toString(),
  ssl: { rejectUnauthorized: false },
})

await client.connect()
const { rows } = await client.query(
  `select indexname from pg_indexes where schemaname = 'public' and indexname = any($1::text[]) order by 1`,
  [PRODUCTION_QUERY_INDEXES]
)
const found = new Set(rows.map((r) => r.indexname))
const missing = PRODUCTION_QUERY_INDEXES.filter((n) => !found.has(n))
console.log(`found ${found.size}/${PRODUCTION_QUERY_INDEXES.length}`)
if (missing.length) {
  console.error('MISSING', missing)
  process.exit(1)
}
console.log('OK')
await client.end()
