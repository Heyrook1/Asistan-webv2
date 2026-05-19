import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

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

  const requiredRlsTables = [
    'Business',
    'User',
    'Patient',
    'Appointment',
    'PatientFile',
    'PatientNote',
    'Medication',
    'Allergy',
    'Treatment',
    'LabResult',
    'Service',
    'TeamMember',
    'Notification',
    'NotificationAction',
    'Conversation',
    'ConversationParticipant',
    'Message',
    'MessageAttachment',
    'MessageReaction',
  ]

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
    reactionManage?.qual?.includes('"userId" = auth.uid()') &&
      reactionManage.qual.includes('is_conversation_participant')
      ? ok('Emoji reaction self/manage RLS')
      : fail('Emoji reaction self/manage RLS', reactionManage?.qual ?? 'missing')
  )

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
