/**
 * Idempotent Supabase RLS stack apply.
 * Shared by db:deploy, dev bootstrap, and CI.
 */
import fs from 'fs'
import path from 'path'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

export const RLS_MIGRATIONS = [
  '20260518000200_patient_files_storage_rls.sql',
  '20260519000100_production_rls_messaging_storage.sql',
  '20260519000200_tighten_chat_rls.sql',
  '20260519000300_enable_realtime_publication.sql',
  '20260520000100_reminders_push_rls.sql',
  '20260520000200_storage_reference_guards.sql',
  '20260520000500_lab_result_storage_scope.sql',
  '20260520000600_direct_conversation_key.sql',
  '20260529000100_client_marketplace_foundation.sql',
  '20260714000400_rls_prisma_parity.sql',
  '20260716000100_person_identity_rls.sql',
  '20260717000100_rls_phi_business_scope_hardening.sql',
  '20260717000200_rls_auth_uid_text_cast.sql',
  '20260717000300_production_query_indexes.sql',
  '20260720000100_marketing_and_webhook_idempotency.sql',
  '20260720000200_prisma_guc_rls.sql',
  '20260721000100_asistan_app_booking_identity_bridge.sql',
  '20260721000200_appointment_deposit.sql',
  '20260721000300_clinic_invoice_kktc.sql',
  '20260721000400_whatsapp_front_desk.sql',
  '20260722000100_patient_channel_attempt.sql',
  '20260730000100_fix_guc_business_id_q3.sql',
  '20260807000100_notification_outbox.sql',
  '20260808000100_notification_outbox_rls.sql',
  '20260808000200_patient_channel_attempt_rls.sql',
  '20260820000100_person_health_records.sql',
  '20260820000200_person_documents_bucket.sql',
]

export function resolveDatabaseUrl() {
  return (
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    null
  )
}

export function createPgClient(connectionString) {
  const url = new URL(connectionString)
  url.searchParams.set('uselibpqcompat', 'true')
  return new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000,
  })
}

export async function applyRlsStack(client) {
  for (const file of RLS_MIGRATIONS) {
    const migrationPath = path.join('supabase', 'migrations', file)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log(`  Applying ${file}...`)
    await client.query(sql)
  }
}

export async function runRlsStackApply({ label = 'RLS stack' } = {}) {
  const connectionString = resolveDatabaseUrl()
  if (!connectionString) {
    console.log(`[db] Skip ${label}: no DIRECT_URL / DATABASE_URL`)
    return { applied: false, reason: 'no-database-url' }
  }

  const client = createPgClient(connectionString)
  console.log(`[db] Connecting for ${label}...`)
  await client.connect()

  try {
    console.log(`[db] Applying ${RLS_MIGRATIONS.length} RLS migrations...`)
    await applyRlsStack(client)
    console.log(`[db] ${label} applied successfully.`)
    return { applied: true, count: RLS_MIGRATIONS.length }
  } finally {
    await client.end()
  }
}
