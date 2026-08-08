import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

import { listRequiredRlsTableNames } from '../lib/security/rls-inventory'
import {
  listBusinessIdScopedTables,
  listDenyPostgrestTables,
  policyLooksBusinessScoped,
  policyLooksDenyAll,
} from '../lib/security/rls-policy-inventory'

config({ path: '.env.local' })
config({ path: '.env' })

const prisma = new PrismaClient()

type Check = {
  name: string
  pass: boolean
  detail?: string
}

function ok(name: string, detail?: string): Check {
  return { name, pass: true, detail }
}

function fail(name: string, detail?: string): Check {
  return { name, pass: false, detail }
}

async function main() {
  const checks: Check[] = []

  const pepper = process.env.PERSON_IDENTITY_PEPPER?.trim()
  checks.push(
    pepper && pepper.length >= 16
      ? ok('PERSON_IDENTITY_PEPPER', 'identity document hashing ready')
      : ok(
          'PERSON_IDENTITY_PEPPER',
          'WARN: unset — guest book (phone-only) OK; national-ID hashing blocked until set (≥16 chars)'
        )
  )

  const cronSecret = process.env.CRON_SECRET?.trim()
  checks.push(
    cronSecret && cronSecret.length >= 16
      ? ok('CRON_SECRET', 'protects /api/cron/* (fail-closed)')
      : fail(
          'CRON_SECRET',
          'missing or short (<16) — /api/cron/appointment-reminders returns 503'
        )
  )

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
  checks.push(
    upstashUrl && upstashToken
      ? ok('Rate limit backend (Upstash)', 'shared Redis preferred for multi-instance')
      : ok(
          'Rate limit backend (memory)',
          'WARN: UPSTASH unset — single-node EC2 memory limiter OK; set Upstash before multi-instance'
        )
  )

  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    try {
      const healthRes = await fetch(`${appUrl.replace(/\/$/, '')}/api/health`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const healthJson = (await healthRes.json()) as {
        ok?: boolean
        checks?: { catalog?: string; database?: string }
      }
      const catalogOk = healthJson.checks?.catalog === 'healthy'
      const dbOk = healthJson.checks?.database === 'healthy'
      checks.push(
        healthRes.ok && healthJson.ok && catalogOk && dbOk
          ? ok('Live health catalog', `${appUrl} database+catalog healthy`)
          : fail(
              'Live health catalog',
              `APP_URL health failed status=${healthRes.status} db=${healthJson.checks?.database} catalog=${healthJson.checks?.catalog}`
            )
      )
    } catch (error) {
      checks.push(
        fail(
          'Live health catalog',
          error instanceof Error ? error.message : 'APP_URL /api/health unreachable'
        )
      )
    }
  }

  const requiredRlsTables = listRequiredRlsTableNames()

  const rlsRows = await prisma.$queryRawUnsafe<Array<{ relname: string; relrowsecurity: boolean }>>(
    `
      select c.relname, c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = any($1::text[])
    `,
    requiredRlsTables
  )
  const rlsMap = new Map(rlsRows.map((row) => [row.relname, row.relrowsecurity]))
  for (const table of requiredRlsTables) {
    checks.push(
      rlsMap.get(table) === true
        ? ok(`RLS enabled: ${table}`)
        : fail(`RLS enabled: ${table}`, 'missing or disabled')
    )
  }

  const requiredColumns = [
    ['Patient', 'lastDiagnosis'],
    ['Patient', 'currentTreatment'],
    ['Patient', 'riskNote'],
    ['Patient', 'summary'],
    ['Patient', 'aiSuggestions'],
    ['Patient', 'assignedDoctorId'],
    ['PatientNote', 'createdByUserId'],
    ['Notification', 'actorUserId'],
    ['Notification', 'subtype'],
    ['Notification', 'entityType'],
    ['Notification', 'entityId'],
    ['Notification', 'priority'],
    ['Notification', 'actionRequired'],
    ['Notification', 'metadata'],
    ['Notification', 'archivedAt'],
    ['NotificationAction', 'actionType'],
    ['PushSubscription', 'endpoint'],
    ['Reminder', 'priority'],
    ['Conversation', 'lastMessageAt'],
    ['Conversation', 'directKey'],
    ['ConversationParticipant', 'lastReadAt'],
    ['Message', 'deletedAt'],
    ['MessageAttachment', 'storageKey'],
    ['MessageReaction', 'emoji'],
    ['TreatmentPlanItem', 'order'],
  ] as const
  const columnRows = await prisma.$queryRawUnsafe<Array<{ table_name: string; column_name: string }>>(
    `
      select table_name, column_name
      from information_schema.columns
      where table_schema = 'public'
        and (table_name, column_name) in (
          select *
          from unnest($1::text[], $2::text[])
        )
    `,
    requiredColumns.map(([table]) => table),
    requiredColumns.map(([, column]) => column)
  )
  const existingColumns = new Set(columnRows.map((row) => `${row.table_name}.${row.column_name}`))
  for (const [table, column] of requiredColumns) {
    const key = `${table}.${column}`
    checks.push(existingColumns.has(key) ? ok(`Schema column: ${key}`) : fail(`Schema column: ${key}`, 'missing'))
  }

  const patientNumberRuntime = await prisma.$queryRawUnsafe<
    Array<{ routine_name: string; trigger_name: string | null }>
  >(
    `
      select r.routine_name, t.trigger_name
      from information_schema.routines r
      left join information_schema.triggers t
        on t.event_object_schema = 'public'
       and t.event_object_table = 'Patient'
       and t.trigger_name = 'Patient_set_patient_number'
      where r.specific_schema = 'public'
        and r.routine_name = 'next_patient_number'
      limit 1
    `
  )
  checks.push(
    patientNumberRuntime.length > 0
      ? ok('Race-free patient number function')
      : fail('Race-free patient number function', 'missing public.next_patient_number')
  )
  checks.push(
    patientNumberRuntime.some((row) => row.trigger_name === 'Patient_set_patient_number')
      ? ok('Patient number insert trigger')
      : fail('Patient number insert trigger', 'missing Patient_set_patient_number')
  )

  const patientNoteFk = await prisma.$queryRawUnsafe<Array<{ conname: string }>>(
    `
      select conname
      from pg_constraint
      where conname = 'PatientNote_createdByUserId_fkey'
    `
  )
  checks.push(
    patientNoteFk.length > 0
      ? ok('PatientNote creator FK')
      : fail('PatientNote creator FK', 'missing PatientNote_createdByUserId_fkey')
  )

  const directConversationIndex = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(
    `
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'Conversation'
        and indexname = 'Conversation_business_directKey_unique'
        and indexdef ilike '%unique%'
    `
  )
  checks.push(
    directConversationIndex.length > 0
      ? ok('Direct conversation unique key')
      : fail('Direct conversation unique key', 'missing Conversation_business_directKey_unique')
  )

  const policies = await prisma.$queryRawUnsafe<
    Array<{ tablename: string; policyname: string; cmd: string; qual: string | null; with_check: string | null }>
  >(
    `
      select tablename, policyname, cmd, qual, with_check
      from pg_policies
      where schemaname = 'public'
    `
  )
  const findPolicy = (table: string, name: string) =>
    policies.find((policy) => policy.tablename === table && policy.policyname === name)

  // Matches `"userId" = auth.uid()` and Prisma-text form `"userId" = (auth.uid())::text`
  const selfMatch = (text: string | null | undefined, column = 'userId') =>
    !!text && new RegExp(`"${column}" = \\(?auth\\.uid\\(\\)\\)?(::text)?`).test(text)

  const patientSelect = findPolicy('Patient', 'patient_select')
  checks.push(
    patientSelect?.qual?.includes('patient.view') && patientSelect.qual.includes('businessId')
      ? ok('Patient tenant select policy')
      : fail('Patient tenant select policy', patientSelect?.qual ?? 'missing')
  )

  const noteSelect = findPolicy('PatientNote', 'patient_note_select')
  checks.push(
    noteSelect?.qual?.includes('medical_note.view') && noteSelect.qual.includes('patient_belongs_to_business')
      ? ok('Secretary blocked from medical notes by DB policy')
      : fail('Secretary blocked from medical notes by DB policy', noteSelect?.qual ?? 'missing')
  )

  const patientFileSelect = findPolicy('PatientFile', 'patient_file_select')
  checks.push(
    patientFileSelect?.qual?.includes('file.view') && patientFileSelect.qual.includes('patient_belongs_to_business')
      ? ok('PatientFile tenant/file.view policy')
      : fail('PatientFile tenant/file.view policy', patientFileSelect?.qual ?? 'missing')
  )

  const inlinePatientFiles = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `
      select count(*)::bigint as count
      from "PatientFile"
      where "fileUrl" !~ '^storage://patient-files/'
         or "fileUrl" ~* '^data:'
         or octet_length("fileUrl") > 1200
         or "storageKey" is null
         or "storageKey" = ''
         or "storageKey" !~ ('^' || "businessId"::text || '/' || "patientId"::text || '/')
    `
  )
  const inlinePatientFileCount = Number(inlinePatientFiles[0]?.count ?? 0)
  checks.push(
    inlinePatientFileCount === 0
      ? ok('PatientFile stores storage references only')
      : fail('PatientFile stores storage references only', `${inlinePatientFileCount} invalid rows`)
  )

  const invalidLabResultFiles = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `
      select count(*)::bigint as count
      from "LabResult"
      where "fileUrl" is not null
        and (
          "fileUrl" !~ ('^storage://patient-files/' || "businessId"::text || '/' || "patientId"::text || '/')
          or octet_length("fileUrl") > 1200
        )
    `
  )
  const invalidLabResultFileCount = Number(invalidLabResultFiles[0]?.count ?? 0)
  checks.push(
    invalidLabResultFileCount === 0
      ? ok('LabResult file references are tenant/patient scoped')
      : fail('LabResult file references are tenant/patient scoped', `${invalidLabResultFileCount} invalid rows`)
  )

  const storageConstraints = await prisma.$queryRawUnsafe<Array<{ conname: string }>>(
    `
      select conname
      from pg_constraint
      where conname in (
        'PatientFile_storage_reference_check',
        'MessageAttachment_storage_reference_check',
        'LabResult_storage_reference_check'
      )
    `
  )
  const constraintNames = new Set(storageConstraints.map((constraint) => constraint.conname))
  checks.push(
    constraintNames.has('PatientFile_storage_reference_check')
      ? ok('PatientFile DB storage reference constraint')
      : fail('PatientFile DB storage reference constraint')
  )
  checks.push(
    constraintNames.has('MessageAttachment_storage_reference_check')
      ? ok('MessageAttachment DB storage reference constraint')
      : fail('MessageAttachment DB storage reference constraint')
  )
  checks.push(
    constraintNames.has('LabResult_storage_reference_check')
      ? ok('LabResult DB storage tenant/patient constraint')
      : fail('LabResult DB storage tenant/patient constraint')
  )

  const actionSelect = findPolicy('NotificationAction', 'notification_action_member_select')
  const actionUpdate = findPolicy('NotificationAction', 'notification_action_member_update')
  checks.push(
    actionSelect?.qual?.includes('is_business_member') && actionSelect.qual.includes('auth.uid')
      ? ok('NotificationAction select RLS')
      : fail('NotificationAction select RLS', actionSelect?.qual ?? 'missing')
  )
  checks.push(
    actionUpdate?.qual?.includes('is_business_member') && actionUpdate.with_check?.includes('auth.uid')
      ? ok('NotificationAction update RLS')
      : fail('NotificationAction update RLS', actionUpdate?.with_check ?? actionUpdate?.qual ?? 'missing')
  )

  const participantInsert = findPolicy('ConversationParticipant', 'conversation_participant_member_insert')
  checks.push(
    participantInsert?.with_check?.includes('is_conversation_participant') &&
      participantInsert.with_check.includes('user_belongs_to_business')
      ? ok('Group chat add-member RLS')
      : fail('Group chat add-member RLS', participantInsert?.with_check ?? 'missing')
  )

  const reactionManage = findPolicy('MessageReaction', 'message_reaction_self_manage')
  checks.push(
    selfMatch(reactionManage?.qual) &&
      reactionManage?.qual?.includes('is_conversation_participant')
      ? ok('Emoji reaction self/manage RLS')
      : fail('Emoji reaction self/manage RLS', reactionManage?.qual ?? 'missing')
  )

  const reminderSelect = findPolicy('Reminder', 'reminder_self_select')
  const reminderUpdate = findPolicy('Reminder', 'reminder_self_update')
  checks.push(
    selfMatch(reminderSelect?.qual) && reminderSelect?.qual?.includes('is_business_member')
      ? ok('Reminder self/business select RLS')
      : fail('Reminder self/business select RLS', reminderSelect?.qual ?? 'missing')
  )
  checks.push(
    selfMatch(reminderUpdate?.qual) && selfMatch(reminderUpdate?.with_check)
      ? ok('Reminder self update RLS')
      : fail('Reminder self update RLS', reminderUpdate?.with_check ?? reminderUpdate?.qual ?? 'missing')
  )

  const pushInsert = findPolicy('PushSubscription', 'push_subscription_self_insert')
  const pushDelete = findPolicy('PushSubscription', 'push_subscription_self_delete')
  checks.push(
    selfMatch(pushInsert?.with_check) && pushInsert?.with_check?.includes('is_business_member')
      ? ok('Push subscription self insert RLS')
      : fail('Push subscription self insert RLS', pushInsert?.with_check ?? 'missing')
  )
  checks.push(
    selfMatch(pushDelete?.qual) && pushDelete?.qual?.includes('is_business_member')
      ? ok('Push subscription self delete RLS')
      : fail('Push subscription self delete RLS', pushDelete?.qual ?? 'missing')
  )

  const policiesByTable = new Map<string, typeof policies>()
  for (const policy of policies) {
    const list = policiesByTable.get(policy.tablename) ?? []
    list.push(policy)
    policiesByTable.set(policy.tablename, list)
  }

  for (const table of listBusinessIdScopedTables()) {
    const tablePolicies = policiesByTable.get(table) ?? []
    const scoped = tablePolicies.some((p) =>
      policyLooksBusinessScoped(p.qual, p.with_check)
    )
    checks.push(
      scoped
        ? ok(`RLS businessId policy: ${table}`)
        : fail(`RLS businessId policy: ${table}`, 'no is_business_member/has_business_permission policy')
    )
  }

  for (const table of listDenyPostgrestTables()) {
    const tablePolicies = policiesByTable.get(table) ?? []
    const denied = tablePolicies.some((p) => policyLooksDenyAll(p.qual, p.with_check))
    checks.push(
      denied
        ? ok(`RLS PostgREST deny: ${table}`)
        : fail(`RLS PostgREST deny: ${table}`, 'missing explicit deny policy')
    )
  }

  const buckets = await prisma.$queryRawUnsafe<Array<{ id: string; public: boolean }>>(
    `
      select id, public
      from storage.buckets
      where id in ('patient-files', 'message-media')
    `
  )
  const bucketMap = new Map(buckets.map((bucket) => [bucket.id, bucket.public]))
  checks.push(bucketMap.get('patient-files') === false ? ok('patient-files bucket is private') : fail('patient-files bucket is private'))
  checks.push(bucketMap.get('message-media') === false ? ok('message-media bucket is private') : fail('message-media bucket is private'))

  const storagePolicies = await prisma.$queryRawUnsafe<Array<{ policyname: string; qual: string | null; with_check: string | null }>>(
    `
      select policyname, qual, with_check
      from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname in ('patient_files_select', 'message_media_select', 'message_media_insert')
    `
  )
  const storagePolicyNames = new Set(storagePolicies.map((policy) => policy.policyname))
  checks.push(storagePolicyNames.has('patient_files_select') ? ok('patient file storage select policy') : fail('patient file storage select policy'))
  checks.push(storagePolicyNames.has('message_media_select') ? ok('message media storage select policy') : fail('message media storage select policy'))
  checks.push(storagePolicyNames.has('message_media_insert') ? ok('message media storage insert policy') : fail('message media storage insert policy'))

  const realtimeTables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    `
      select tablename
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename in ('Notification', 'Message', 'MessageReaction', 'ConversationParticipant')
    `
  )
  const realtimeSet = new Set(realtimeTables.map((row) => row.tablename))
  for (const table of ['Notification', 'Message', 'MessageReaction', 'ConversationParticipant']) {
    checks.push(realtimeSet.has(table) ? ok(`Realtime enabled: ${table}`) : fail(`Realtime enabled: ${table}`))
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const storageKey = `smoke-tests/${crypto.randomUUID()}.txt`
    const upload = await supabase.storage
      .from('message-media')
      .upload(storageKey, new Blob(['signed-url-smoke-test'], { type: 'text/plain' }), {
        contentType: 'text/plain',
        upsert: false,
      })

    if (upload.error) {
      checks.push(fail('message-media signed URL smoke upload', upload.error.message))
    } else {
      const signed = await supabase.storage.from('message-media').createSignedUrl(storageKey, 60)
      if (signed.error || !signed.data?.signedUrl) {
        checks.push(fail('message-media signed URL create', signed.error?.message ?? 'missing URL'))
      } else {
        const response = await fetch(signed.data.signedUrl)
        checks.push(
          response.ok
            ? ok('message-media private signed URL opens')
            : fail('message-media private signed URL opens', `HTTP ${response.status}`)
        )
      }
      await supabase.storage.from('message-media').remove([storageKey])
    }
  } else {
    checks.push(fail('message-media signed URL smoke test', 'missing Supabase service role env'))
  }

  // S2 Dilim-C: asistan_app role readiness (warn-level fail when missing in production intent)
  const appRoles = await prisma.$queryRawUnsafe<Array<{ rolname: string; rolbypassrls: boolean }>>(
    `SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname IN ('asistan_app', 'asistan_identity')`
  )
  const roleMap = new Map(appRoles.map((r) => [r.rolname, r]))
  for (const name of ['asistan_app', 'asistan_identity']) {
    const row = roleMap.get(name)
    if (!row) {
      checks.push(
        fail(
          `DB role ${name}`,
          'missing — apply 20260720000200_prisma_guc_rls.sql then pnpm smoke:asistan-app-rls'
        )
      )
    } else if (row.rolbypassrls) {
      checks.push(fail(`DB role ${name} NOBYPASSRLS`, 'BYPASSRLS still enabled'))
    } else {
      checks.push(ok(`DB role ${name} NOBYPASSRLS`))
    }
  }

  const failed = checks.filter((check) => !check.pass)
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? ` - ${check.detail}` : ''}`)
  }

  if (failed.length > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
