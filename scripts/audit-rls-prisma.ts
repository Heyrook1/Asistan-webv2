/**
 * Offline audit: Prisma model names vs RLS inventory + migration mentions.
 * Does not need a live DB — run via `pnpm check:rls-inventory`.
 */
import fs from 'node:fs'
import path from 'node:path'

import {
  LEGACY_PUBLIC_TABLES_DROP_ORDER,
  LEGACY_SNAKE_RLS_TABLES,
} from '../lib/security/legacy-schema'
import {
  RLS_ECOSYSTEM_DENY_TABLES,
  RLS_IDENTITY_LEDGER_DENY_TABLES,
  RLS_LEAD_CAPTURE_DENY_TABLES,
  RLS_PARITY_GAP_TABLES,
  listRequiredRlsTableNames,
} from '../lib/security/rls-inventory'

const root = path.join(__dirname, '..')
const schemaPath = path.join(root, 'prisma', 'schema.prisma')
const migrationsDir = path.join(root, 'supabase', 'migrations')
const parityMigration = path.join(migrationsDir, '20260714000400_rls_prisma_parity.sql')
const personRlsMigration = path.join(migrationsDir, '20260716000100_person_identity_rls.sql')
const identityLedgerMigration = path.join(
  migrationsDir,
  '20260810000400_person_identity_merge_ledger.sql'
)
const leadCaptureMigration = path.join(migrationsDir, '20260811000100_lead_capture_deny_rls.sql')
const phiRlsMigration = path.join(migrationsDir, '20260717000100_rls_phi_business_scope_hardening.sql')
const textCastMigration = path.join(migrationsDir, '20260717000200_rls_auth_uid_text_cast.sql')
const dropLegacyMigration = path.join(migrationsDir, '20260716000200_drop_legacy_snake_schema.sql')
const DROP_LEGACY_MIGRATION_BASENAME = '20260716000200_drop_legacy_snake_schema.sql'

function prismaModels(source: string) {
  return [...source.matchAll(/^model\s+(\w+)\s+\{/gm)].map((m) => m[1])
}

function main() {
  const schema = fs.readFileSync(schemaPath, 'utf8')
  const models = prismaModels(schema)
  const required = new Set(listRequiredRlsTableNames())
  const gaps = new Set(RLS_PARITY_GAP_TABLES)
  const ecosystem = new Set(RLS_ECOSYSTEM_DENY_TABLES)

  const missingFromInventory = models.filter((name) => !required.has(name))
  const inventoryNotInPrisma = [...required].filter((name) => !models.includes(name))

  const paritySql = fs.readFileSync(parityMigration, 'utf8')
  const gapsMissingInMigration = [...gaps].filter(
    (table) => !paritySql.includes(`'${table}'`) && !paritySql.includes(`"${table}"`)
  )

  // Each deny-by-default group must be named in the migration that establishes
  // its posture. A table can sit in the inventory and still have no RLS shipped —
  // that is exactly how PersonIdentityMergeLedger reached production unprotected.
  const denyGroups: { label: string; tables: readonly string[]; migration: string }[] = [
    {
      label: '20260716000100 (ecosystem deny)',
      tables: RLS_ECOSYSTEM_DENY_TABLES,
      migration: personRlsMigration,
    },
    {
      label: '20260810000400 (identity merge ledger)',
      tables: RLS_IDENTITY_LEDGER_DENY_TABLES,
      migration: identityLedgerMigration,
    },
    {
      label: '20260811000100 (lead capture deny)',
      tables: RLS_LEAD_CAPTURE_DENY_TABLES,
      migration: leadCaptureMigration,
    },
  ]

  const denyGroupIssues: string[] = []
  for (const group of denyGroups) {
    const sql = fs.readFileSync(group.migration, 'utf8')
    const missing = group.tables.filter(
      (table) => !sql.includes(`'${table}'`) && !sql.includes(`"${table}"`)
    )
    if (missing.length) {
      denyGroupIssues.push(`${group.label}: ${missing.join(', ')}`)
    }
    // Naming the table is not enough — the migration must actually turn RLS on.
    if (!/enable row level security/i.test(sql)) {
      denyGroupIssues.push(`${group.label}: migration never enables row level security`)
    }
  }

  const phiSql = fs.readFileSync(phiRlsMigration, 'utf8')
  const textCastSql = fs.readFileSync(textCastMigration, 'utf8')
  const phiGaps = [
    'waitlist_deny_authenticated',
    'review_member_select',
    'appointment_client_select',
    'client_notification_business_select',
  ]
  const phiMissing = phiGaps.filter((name) => !phiSql.includes(name))
  const textCastMissing = !textCastSql.includes('returns text[]')
    || !textCastSql.includes('is_business_member(target_business_id text)')

  const dropSql = fs.readFileSync(dropLegacyMigration, 'utf8')
  const legacyMissingFromDrop = [...LEGACY_PUBLIC_TABLES_DROP_ORDER].filter(
    (table) => !dropSql.includes(`public.${table}`)
  )

  const legacyHits: string[] = []
  for (const file of fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql') && !f.startsWith('__'))) {
    // Drop migration intentionally references legacy names; other 202606+ files must not.
    if (file === DROP_LEGACY_MIGRATION_BASENAME) continue
    if (!file.startsWith('202607') && !file.startsWith('202606')) continue
    const body = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    for (const legacy of LEGACY_SNAKE_RLS_TABLES) {
      if (body.includes(`public.${legacy}`) || body.includes(`on public.${legacy}`)) {
        legacyHits.push(`${file}: ${legacy}`)
      }
    }
  }

  const issues: string[] = []
  if (missingFromInventory.length) {
    issues.push(`Prisma models missing from RLS inventory: ${missingFromInventory.join(', ')}`)
  }
  if (inventoryNotInPrisma.length) {
    issues.push(`RLS inventory tables not in Prisma: ${inventoryNotInPrisma.join(', ')}`)
  }
  if (gapsMissingInMigration.length) {
    issues.push(`Parity gaps not mentioned in 20260714000400: ${gapsMissingInMigration.join(', ')}`)
  }
  if (denyGroupIssues.length) {
    issues.push(`Deny-default tables not covered by their migration — ${denyGroupIssues.join(' | ')}`)
  }
  if (phiMissing.length) {
    issues.push(`PHI hardening migration missing policies: ${phiMissing.join(', ')}`)
  }
  if (textCastMissing) {
    issues.push('Text id / auth.uid cast migration missing helper parity (20260717000200)')
  }
  if (legacyMissingFromDrop.length) {
    issues.push(`Legacy tables missing from drop migration: ${legacyMissingFromDrop.join(', ')}`)
  }
  if (legacyHits.length) {
    issues.push(`New migrations still targeting legacy snake_case: ${legacyHits.join('; ')}`)
  }

  console.log('RLS inventory audit')
  console.log(`  Prisma models: ${models.length}`)
  console.log(`  Required RLS tables: ${required.size}`)
  console.log(`  Parity gap tables: ${gaps.size}`)
  console.log(`  Ecosystem deny tables: ${ecosystem.size}`)
  console.log(`  Legacy public tables (drop inventory): ${LEGACY_PUBLIC_TABLES_DROP_ORDER.length}`)

  if (issues.length) {
    console.error('\nFAILED')
    for (const issue of issues) console.error(`  - ${issue}`)
    process.exit(1)
  }

  console.log(
    '\nOK — inventory covers Prisma models; parity + Person RLS + legacy drop migrations aligned; no new snake_case drift.'
  )
}

main()
