/**
 * Ops privilege guard for scripts that use Supabase service_role and/or
 * Postgres owner connections (bypass Auth/Storage RLS or FORCE RLS).
 *
 * Usage:
 *   import { requireElevatedOps } from './lib/privilege-guard.mjs'
 *   requireElevatedOps({
 *     script: 'migrate-patient-files-to-storage',
 *     purpose: 'Upload PHI files via Storage admin API',
 *     surfaces: ['supabase-service-role', 'postgres-owner'],
 *   })
 *
 * Remote / production targets require explicit confirmation:
 *   --i-know-this-bypasses-rls
 *   or ASISTAN_ALLOW_SERVICE_ROLE=1
 */
import { pathToFileURL } from 'node:url'

/** @param {string | undefined} url */
export function hostLooksLocal(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const host = new URL(url).hostname.toLowerCase()
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.localhost')
    )
  } catch {
    const lower = url.toLowerCase()
    return lower.includes('localhost') || lower.includes('127.0.0.1')
  }
}

/** @param {string | undefined} connectionString */
export function postgresLooksLocal(connectionString) {
  if (!connectionString) return false
  if (hostLooksLocal(connectionString.replace(/^postgresql?/i, 'http'))) return true
  const lower = connectionString.toLowerCase()
  return lower.includes('@localhost') || lower.includes('@127.0.0.1')
}

/**
 * @param {{
 *   script: string
 *   purpose: string
 *   surfaces?: Array<'supabase-service-role' | 'postgres-owner' | 'tenant-bypass'>
 *   argv?: string[]
 *   env?: Record<string, string | undefined>
 *   exit?: (code: number) => void
 *   log?: (...args: unknown[]) => void
 * }} input
 */
export function requireElevatedOps(input) {
  const argv = input.argv ?? process.argv
  const env = input.env ?? process.env
  const log = input.log ?? console.warn
  const exit = input.exit ?? ((code) => process.exit(code))
  const surfaces = input.surfaces?.length
    ? input.surfaces
    : ['supabase-service-role']

  const confirmed =
    argv.includes('--i-know-this-bypasses-rls') ||
    env.ASISTAN_ALLOW_SERVICE_ROLE === '1'

  const supabaseUrl = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
  const dbUrl =
    env.DATABASE_URL_MIGRATE ??
    env.DIRECT_URL ??
    env.POSTGRES_URL_NON_POOLING ??
    env.DATABASE_URL

  const remote =
    (!!supabaseUrl && !hostLooksLocal(supabaseUrl)) ||
    (!!dbUrl && !postgresLooksLocal(dbUrl))

  const productionLike =
    env.NODE_ENV === 'production' ||
    env.ASISTAN_OPS_TARGET === 'production' ||
    env.VERCEL_ENV === 'production'

  log(`[privilege] script=${input.script}`)
  log(`[privilege] purpose=${input.purpose}`)
  log(`[privilege] surfaces=${surfaces.join(',')}`)
  log(
    `[privilege] target=${productionLike ? 'production-like' : remote ? 'remote' : 'local'}` +
      (confirmed ? ' confirmed=yes' : ' confirmed=no')
  )

  if ((remote || productionLike) && !confirmed) {
    log(
      '[privilege] REFUSED: elevated script against remote/production without confirmation.\n' +
        '  Re-run with --i-know-this-bypasses-rls\n' +
        '  or set ASISTAN_ALLOW_SERVICE_ROLE=1 (CI/rollout only).\n' +
        '  Prefer asistan_app runtime + asistan_identity SET LOCAL ROLE for app paths.\n' +
        '  See docs/security-ops.md § Privilege ladder.'
    )
    exit(1)
    return { ok: false }
  }

  return { ok: true, remote, productionLike, confirmed }
}

// Allow `node scripts/lib/privilege-guard.mjs` self-check
const isMain =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
if (isMain) {
  console.log('privilege-guard: import from scripts only; see docs/security-ops.md')
}
