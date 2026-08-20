# Asistan Ecosystem — North Star

**Locked with:** `docs/product-boundary.md` (outpatient SMB first) · `docs/ecosystem-implementation-plan.md`

## What Asistan is

A **healthcare ecosystem**, not a single appointment toy:

| Surface | Customer name | Role |
|---------|---------------|------|
| Patient | **Asistan Rezervasyon** | Discover + book (+ PWA / Expo) |
| Clinic | **Asistan Health** | Ops OS / “vendor” panel |
| Platform | Super Admin | Tenants, trust, billing ops |

One backend · one auth · one appointment engine · one notification bus · one security model.

## What we refuse (until boundary unlock)

Official e-reçete · LIS · telehealth · wards · hospital HIS claims · Flutter second client · inventing fourth brand names.

## Design bar

Calm healthcare UI · WCAG AA · ≤3 primary book steps · real availability · no fake marketplace density.

## Scale posture

Design data for Person-scale identity and idempotent booking; **ship** for KKTC polyclinic density first → Türkiye → multi-country / FHIR later.
