# Ön kayıt anketleri (intake forms)

Form builder → tokenized public fill → patient chart attachment.

## Clinic

1. **Dashboard → Anketler** — create fields (`TEXT`, `TEXTAREA`, `SELECT`, `CHECKBOX`, `PHONE`, `DATE`)
2. Mark one as **varsayılan** and/or assign on **Hizmetler** edit dialog
3. After public book (or staff “Link kopyala”), patient opens `/intake/[token]`
4. Answers appear on **Hasta kartı → Anketler** (+ timeline `INTAKE_SUBMITTED`)

## Resolve order

Service `intakeFormId` → else clinic default `IntakeForm.isDefault`.

## APIs

- `GET/POST /api/public/intake/[token]` (rate-limited; token hashed at rest)

## Migrate

`supabase/migrations/20260714000200_intake_forms.sql` then `pnpm db:generate` (restart `next` if DLL locked).

Optional: `INTAKE_TOKEN_PEPPER` for hash pepper.
