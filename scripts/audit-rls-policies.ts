/**
 * Live audit: RLS enabled + businessId-scoped policies on PHI tables.
 * Usage: pnpm check:rls-policies
 */
import pg from 'pg'
import { config } from 'dotenv'

import {
  listBusinessIdScopedTables,
  listDenyPostgrestTables,
  listParentScopedTableNames,
  listSelfScopedTableNames,
  policyLooksBusinessScoped,
  policyLooksDenyAll,
  policyLooksSelfScoped,
} from '../lib/security/rls-policy-inventory'

config({ path: '.env.local' })
config()

const BUSINESS_SCOPED = listBusinessIdScopedTables()
const DENY_TABLES = listDenyPostgrestTables()
const PARENT_SCOPED = listParentScopedTableNames()
const SELF_SCOPED = listSelfScopedTableNames()

const ALL_CHECK = [
  ...new Set([...BUSINESS_SCOPED, ...DENY_TABLES, ...PARENT_SCOPED, ...SELF_SCOPED, 'Business', 'User']),
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

async function run() {
  await client.connect()

  const rlsRows = await client.query<{ relname: string; relrowsecurity: boolean }>(
    `
    select c.relname, c.relrowsecurity
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = any($1::text[]) and c.relkind = 'r'
    `,
    [ALL_CHECK]
  )
  const rlsMap = new Map(rlsRows.rows.map((r) => [r.relname, r.relrowsecurity]))

  const policyRows = await client.query<{
    tablename: string
    policyname: string
    qual: string | null
    with_check: string | null
  }>(
    `
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public' and tablename = any($1::text[])
    `,
    [ALL_CHECK]
  )
  const byTable = new Map<string, typeof policyRows.rows>()
  for (const row of policyRows.rows) {
    const list = byTable.get(row.tablename) ?? []
    list.push(row)
    byTable.set(row.tablename, list)
  }

  const failures: string[] = []

  for (const table of ALL_CHECK) {
    if (!rlsMap.has(table)) continue
    if (rlsMap.get(table) !== true) {
      failures.push(`${table}: RLS not enabled`)
      continue
    }
    const policies = byTable.get(table) ?? []
    if (policies.length === 0) {
      failures.push(`${table}: no policies (RLS enabled = deny all)`)
    }
  }

  for (const table of BUSINESS_SCOPED) {
    if (!rlsMap.has(table)) continue
    const policies = byTable.get(table) ?? []
    const scoped = policies.some((p) => policyLooksBusinessScoped(p.qual, p.with_check))
    if (!scoped) {
      failures.push(`${table}: no businessId-scoped policy`)
    }
  }

  for (const table of PARENT_SCOPED) {
    if (!rlsMap.has(table)) continue
    const policies = byTable.get(table) ?? []
    if (policies.length === 0) {
      failures.push(`${table}: no parent-scoped policies`)
    }
  }

  for (const table of SELF_SCOPED) {
    if (!rlsMap.has(table)) continue
    const policies = byTable.get(table) ?? []
    const selfScoped = policies.some((p) => policyLooksSelfScoped(p.qual, p.with_check))
    if (!selfScoped) {
      failures.push(`${table}: no auth.uid() self-scoped policy`)
    }
  }

  for (const table of DENY_TABLES) {
    if (!rlsMap.has(table)) continue
    const policies = byTable.get(table) ?? []
    const denied = policies.some((p) => policyLooksDenyAll(p.qual, p.with_check))
    if (!denied) {
      failures.push(`${table}: missing explicit deny policy for PostgREST`)
    }
  }

  console.log('RLS policy audit')
  console.log(`  Tables checked: ${ALL_CHECK.length}`)
  console.log(`  Present in DB: ${rlsMap.size}`)
  console.log(`  Policy rows: ${policyRows.rows.length}`)

  if (failures.length) {
    console.error('\nFAILED')
    for (const f of failures) console.error(`  - ${f}`)
    await client.end()
    process.exit(1)
  }

  console.log('\nOK — PHI tables have RLS + businessId or deny-default policies.')
  await client.end()
}

run().catch(async (error) => {
  console.error('Audit failed:', error instanceof Error ? error.message : error)
  try {
    await client.end()
  } catch {
    // ignore
  }
  process.exit(1)
})
