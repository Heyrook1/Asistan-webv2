/**
 * Apply DB readiness: Prisma migrations (optional) + Supabase RLS stack.
 *
 * Usage:
 *   node scripts/ensure-db-ready.mjs           # RLS only
 *   node scripts/ensure-db-ready.mjs --prisma  # prisma migrate deploy + RLS
 *
 * Skips silently when DATABASE_URL is unset (local lint/CI without secrets).
 * Set SKIP_DB_READY=1 to force skip.
 */
import { spawnSync } from 'node:child_process'

import { runRlsStackApply } from './lib/rls-stack.mjs'

const args = new Set(process.argv.slice(2))
const withPrisma = args.has('--prisma')

async function main() {
  if (process.env.SKIP_DB_READY === '1') {
    console.log('[db] Skip ensure-db-ready (SKIP_DB_READY=1)')
    return
  }

  if (withPrisma) {
    console.log('[db] Running prisma migrate deploy...')
    const prisma = spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    if (prisma.status !== 0) {
      process.exit(prisma.status ?? 1)
    }
  }

  await runRlsStackApply({ label: 'Supabase RLS stack' })
}

main().catch((error) => {
  console.error('[db] ensure-db-ready failed:', error.message)
  process.exit(1)
})
