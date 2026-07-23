# Product boundary — outpatient SMB first

**Status:** Locked (PRB Depth · postpone hospital-depth integrations)  
**Date:** 14 Temmuz 2026

## Decision

Stay an **outpatient SMB clinic ops** product until KKTC density + table-stakes (SMS/WA, deposits, measured outcomes) are proven.

Do **not** chase hospital-group ceilings yet.

## In scope (now)

| Area | What we ship |
|------|----------------|
| Ops | Single-clinic / multi-location **polyclinic** agenda, patients, team RBAC |
| Booking | Public `/book`, `/client` marketplace, PWA |
| Clinical light | Notes (incl. **SOAP template**), files, printable **clinic prescription** drafts |
| Trust | KVKK-oriented controls, audit log, isolation |

## Explicitly out of scope (postpone)

| Capability | Why postponed |
|------------|----------------|
| National / official **e-reçete** gateway | Printable draft ≠ regulatory e-reçete network |
| **LIS** / lab instrument feeds | Hospital / group data path |
| **Telehealth** visits | Different product surface + compliance |
| **Room / bed** / ward scheduling | Inpatient / hospital ops |
| Full **EMR** / hospital group integration suites | Enterprise density required first |

## Who we sell to

- **Yes:** KKTC diş, fizyo, estetik, poliklinik, küçük çok-hekim merkezler  
- **Not yet:** Hastane grupları, yataklı servis, resmi e-reçete zorunlu kurumlar (unless they accept light outpatient ops only)

## Claim rules

- Say: “yazdırılabilir klinik reçete”, “erken erişim klinik paneli”  
- Do not say: “e-reçete entegrasyonu”, “LIS”, “telehealth hazır”, “hastane HIS/EMR”

Code: `lib/brand/product-boundary.ts` · claim patterns in `lib/brand/claim-bank.ts`

## Related

- North star: [`ecosystem-north-star.md`](./ecosystem-north-star.md)
- Execution order: [`ecosystem-implementation-plan.md`](./ecosystem-implementation-plan.md)
- Roadmap map: [`ecosystem-roadmap.md`](./ecosystem-roadmap.md) + canvas `asistan-ecosystem-roadmap`

