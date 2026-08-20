const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

/** Only files where every $transaction callback has session.businessId in scope */
const SESSION_FILES = [
  'lib/actions/patients.ts',
  'lib/actions/appointments.ts',
  'lib/actions/intake-forms.ts',
  'lib/actions/team.ts',
  'lib/actions/messages.ts',
]

function ensureImport(src) {
  if (src.includes('tenantTransaction')) return src
  if (src.includes("from '@/lib/security/tenant-db-context'")) {
    return src.replace(
      /import \{([^}]+)\} from '@\/lib\/security\/tenant-db-context'/,
      (m, inner) => {
        const parts = inner
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (!parts.includes('tenantTransaction')) parts.push('tenantTransaction')
        return `import { ${parts.join(', ')} } from '@/lib/security/tenant-db-context'`
      },
    )
  }
  return src.replace(
    /import \{ prisma \} from '@\/lib\/prisma'\n/,
    `import { prisma } from '@/lib/prisma'\nimport { tenantTransaction } from '@/lib/security/tenant-db-context'\n`,
  )
}

function wrap(src) {
  let out = src.replace(
    /prisma\.\$transaction\(async \(tx\) => \{/g,
    'tenantTransaction(session.businessId, async (tx) => {',
  )
  out = out.replace(
    /tenantTransaction\(([^,]+), async \(tx\) => \{\r?\n(\s*)await setTenantBusinessId\(tx, [^)]+\)\r?\n/g,
    'tenantTransaction($1, async (tx) => {\n',
  )
  return out
}

for (const rel of SESSION_FILES) {
  const file = path.join(ROOT, rel)
  let src = fs.readFileSync(file, 'utf8')
  src = ensureImport(src)
  src = wrap(src)
  if (rel.includes('patients.ts')) {
    src = src.replace(
      /const businessId = session\.businessId\r?\n\r?\n  try \{\r?\n    const patient = await tenantTransaction\(session\.businessId,/,
      'const businessId = session.businessId\n\n  try {\n    const patient = await tenantTransaction(businessId,',
    )
  }
  fs.writeFileSync(file, src)
  console.log('updated', rel)
}

// prescriptions: use tenantTransaction + advisory lock (manual follow-up in TS)
{
  const file = path.join(ROOT, 'lib/actions/prescriptions.ts')
  let src = fs.readFileSync(file, 'utf8')
  src = ensureImport(src)
  src = src.replace(
    /return prisma\.\$transaction\(async \(tx\) => \{/,
    'return tenantTransaction(session.businessId, async (tx) => {',
  )
  fs.writeFileSync(file, src)
  console.log('updated lib/actions/prescriptions.ts')
}

// patient-import: businessId arg
{
  const file = path.join(ROOT, 'lib/actions/patient-import.ts')
  let src = fs.readFileSync(file, 'utf8')
  src = ensureImport(src)
  src = src.replace(
    /return prisma\.\$transaction\(async \(tx\) => \{/,
    'return tenantTransaction(businessId, async (tx) => {',
  )
  fs.writeFileSync(file, src)
  console.log('updated lib/actions/patient-import.ts')
}

console.log('done')
