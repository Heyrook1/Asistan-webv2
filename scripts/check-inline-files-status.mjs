#!/usr/bin/env node
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const raw = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!raw) {
  console.error('No DATABASE_URL')
  process.exit(1)
}
const url = new URL(raw)
url.searchParams.set('uselibpqcompat', 'true')
const db = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
})
await db.connect()

const summary = {}

for (const [table, where] of [
  [
    'PatientFile',
    `"fileUrl" ~* '^data:' or "fileUrl" !~ '^storage://patient-files/' or octet_length(coalesce("fileUrl",'')) > 1200`,
  ],
  [
    'LabResult',
    `"fileUrl" is not null and ("fileUrl" ~* '^data:' or "fileUrl" !~ '^storage://patient-files/' or octet_length("fileUrl") > 1200)`,
  ],
  [
    'MessageAttachment',
    `"fileUrl" ~* '^data:' or "fileUrl" !~ '^storage://message-media/' or octet_length(coalesce("fileUrl",'')) > 1200`,
  ],
]) {
  const { rows } = await db.query(`
    select
      count(*)::int as total,
      count(*) filter (where ${where})::int as invalid
    from "${table}"
  `)
  summary[table] = rows[0]
}

const { rows: constraints } = await db.query(`
  select conname, convalidated
  from pg_constraint
  where conname in (
    'PatientFile_storage_reference_check',
    'MessageAttachment_storage_reference_check',
    'LabResult_file_url_not_inline_payload_check',
    'LabResult_storage_scope_check'
  )
  order by conname
`)

const { rows: buckets } = await db.query(`
  select id, name, public from storage.buckets where id in ('patient-files', 'message-media')
`)

console.log(JSON.stringify({ summary, constraints, buckets }, null, 2))
await db.end()
