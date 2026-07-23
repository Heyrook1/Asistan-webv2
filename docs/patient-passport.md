# Asistan pasaportu — Person/GPI hasta yüzü (D2)

**Status:** Shipped 21 Temmuz 2026  
**Honest name:** Asistan pasaportu (ziyaret + klinik üyelik özeti)  
**Not:** FHIR / tıbbi pasaport / Apple Health / klinik chart paylaşımı

## Acceptance

1. `ClientUser.personId` → ecosystem `Person` (GPI)
2. Patient PWA `/client/health` shows GPI + clinic memberships + visit timeline
3. Visits include `clientUserId` bookings **and** appointments on Patients linked to the same Person (RLS via `app.person_id`)
4. Claim-bank allows “Asistan pasaportu (ziyaret özeti)”; forbids “tıbbi pasaport” / FHIR passport present-tense

## API

`GET /api/client/passport` (Bearer) → `{ gpiDisplay, clinics[], timeline[], honesty }`

### Hotfix (22 Temmuz 2026) — P2002 + ALS

| Issue | Fix |
|-------|-----|
| Unique `phoneE164` / `emailNorm` on Person create (S4 no phone-only merge) | Omit colliding uniques + savepoint retry — `lib/identity/resolve.ts` |
| Turbopack dual-eval → tenant-guard spam / failed bypass | `globalThis.__asistanTenantBypassALS` singleton — `lib/security/tenant-guard.ts` |
| Passport cross-clinic reads | `runWithTenantBypassAsync('passport:*')` — `lib/passport/ensure-link.ts`, `get-client-passport.ts` |

**Prod verify (auth required):**

```bash
curl -fsS -H "Authorization: Bearer $CLIENT_ACCESS_TOKEN" \
  "https://<prod>/api/client/passport"
# expect HTTP 200 + JSON with gpiDisplay / clinics / timeline / honesty
# not 500 (P2002) and no [tenant-guard] spam in logs
```

Unauthenticated → `401` (not `500`).

## Migrate

```bash
node scripts/apply-client-person-passport.mjs
pnpm prisma generate
```

## Code

- `lib/passport/*`
- `app/api/client/passport/route.ts`
- `components/client/health-panel.tsx`

## Related

- [`global-person-identity.md`](./global-person-identity.md)
- [`patient-health-timeline.md`](./patient-health-timeline.md)
- [`claim-bank.md`](./claim-bank.md)
