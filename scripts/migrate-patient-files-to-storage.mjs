/**
 * Migrate legacy inline base64 PatientFile / LabResult records to Supabase Storage.
 *
 * Usage:
 *   node scripts/migrate-patient-files-to-storage.mjs           # dry-run (report only)
 *   node scripts/migrate-patient-files-to-storage.mjs --apply --i-know-this-bypasses-rls
 *   node scripts/migrate-patient-files-to-storage.mjs --apply --validate --i-know-this-bypasses-rls
 *
 * Requires: DIRECT_URL/DATABASE_URL + SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (for --apply).
 * Idempotent: rows already on storage:// refs are never touched.
 * Elevated ops: remote/production --apply requires --i-know-this-bypasses-rls (docs/security-ops.md).
 */
import pg from 'pg'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { requireElevatedOps } from './lib/privilege-guard.mjs'

dotenv.config({ path: '.env.local' })
dotenv.config()

const APPLY = process.argv.includes('--apply')
const VALIDATE = process.argv.includes('--validate')
const BUCKET = 'patient-files'

if (APPLY || VALIDATE) {
  requireElevatedOps({
    script: 'migrate-patient-files-to-storage',
    purpose: 'Mutate PatientFile/LabResult + Storage admin (service_role)',
    surfaces: ['supabase-service-role', 'postgres-owner'],
  })
}

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
const db = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
})

function parseDataUri(fileUrl) {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(fileUrl)
  if (!match) return null
  const [, mime = 'application/octet-stream', isBase64, payload] = match
  const buffer = isBase64
    ? Buffer.from(payload, 'base64')
    : Buffer.from(decodeURIComponent(payload), 'utf8')
  return { mime, buffer }
}

function extensionFor(mime) {
  const map = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'text/plain': 'txt',
  }
  return map[mime] ?? 'bin'
}

async function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required for --apply')
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function ensureBucket(supabase) {
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (data) return
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 26214400,
  })
  if (error && !`${error.message}`.includes('already exists')) {
    throw new Error(`Bucket create failed: ${error.message}`)
  }
}

async function migratePatientFiles(supabase) {
  const { rows } = await db.query(`
    select id, "businessId", "patientId", "fileName", "fileType", "fileUrl", "storageKey"
    from "PatientFile"
    where "fileUrl" ~* '^data:'
       or "fileUrl" !~ '^storage://patient-files/'
       or "storageKey" is null or "storageKey" = ''
       or "storageKey" !~ ('^' || "businessId" || '/' || "patientId" || '/')
    order by "uploadedAt"
  `)

  console.log(`PatientFile rows needing migration: ${rows.length}`)
  let migrated = 0
  let skipped = 0

  for (const row of rows) {
    const parsed = row.fileUrl ? parseDataUri(row.fileUrl) : null
    if (!parsed) {
      console.warn(`  SKIP ${row.id}: not a data: URI (fileUrl=${String(row.fileUrl).slice(0, 60)}…) — needs manual review`)
      skipped++
      continue
    }

    const ext = extensionFor(parsed.mime)
    const safeName = (row.fileName || `dosya.${ext}`)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .slice(0, 140) || `dosya.${ext}`
    const storageKey = `${row.businessId}/${row.patientId}/${row.id}-${safeName}`

    if (!APPLY) {
      console.log(`  DRY-RUN ${row.id}: ${parsed.buffer.length} bytes → ${storageKey}`)
      migrated++
      continue
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, parsed.buffer, {
        contentType: parsed.mime,
        upsert: true,
      })
    if (uploadError) {
      console.error(`  FAIL ${row.id}: upload — ${uploadError.message}`)
      skipped++
      continue
    }

    await db.query(
      `update "PatientFile"
       set "storageKey" = $1,
           "fileUrl" = $2,
           "fileType" = coalesce(nullif("fileType", ''), $3),
           "fileSize" = coalesce("fileSize", $4)
       where id = $5`,
      [storageKey, `storage://${BUCKET}/${storageKey}`, parsed.mime, parsed.buffer.length, row.id]
    )
    console.log(`  OK ${row.id} → ${storageKey} (${parsed.buffer.length} bytes)`)
    migrated++
  }

  return { migrated, skipped }
}

async function migrateLabResults(supabase) {
  const { rows } = await db.query(`
    select id, "businessId", "patientId", title, "fileUrl"
    from "LabResult"
    where "fileUrl" is not null
      and "fileUrl" !~ '^storage://patient-files/'
    order by "createdAt"
  `)

  console.log(`LabResult rows needing migration: ${rows.length}`)
  let migrated = 0
  let skipped = 0

  for (const row of rows) {
    const parsed = parseDataUri(row.fileUrl)
    if (!parsed) {
      // External http(s) links are allowed to stay; only inline payloads move.
      if (/^https?:\/\//.test(row.fileUrl) && row.fileUrl.length <= 1200) {
        skipped++
        continue
      }
      console.warn(`  SKIP ${row.id}: unrecognized fileUrl — needs manual review`)
      skipped++
      continue
    }

    const ext = extensionFor(parsed.mime)
    const storageKey = `${row.businessId}/${row.patientId}/lab-${row.id}.${ext}`

    if (!APPLY) {
      console.log(`  DRY-RUN ${row.id}: ${parsed.buffer.length} bytes → ${storageKey}`)
      migrated++
      continue
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, parsed.buffer, { contentType: parsed.mime, upsert: true })
    if (uploadError) {
      console.error(`  FAIL ${row.id}: upload — ${uploadError.message}`)
      skipped++
      continue
    }

    await db.query(`update "LabResult" set "fileUrl" = $1 where id = $2`, [
      `storage://${BUCKET}/${storageKey}`,
      row.id,
    ])
    console.log(`  OK ${row.id} → ${storageKey} (${parsed.buffer.length} bytes)`)
    migrated++
  }

  return { migrated, skipped }
}

async function validateConstraints() {
  for (const [table, constraint] of [
    ['PatientFile', 'PatientFile_storage_reference_check'],
    ['LabResult', 'LabResult_storage_reference_check'],
    ['MessageAttachment', 'MessageAttachment_storage_reference_check'],
  ]) {
    const exists = await db.query(`select 1 from pg_constraint where conname = $1`, [constraint])
    if (!exists.rows.length) {
      console.warn(`  Constraint missing (run pnpm db:ready first): ${constraint}`)
      continue
    }
    try {
      await db.query(`alter table "${table}" validate constraint "${constraint}"`)
      console.log(`  VALIDATED ${constraint}`)
    } catch (error) {
      console.error(`  VALIDATE FAILED ${constraint}: ${error.message}`)
    }
  }
}

async function main() {
  await db.connect()

  const supabase = APPLY ? await getSupabase() : null
  if (APPLY) await ensureBucket(supabase)

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`)

  const pf = await migratePatientFiles(supabase)
  const lab = await migrateLabResults(supabase)

  console.log(`\nPatientFile: ${pf.migrated} migrated, ${pf.skipped} skipped`)
  console.log(`LabResult:   ${lab.migrated} migrated, ${lab.skipped} skipped`)

  if (VALIDATE && APPLY) {
    console.log('\nValidating storage constraints...')
    await validateConstraints()
  }

  const remaining = await db.query(`
    select count(*)::int as n from "PatientFile"
    where "fileUrl" !~ '^storage://patient-files/' or "storageKey" is null or "storageKey" = ''
  `)
  console.log(`\nRemaining non-storage PatientFile rows: ${remaining.rows[0].n}`)

  await db.end()
  if (pf.skipped + lab.skipped > 0) process.exitCode = 2
}

main().catch(async (error) => {
  console.error('Migration failed:', error.message)
  try {
    await db.end()
  } catch {
    // ignore
  }
  process.exit(1)
})
