# Migration authority

**Single authority for schema changes:** `supabase/migrations/*.sql` (ordered by filename timestamp).

Prisma `schema.prisma` is the **application model** (client generation). It must stay aligned with applied Supabase migrations, but Prisma Migrate (`prisma/migrations/`) is **not** used in this repo.

## Rules

1. Additive only — prefer `CREATE … IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`.
2. Never invent a parallel `prisma migrate` history without an explicit ADR to switch authority.
3. After editing `prisma/schema.prisma`, add a matching Supabase SQL migration in the same PR.
4. CI / local: `pnpm check:schema-drift` compares Prisma model names to `public` tables (live DB) when `DATABASE_URL` is set; offline it asserts migration files exist for known S2/S1 artifacts.

## Commands

```bash
pnpm db:deploy              # apply ready stack (ensure-db-ready --prisma)
pnpm check:schema-drift     # authority + optional live table parity
pnpm smoke:asistan-app-rls  # S2 role / FORCE RLS / GUC smoke
```

## Rollback

Point `DATABASE_URL` back at the owner role. Do not drop `asistan_app` policies without a replacement door.
