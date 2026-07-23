# Legacy `public.*` snake_case schema deprecation

**Status:** Drop migration ready (16 Temmuz 2026)  
**Migration:** `supabase/migrations/20260716000200_drop_legacy_snake_schema.sql`

## Decision

The first migration era (`20260516*`) created a **marketplace prototype** schema:

| Legacy (dead) | Current (live) |
|---------------|----------------|
| `public.providers` | `"Business"` |
| `public.customers` | `"Patient"` + `"ClientUser"` |
| `public.users` (role: customer/provider) | `"User"` + `"TeamMember"` |
| `public.appointments` | `"Appointment"` |
| `public.services` | `"Service"` |
| `public.notifications` | `"Notification"` |
| `public.activity_logs` | `"AuditLog"` |
| `public.user_consents` | `"UserConsent"` |
| `public.data_deletion_requests` | `"DataDeletionRequest"` |

Keeping both eras in one PHI database adds breach surface (duplicate RLS policies, wrong-table queries, PostgREST confusion) without product value. **Delete the legacy layer.**

## Inventory

Canonical list: `lib/security/legacy-schema.ts` (16 tables + 7 functions).

## Pre-flight (production)

```bash
node scripts/audit-legacy-public-schema.mjs
```

Must show **0 rows** in every present legacy table. If any table has data, archive first — do not force-drop.

## Apply

```bash
node scripts/apply-drop-legacy-schema.mjs
```

Runs audit with `--require-empty`, then applies the drop migration.

## Guard rails

- Migration **raises** if any legacy table has rows (same check as audit).
- Revokes `anon` / `authenticated` on legacy tables before drop.
- Offline inventory check: `pnpm check:rls-inventory` (ensures drop migration lists all tables).
- `LEGACY_SNAKE_RLS_TABLES` must never appear in `REQUIRED_RLS_TABLES`.

## Fresh installs

New environments that ran the full migration chain may have empty legacy tables from `20260516*`. The drop migration removes them on first apply after this change.

## Claims

**Say:** Tek şema — Prisma PascalCase klinik verisi.  
**Do not say:** Çift şema / marketplace `providers` tablosu hâlâ canlı.
