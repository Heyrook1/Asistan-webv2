/**
 * Fail CI / local check if NEXT_PUBLIC_* secrets leak or unknown public keys appear.
 *
 *   pnpm check:public-env
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  findPublicEnvViolations,
  NEXT_PUBLIC_ALLOWLIST,
  SERVER_SECRET_ENV_HINTS,
  type PublicEnvFinding,
} from '@/lib/security/public-env-allowlist'

function keysFromEnvFile(path: string): string[] {
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => line.slice(0, line.indexOf('=')).trim())
}

function keysFromEnvTs(): string[] {
  const path = resolve('lib/env.ts')
  const src = readFileSync(path, 'utf8')
  const keys: string[] = []
  for (const match of src.matchAll(/\b(NEXT_PUBLIC_[A-Z0-9_]+)\s*:/g)) {
    keys.push(match[1])
  }
  return keys
}

const collected = new Set([
  ...Object.keys(process.env).filter((k) => k.startsWith('NEXT_PUBLIC_')),
  ...keysFromEnvTs(),
  ...keysFromEnvFile('.env'),
  ...keysFromEnvFile('.env.local'),
  ...keysFromEnvFile('.env.example'),
])

const violations: PublicEnvFinding[] = findPublicEnvViolations(collected)

for (const secret of SERVER_SECRET_ENV_HINTS) {
  const twin = `NEXT_PUBLIC_${secret}`
  if (collected.has(twin) || process.env[twin]) {
    violations.push({
      key: twin,
      reason: 'forbidden-substring',
      detail: `server secret twin of ${secret}`,
    })
  }
}

console.log(`[public-env] allowlist size=${NEXT_PUBLIC_ALLOWLIST.size}`)
console.log(`[public-env] scanned keys=${collected.size}`)

if (violations.length > 0) {
  console.error('[public-env] FAIL — browser-exposed env violations:')
  for (const v of violations) {
    console.error(`  - ${v.key} (${v.reason}${v.detail ? `: ${v.detail}` : ''})`)
  }
  console.error('See docs/security-ops.md § Public env allowlist')
  process.exit(1)
}

console.log('[public-env] OK — Anon/VAPID/Sentry public only; no secret leak patterns')
