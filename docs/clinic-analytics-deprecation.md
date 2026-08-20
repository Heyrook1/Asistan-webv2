# Clinic analytics — honest ops overview (Q2)

**Status:** On by default (21 Temmuz 2026)  
**Flag:** `ASISTAN_FLAG_CLINIC_ANALYTICS` (default **on**)  
**Advanced:** `ASISTAN_FLAG_ADVANCED_ANALYTICS` (default **off** — funnel / utilization)

## Decision

We unfroze `/dashboard/analitik` as an **operasyon raporu**: measured appointment volume, completion/cancel counts, staff/service breakdowns, CSV/PDF export. No invented fill rates, no “Revenue Intelligence”, no BI claims.

Deep funnel + staff utilization stay behind `advancedAnalytics` so the default report stays honest and light.

Proactive capacity (open slots + returning-patient shortlist) remains on Genel Bakış / Ajanda — see [`fill-the-gap-ops.md`](./fill-the-gap-ops.md).

## What clinics get

| Need | Where |
|------|--------|
| Bugünkü randevu / bekleyen / aktif hasta / aylık ciro | `/dashboard` + `/dashboard/analitik` KPI strip |
| 3 / 6 / 12 aylık hacim + ciro özeti, CSV/PDF | `/dashboard/analitik` |
| Personel / hizmet kırılımı | `/dashboard/analitik` |
| Boş slot + dönen hasta önerisi | `/dashboard` Operasyon önerisi |
| Huni / utilization | Opt-in `ASISTAN_FLAG_ADVANCED_ANALYTICS=true` |

## Honesty bar

- Cancellation % on the report uses the **selected month range**, not all-time lifetime stats.
- Do **not** show predicted fill % (see fill-the-gap honesty bar).
- Claim-bank: say “Genel bakış + operasyon raporu”; do not say “gelişmiş BI paneli”.

## Disable overview

```bash
ASISTAN_FLAG_CLINIC_ANALYTICS=false
```

Shows the deprecated panel + hides nav entry.

## Related

- [`fill-the-gap-ops.md`](./fill-the-gap-ops.md)
- [`claim-bank.md`](./claim-bank.md)
- [`product-boundary.md`](./product-boundary.md)
