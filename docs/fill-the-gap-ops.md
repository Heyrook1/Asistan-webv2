# Fill the gap (operasyon önerisi + bekleme listesi proxy)

**Status:** Prod — batched engine + cancel auto-offer (21 Temmuz 2026)  
**Flag:** `ASISTAN_FLAG_FILL_THE_GAP` (default **on**)

## Decision

A “Revenue Intelligence Dashboard” with invented fill rates (“this slot fills **78%**…”) is **parked**.

Clinic analytics charts stay frozen ([`clinic-analytics-deprecation.md`](./clinic-analytics-deprecation.md)). Proactive capacity help belongs on **Genel Bakış** and **Ajanda**, as honest shortlists — not ML / BI.

There is **no** separate clinic Waitlist table yet. Auto-fill uses **returning patients** (COMPLETED in lookback, no upcoming SCHEDULED/CONFIRMED) as the waitlist proxy — same shortlist shown on Genel Bakış.

## What we ship

| Surface | Behavior |
|---------|----------|
| `/dashboard` | **Operasyon önerisi** card: densest open-slot cluster in the next ~5 days + up to 12 returning patients |
| `/dashboard/ajanda?mode=takvim` | Day callout when the selected date has precomputed open slots |
| Cancel / no-show | Soft-offer opened slot to up to **3** returning patients (prefer same doctor) via SMS/WhatsApp (`kind=slot_offer`) — never rolls back cancel |
| Engine | `lib/ops/fill-the-gap.ts` + pure copy + `availability-compute` batch |

Copy must say **operasyon önerisi** / kural tabanlı kısa liste. Never “AI”, “revenue intelligence”, or a fill % without measured history.

## N+1 fix (prod)

`getOpenSlotClusters` no longer calls `getAvailableSlots` per doctor×day.

| Before | After |
|--------|--------|
| ~4 doctors × 5 days × ~6 queries | 2 rounds: doctors/services/staff + rules/appointments/blocks, then in-memory `computeAvailableSlots` |

## Honesty bar (parked %)

Do **not** show a predicted fill percentage until:

1. We store or can reconstruct “slots offered vs booked” for the same weekday/hour with sample size ≥ **10**, and  
2. Claim-bank allows the phrasing.

Until then: slot counts + returning-patient list only.

## Disable

```bash
ASISTAN_FLAG_FILL_THE_GAP=false
```

Disables both the dashboard card and cancel auto-offer.

## Related

- [`clinic-analytics-deprecation.md`](./clinic-analytics-deprecation.md)
- [`patient-outbound-channels.md`](./patient-outbound-channels.md) — `slot_offer` template
- [`claim-bank.md`](./claim-bank.md) — no AI-powered present tense
- [`product-boundary.md`](./product-boundary.md)
