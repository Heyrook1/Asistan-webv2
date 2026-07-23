# KKTC outcome / proof cases

Sales + innovation proof without fake testimonials.

## Surfaces

| Surface | Path |
|---------|------|
| Data | `lib/brand/outcome-cases.ts` |
| Live platform strip | `lib/trust/platform-outcomes.ts` (no-show % only if sample ≥ 40) |
| Home section | Features → Outcomes → Trust |
| Full page | `/sonuclar` |
| Nav | Header “Sonuçlar”, footer “Operasyon sonuçları” |

## Rules

- Published cards = `process_pilot` only: before/after **process** metrics (tools, roles, booking path).
- No clinic trade names, fake logos, invented % or NPS.
- Percentage no-show / staff NPS only via `signed_pilot` + `status: published` after written approval (`SIGNED_METRIC_CASE_TEMPLATE`).
- Always show early-access / anonymized disclaimer (`OUTCOME_CASES_DISCLAIMER`).

## Replace with signed metrics

1. Fill `SIGNED_METRIC_CASE_TEMPLATE` (or clone) with real before/after % and denominator note.
2. Get written clinic approval; keep name withheld if required.
3. Set `status: 'published'` and `source: 'signed_pilot'`.
4. Optionally retire overlapping process_pilot card.
