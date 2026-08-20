#!/usr/bin/env node
/**
 * P0.8 — Paid-pilot security gate evidence runner (unit / offline).
 * Live DB smokes (cross-tenant, asistan_app RLS) remain ops-gated — see docs/p0.8-paid-pilot-security-gates.md
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

const evidenceTests = [
  'tests/unit/tenant-write-scope.test.ts',
  'tests/unit/assert-tenant.test.ts',
  'tests/unit/tenant-db-context.test.ts',
  'tests/unit/rls-policy-inventory.test.ts',
  'tests/unit/security-ops.test.ts',
  'tests/unit/team-super-admin-gate.test.ts',
  'tests/unit/rbac.test.ts',
  'tests/unit/security-i18n-booking.test.ts',
  'tests/unit/cron-auth.test.ts',
  'tests/unit/identity-normalize.test.ts',
  'tests/unit/booking-idempotency.test.ts',
  'tests/unit/patient-channel-delivery.test.ts',
  'tests/unit/rate-limit-memory-fallback.test.ts',
]

const result = spawnSync(
  'pnpm',
  ['exec', 'vitest', 'run', ...evidenceTests],
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' }
)

if (result.status !== 0) {
  console.error('\n[P0.8] Evidence unit suite FAILED — paid pilot blocked on automated gates.')
  process.exit(result.status ?? 1)
}

console.log(`
[P0.8] Offline evidence suite PASS (${evidenceTests.length} files).

Still required before paid production (ops / live):
  1. pnpm smoke:asistan-app-rls
  2. pnpm smoke:cross-tenant
  3. pnpm check:production   (asistan_app role + schema columns)
  4. Confirm UPSTASH_REDIS_* if multi-instance
  5. Confirm SMS/WA provider webhooks (fail-visible already; delivery ops)

See docs/p0.8-paid-pilot-security-gates.md
`)
