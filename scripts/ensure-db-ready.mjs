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

/**
 * `pnpm dev` runs this through `predev`, and `pnpm e2e` reaches it through
 * playwright's webServer. Both then apply RLS DDL to whatever DATABASE_URL
 * points at — and in this repo .env.local points at production. Refuse to write
 * to a remote database from an interactive dev run unless it is asked for.
 */
function isRemoteTarget() {
  const raw =
    process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING
  if (!raw) return false
  try {
    const host = new URL(raw).hostname.toLowerCase()
    return !(host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === 'db')
  } catch {
    return false
  }
}

function guardRemoteWrite() {
  // CI applies the stack on purpose (deploy job), so never block there.
  if (process.env.CI) return false
  if (process.env.ASISTAN_ALLOW_REMOTE_DB_WRITE === '1') return false
  if (!isRemoteTarget()) return false

  console.warn(
    [
      '',
      '[db] REFUSING to apply the RLS stack to a remote database from a local run.',
      '[db] DATABASE_URL/DIRECT_URL points somewhere that is not localhost, and this',
      '[db] step issues DDL. In this repo .env.local targets production.',
      '',
      '[db] If you meant it:  ASISTAN_ALLOW_REMOTE_DB_WRITE=1 pnpm db:ready',
      '[db] To just skip it:  SKIP_DB_READY=1 pnpm dev',
      '',
      '[db] Continuing without applying anything.',
      '',
    ].join('\n'),
  )
  return true
}

async function main() {
  if (process.env.SKIP_DB_READY === '1') {
    console.log('[db] Skip ensure-db-ready (SKIP_DB_READY=1)')
    return
  }

  if (guardRemoteWrite()) return

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
