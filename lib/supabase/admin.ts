import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Supabase **Auth Admin / Storage Admin** client (JWT `service_role`).
 *
 * This is NOT Postgres BYPASSRLS and must not be used for PHI SQL.
 * Prefer: `asistan_app` + GUC for clinic data; `SET LOCAL ROLE asistan_identity`
 * for Person; owner URL only in migrate/smoke scripts.
 *
 * Allowed app uses: team invite / password reset (`lib/actions/team.ts`),
 * signed storage ops that already go through `lib/storage.ts`.
 * Ops scripts: see `scripts/lib/privilege-guard.mjs` + `docs/security-ops.md`.
 */
export function createAdminClient() {
  if (!env.supabaseServiceRoleKey) return null

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
