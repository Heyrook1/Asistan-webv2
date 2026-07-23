# Security ops — rate limit + RLS inventory + tenant guard

## Rate limit (unified)

| Surface | Module |
|---------|--------|
| Public API keys (`waitlist`, `/api/public/*`) | `lib/rate-limit.ts` → `consumeRateLimit` |
| Session actions (messages) | `lib/security/rate-limit.ts` → `checkRateLimit` |
| Shared backend | Upstash Redis REST when configured; else in-process memory |

**Prod rule:** set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`. Without them, memory fallback logs once in production and does **not** share counters across instances.

`pnpm check:production` fails if Upstash env is missing.

## RLS inventory

| Source | Role |
|--------|------|
| `lib/security/rls-inventory.ts` | Canonical PascalCase table list (RLS required on all) |
| `lib/security/rls-policy-inventory.ts` | PHI policy expectations (businessId / deny / self-scoped) |
| `20260516000100_enable_rls.sql` | **Legacy** snake_case era — do not extend |
| `20260518000200_*` + messaging/client | Baseline PascalCase RLS |
| `20260714000400_rls_prisma_parity.sql` | Gap close (Location, Intake*, CalendarConnection, governance, …) |
| `20260716000100_person_identity_rls.sql` | Person / PersonIdentityMatch / BookingIdempotency deny-default |
| `20260717000100_rls_phi_business_scope_hardening.sql` | Waitlist deny + Review/Appointment/ClientNotification gap-close |
| `20260717000200_rls_auth_uid_text_cast.sql` | Prisma text ids + `auth.uid()::text` helper parity |
| `20260717000300_production_query_indexes.sql` | Appointment / patient search / notification polling indexes (+ `pg_trgm`) |
| `20260720000200_prisma_guc_rls.sql` | `asistan_app` / `asistan_identity` + FORCE RLS + GUC policies |

Canonical index names: `lib/security/query-index-inventory.ts`.

### Commands

```bash
pnpm db:deploy             # prisma migrate deploy + RLS stack (production)
pnpm db:ready              # RLS stack only (idempotent; skips if no DATABASE_URL)
pnpm db:files:migrate      # PatientFile/LabResult base64 → Storage (dry-run; --apply --validate)
pnpm check:rls-inventory   # offline: Prisma models ↔ inventory ↔ parity + Person SQL
pnpm check:rls-policies    # live DB: businessId policies on PHI tables + deny-default
pnpm check:production      # live DB: RLS enabled on all required tables + Upstash
```

`pnpm dev` runs `predev` → `ensure-db-ready` (RLS + production query indexes when `.env.local` has a DB URL).

Apply parity + Person + PHI hardening migrations on each environment before relying on the new checks — or use `pnpm db:deploy` once.

## HTTP security headers

| Layer | Location | Role |
|-------|----------|------|
| Static (all hosts) | `next.config.mjs` `headers()` | CSP + `X-Frame-Options: SAMEORIGIN` (except `/book/*`) + HSTS / nosniff / Referrer / Permissions-Policy |
| Dynamic | `proxy.ts` → `lib/security/response-headers.ts` | Path-aware CSP; allows `/book/?embed=1` iframe embeds via `frame-ancestors https:` (drops XFO on that surface only) |

Vercel/`vercel.json` is not used. Headers ship with the Next.js process on any host.

## Patient file storage (no inline base64)

| Piece | Location |
|-------|----------|
| Private bucket | `patient-files` (created by `20260518000200`, `public=false`) |
| Upload path | `lib/storage.ts` → `uploadPatientFile` (`businessId/patientId/uuid-name`) |
| Read path | `lib/queries.ts` → batch signed URLs (10 min TTL) |
| Write validation | `lib/actions/patients.ts` → `storage://patient-files/` refs only |
| DB constraints | `PatientFile_storage_reference_check`, `LabResult_storage_reference_check`, `MessageAttachment_storage_reference_check` (**VALIDATED**) |
| Legacy migration | `scripts/migrate-patient-files-to-storage.mjs` (dry-run default; `--apply --validate`) |

Storage RLS on `storage.objects` enforces `file.view` / `patient.edit` per business + patient folder.

## Prisma tenant guard (defense in depth)

Two doors:

| Door | What it protects | When it applies |
|------|------------------|-----------------|
| **App** | Prisma `$use` middleware | Always (prod/test `enforce`) |
| **DB** | `asistan_app` + FORCE RLS + GUC `app.business_id` | After `20260720000200_prisma_guc_rls.sql` and runtime `DATABASE_URL` uses `asistan_app` |

### Application layer

| Piece | Location |
|-------|----------|
| Middleware | `lib/prisma.ts` → `applyTenantGuard` |
| Rules | `lib/security/tenant-guard.ts` |
| Explicit same-tenant assert | `lib/security/assert-tenant.ts` → `assertSameTenant` |
| Explicit bypass | `runWithTenantBypass` / `runWithTenantBypassAsync` |
| GUC transaction helper | `lib/security/tenant-db-context.ts` → `withTenantDb` / `setTenantBusinessId` |
| Bypass ALS | **`globalThis.__asistanTenantBypassALS` singleton** — Turbopack may evaluate the module twice; without a shared ALS, marketplace/`Promise.all` bypass is invisible to Prisma `$use` and spams `[tenant-guard] TeamMember.findMany…` |

**Mode** (`ASISTAN_TENANT_GUARD`):

| Value | Behavior |
|-------|----------|
| `enforce` | Throw `TenantGuardError` (default in `production` + `test`) |
| `warn` | `console.warn` only (default in `development`) |
| `off` | Disabled |

Tenant-scoped models must include `businessId` in `where`/`data`, or an alternate scope (`clientUserId` for patient-owned Appointment/Review/ClientNotification). Prefer `updateMany`/`deleteMany`/`findFirst` with scope — never id-only `update`/`findUnique` on PHI.

### Client mutation rate limits

Auth'd writes use `rateLimitClientMutation` (`lib/client-marketplace/mutation-rate-limit.ts`): per-user + looser per-IP.

| Route | Cap (user / min) |
|-------|------------------|
| `POST /api/client/bookings` | 15 |
| `POST …/appointments/[id]/cancel` | 15 |
| `POST …/appointments/[id]/reschedule` | 15 |
| `POST /api/client/reviews` | 10 |

Cron/webhook/health: see fail-closed auth + RL in route headers (`CRON_SECRET`, Meta HMAC / slug-bound bearer, health 30/min).

**BUG-002:** `/api/cron/appointment-reminders` and `/api/cron/google-calendar-sync` never fail-open — missing/blank `CRON_SECRET` → `503` in every `NODE_ENV` (same posture as Stripe webhook secret).

### Declared tenant-guard bypass call sites

Canonical list: **Privilege ladder** section below (keep in sync on every new `runWithTenantBypass*`).

### Database layer (Dilim C)

Migration: `supabase/migrations/20260720000200_prisma_guc_rls.sql`

| Role | Use |
|------|-----|
| `asistan_app` | Clinic runtime `DATABASE_URL` — NOBYPASSRLS; PHI rows require `current_setting('app.business_id')` |
| `asistan_identity` | Person / PersonIdentityMatch / BookingIdempotency |
| Table owner | `DATABASE_URL_MIGRATE` / `DIRECT_URL` — DDL + emergency rollback |

**Staging smoke (after pointing `DATABASE_URL` at `asistan_app`):**

```sql
-- As asistan_app, no GUC → PHI empty
SELECT count(*) FROM "Appointment";  -- expect 0

SELECT set_config('app.business_id', '<clinic-a-id>', true);
SELECT count(*) FROM "Appointment";  -- expect only clinic A

SELECT set_config('app.business_id', '<clinic-b-id>', true);
SELECT count(*) FROM "Appointment" WHERE id = '<clinic-a-appointment-id>';  -- expect 0
```

**Rollback:** point `DATABASE_URL` back at the owner role; policies/roles may remain.

Env: optional `DATABASE_URL_MIGRATE` (see `lib/env.ts` → `databaseUrlMigrate`).

Ops smoke: `pnpm smoke:asistan-app-rls` (optional `ASISTAN_APP_DATABASE_URL` for live probe).

CI (I4): `tenant-isolation` job runs `smoke:asistan-app-rls` + `smoke:cross-tenant` on PR/push when `DATABASE_URL_MIGRATE` + `ASISTAN_APP_DATABASE_URL` secrets exist; included in `CI passed` gate. Bundle + Lighthouse budgets: `docs/ci-perf-tenant-gate.md`.

### Session bootstrap under `asistan_app`

`lib/session.ts` uses `sessionPrisma()` (`DATABASE_URL_MIGRATE` / `DIRECT_URL` when distinct from runtime `DATABASE_URL`) so User/Business membership resolution is not blocked by auth.uid()-only RLS.

Also apply: `pnpm db:asistan-app:session-bootstrap` (`20260721000700_asistan_app_session_bootstrap.sql`) — policies for User/Business + TeamMember self via `app.auth_*` when migrate URL is unset.

Public marketing aggregates (`lib/trust/public.ts`, `platform-outcomes.ts`) run inside `runWithTenantBypassAsync` (intentional cross-tenant).

## Privilege ladder (ops discipline)

Least privilege first. Escalate only with a named reason.

| Level | Credential | What it bypasses | Allowed use |
|-------|------------|------------------|-------------|
| 1. App runtime | `DATABASE_URL` → **`asistan_app`** | Nothing (FORCE RLS + GUC) | All clinic PHI request paths |
| 2. Identity tx | `SET LOCAL ROLE asistan_identity` inside bypass | Person table deny-for-app | `resolveOrCreatePerson`, passport GPI read/link |
| 3. Tenant-guard bypass | `runWithTenantBypassAsync(reason)` | **App middleware only** (not DB RLS) | Declared reasons below — never “convenience” |
| 4. Session/owner Prisma | `DATABASE_URL_MIGRATE` / `DIRECT_URL` | DB RLS (table owner) | Session bootstrap, DDL, smoke fixtures, migrate scripts |
| 5. Supabase **service_role** | `SUPABASE_SERVICE_ROLE_KEY` | Auth Admin + Storage RLS — **not** Postgres BYPASSRLS | Team invite/password (`createAdminClient`), Storage migrate, **fixture scripts only** |

**Never:** use service_role for PHI SQL “because RLS is hard”. Prefer GUC + `asistan_app`, or identity role for Person.

### Elevated script gate

`scripts/lib/privilege-guard.mjs` → `requireElevatedOps`.

Remote or production-like targets refuse unless:

- `--i-know-this-bypasses-rls`, or
- `ASISTAN_ALLOW_SERVICE_ROLE=1` (CI / controlled rollout)

Wired scripts:

| Script | Surface |
|--------|---------|
| `migrate-patient-files-to-storage.mjs` (`--apply` / `--validate`) | service_role + owner DB |
| `ensure-test-user.mjs` | service_role Auth Admin |
| `setup-live-test-scenario.mjs` | service_role Auth Admin |

```bash
# dry-run (no confirm)
pnpm db:files:migrate

# apply (explicit)
pnpm db:files:migrate:apply
# or: node scripts/… --apply --i-know-this-bypasses-rls

node scripts/ensure-test-user.mjs --i-know-this-bypasses-rls
```

`production:rollout` already passes `--i-know-this-bypasses-rls` on the file migrate step.

### Declared tenant-guard bypass call sites (keep in sync)

| Reason prefix | Location | Why |
|---------------|----------|-----|
| `marketplace:search-catalog` | `lib/client-marketplace/discovery.ts` | Cross-clinic catalog |
| `cron:appointment-reminders` | `lib/client-marketplace/reminders.ts` | Multi-tenant fan-out |
| `calendar:sync-connection:*` / `cron:google-calendar-sync` | `lib/calendar/sync.ts` | External calendar |
| `identity:resolve` | `lib/identity/resolve.ts` | Ecosystem Person |
| `identity:match-queue` / `identity:match-decide` | `lib/actions/identity-matches.ts` | Staff merge queue |
| `passport:read-gpi` / `passport:link-client-user` / `passport:cross-clinic-read` | `lib/passport/*` | Patient passport |
| `trust:public-stats` / `trust:public-reviews` / `trust:platform-outcomes` | `lib/trust/*` | Marketing aggregates |
| `super-admin:platform-metrics` | super-admin / sistem-admin pages | Platform metrics |

New bypass reasons require a row in this table + PR review.

## Public env allowlist (no secret leak)

Browser bundle may only see allowlisted `NEXT_PUBLIC_*` keys (`lib/security/public-env-allowlist.ts`):

| Key | Why public is OK |
|-----|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `…_PUBLISHABLE_KEY` | RLS-enforced anon |
| `NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY` | Web Push **public** half |
| `NEXT_PUBLIC_SENTRY_DSN` | Client error reporting |
| `NEXT_PUBLIC_APP_VERSION` | Release tag |
| `NEXT_PUBLIC_SITE_URL` | Absolute URL helpers |

**Must stay server-only:** `SUPABASE_SERVICE_ROLE_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, `CRON_SECRET`, `PERSON_IDENTITY_PEPPER`, Stripe/WhatsApp secrets, DB URLs.

```bash
pnpm check:public-env   # CI lint job; fails on unknown or SECRET/PRIVATE/… NEXT_PUBLIC_*
```

## Observability (Sentry + structured logs + PHI access audit)

| Layer | Location | Role |
|-------|----------|------|
| Error / performance | `@sentry/nextjs` via `instrumentation.ts`, `sentry.*.config.ts` | Prod traces **≤0.2** (default **0.1**); `sendDefaultPii: false` + `lib/security/sentry-scrub.ts`; **no** `@sentry/tracing@7` |
| App Router errors | `app/error.tsx`, `app/global-error.tsx` | `Sentry.captureException` with digest tag |
| Structured logs | `lib/observability/logger.ts` | JSON lines to stdout; blocks PHI field names |
| PHI access audit | `lib/observability/phi-access.ts` → `AuditLog` | `patient.view` / `patient.search` / `patient.file.view` (ids + counts only) |
| Mutation audit | `lib/audit.ts` → `writeAuditLog` | create/update/archive/import/file.upload, appointments, team, governance |

**Env (optional — app boots without Sentry):**

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | Browser + fallback |
| `SENTRY_DSN` | Server / Edge |
| `SENTRY_TRACES_SAMPLE_RATE` | Optional override; still hard-capped at **0.2** (`lib/security/sentry-sample.ts`) |
| `NEXT_PUBLIC_APP_VERSION` | Release tagging |
| `LOG_LEVEL=debug` | Emit debug JSON in production |
| `SENTRY_AUTH_TOKEN` | Source maps upload in CI (optional) |

Never put name / phone / email / identity / raw search query into Sentry extras or `AuditLog.metadata`. Scrub strips request query/body/cookies/auth headers and PHI-like `extra` keys.

## Identity pepper

`PERSON_IDENTITY_PEPPER` (≥16 chars) is **required in production** (`lib/env.ts`). Dev fallback is a fixed local string — never derived from service-role key or `DATABASE_URL`.
