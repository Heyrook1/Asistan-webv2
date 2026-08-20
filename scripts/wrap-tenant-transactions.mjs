/**
 * One-shot: wrap clinic action $transaction calls with tenantTransaction(businessId, …)
 * when session.businessId / businessId is in lexical scope (heuristic).
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

const FILES = [
  'lib/actions/patients.ts',
  'lib/actions/appointments.ts',
  'lib/actions/prescriptions.ts',
  'lib/actions/intake-forms.ts',
  'lib/actions/patient-import.ts',
  'lib/actions/notifications.ts',
  'lib/actions/team.ts',
  'lib/actions/messages.ts',
  'lib/actions/services.ts',
  'lib/actions/reminders.ts',
  'lib/actions/business.ts',
]

function ensureImport(src) {
  if (src.includes("from '@/lib/security/tenant-db-context'")) {
    // Prefer tenantTransaction; keep setTenantBusinessId if already imported
    if (!src.includes('tenantTransaction')) {
      return src.replace(
        /import \{([^}]+)\} from '@\/lib\/security\/tenant-db-context'/,
        (m, inner) => {
          const parts = inner.split(',').map((s) => s.trim()).filter(Boolean)
          if (!parts.includes('tenantTransaction')) parts.push('tenantTransaction')
          return `import { ${parts.join(', ')} } from '@/lib/security/tenant-db-context'`
        },
      )
    }
    return src
  }
  if (!src.includes("from '@/lib/prisma'")) return src
  return src.replace(
    /import \{ prisma \} from '@\/lib\/prisma'\n/,
    `import { prisma } from '@/lib/prisma'\nimport { tenantTransaction } from '@/lib/security/tenant-db-context'\n`,
  )
}

function wrapTransactions(src) {
  // prisma.$transaction(async (tx) => {  → tenantTransaction(session.businessId, async (tx) => {
  // Prefer session.businessId; callers that only have businessId local still work if we use a fallback expression.
  let out = src.replace(
    /prisma\.\$transaction\(async \(tx\) => \{/g,
    'tenantTransaction(session.businessId, async (tx) => {',
  )
  // createPatient uses const businessId = session.businessId — fix those that now wrongly use session when
  // we're inside a scope that already aliased. Heuristic: if file has `const businessId = session.businessId`
  // and create path, replace first occurrence block manually later if needed.
  // Remove redundant setTenantBusinessId right after tenantTransaction open
  out = out.replace(
    /tenantTransaction\(([^,]+), async \(tx\) => \{\n(\s*)await setTenantBusinessId\(tx, [^)]+\)\n/g,
    'tenantTransaction($1, async (tx) => {\n',
  )
  return out
}

for (const rel of FILES) {
  const file = path.join(ROOT, rel)
  if (!fs.existsSync(file)) {
    console.log('skip missing', rel)
    continue
  }
  let src = fs.readFileSync(file, 'utf8')
  if (!src.includes('$transaction')) {
    console.log('no tx', rel)
    continue
  }
  src = ensureImport(src)
  src = wrapTransactions(src)
  // patients createPatient: businessId local — use businessId not session.businessId inside that try block
  if (rel.includes('patients.ts')) {
    src = src.replace(
      /const businessId = session\.businessId\n\n  try \{\n    const patient = await tenantTransaction\(session\.businessId,/,
      'const businessId = session.businessId\n\n  try {\n    const patient = await tenantTransaction(businessId,',
    )
  }
  fs.writeFileSync(file, src)
  console.log('updated', rel)
}
