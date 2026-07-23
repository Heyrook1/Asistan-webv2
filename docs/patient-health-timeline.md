# Patient Health Timeline (v1)

Longitudinal visit / chart view — not a medical passport claim.

## Surfaces

| Surface | Path | Data |
|---------|------|------|
| Shared builder | `lib/health-timeline/` | Normalized `HealthTimelineItem` |
| Shared UI | `components/health-timeline/health-timeline.tsx` | Day spine + kind filters |
| Clinic chart | `/dashboard/hastalar/[id]` → **Sağlık Zaman Çizelgesi** | Visits + labs + meds + allergies + treatments + notes + files + intake + prescriptions |
| Patient PWA | `/client/health` | **Asistan pasaportu** — GPI + clinic memberships + visits ([`patient-passport.md`](./patient-passport.md)) |

## Honest limits

- Patient copy: *Asistan pasaportu — klinik notları / tahliller / FHIR değildir.*
- `ClientUser.personId` links ecosystem Person (GPI); chart PHI still clinic-scoped.
- No Apple Health / HealthKit sync, FHIR, or official e-reçete.

## Next

1. Explicit clinic→patient share for labs/files before exposing chart PHI on PWA.
2. Consent / revoke for cross-clinic membership visibility.

## Claims hygiene

Do **not** market as tıbbi pasaport, FHIR passport, or Apple Health. Allowed: **Asistan pasaportu (ziyaret özeti)**. See [`claim-bank.md`](./claim-bank.md) + [`patient-passport.md`](./patient-passport.md).

## Related

- [`global-person-identity.md`](./global-person-identity.md)
- [`patient-passport.md`](./patient-passport.md)
- [`client-vendor-sync-roadmap.md`](./client-vendor-sync-roadmap.md)
