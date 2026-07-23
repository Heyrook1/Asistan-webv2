# Global Patient Identity (Sprint 1)

## Shipped

| Piece | Location |
|-------|----------|
| `Person` / `PersonIdentityMatch` | `prisma/schema.prisma` |
| SQL | `supabase/migrations/20260715000100_global_person_identity.sql` |
| Normalize + score | `lib/identity/normalize.ts` |
| Resolve/create | `lib/identity/resolve.ts` |
| Public + client book | links `Patient.personId` |
| Staff create patient | same |
| API | `POST /api/identity/resolve` (session) |
| Tests | `tests/unit/identity-normalize.test.ts` |

## Env

Set in production:

```bash
PERSON_IDENTITY_PEPPER=<random-32+-char-secret>
```

Dev falls back to a derived pepper (not for prod hashing longevity).

## Apply DB

```bash
npx prisma db execute --file supabase/migrations/20260715000100_global_person_identity.sql --schema prisma/schema.prisma
npm run db:generate
```

Restart `next` after generate if Windows locks the query engine DLL.

## GPI format

`GPI-` + 10 hex chars (opaque). Internal PK remains UUID.

