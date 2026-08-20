import '@testing-library/jest-dom/vitest'

/**
 * Deterministic env for unit tests.
 *
 * `lib/env.ts` validates at import time and throws, so any test that
 * transitively reaches it (e.g. lib/identity/resolve → lib/prisma-owner)
 * fails at collection with "Invalid environment configuration" rather than a
 * test assertion. CI supplies these at the workflow level, which is why those
 * suites passed there and failed on every developer machine.
 *
 * These mirror the CI placeholders on purpose. Never load .env.local here —
 * that file holds production credentials.
 */
const TEST_ENV: Record<string, string> = {
  DATABASE_URL: 'postgresql://ci:ci@localhost:5432/ci?schema=public',
  DIRECT_URL: 'postgresql://ci:ci@localhost:5432/ci?schema=public',
  NEXT_PUBLIC_SUPABASE_URL: 'https://ci-placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'ci-anon-key-not-for-production',
  PERSON_IDENTITY_PEPPER: 'ci-person-identity-pepper-do-not-use',
}

for (const [key, value] of Object.entries(TEST_ENV)) {
  // Real env wins, so CI secrets and deliberate local overrides still apply.
  process.env[key] ??= value
}
