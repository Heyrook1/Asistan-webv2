# KKTC outcome / proof cases

Sales + innovation proof without fake testimonials or invented pilot durations.

## Surfaces

| Surface | Path |
|---------|------|
| Data | `lib/brand/outcome-cases.ts` |
| Live platform strip | `lib/trust/platform-outcomes.ts` (no-show % only if sample ≥ 40) |
| Home section | Rendered only when `listPublicOutcomeCases().length > 0` or live proof gate is ready |
| Full page | `/sonuclar` |
| Nav | Header “Sonuçlar”, footer “Operasyon sonuçları” |

## Proof gate (mandatory)

Public cards require **all** of:

1. Real clinic early-access / pilot engagement (not a hypothetical archetype).
2. Documented measurement method (denominator for any %).
3. Written clinic approval to publish (name may stay withheld).
4. `status: 'published'` and `source: 'signed_pilot'` (or approved process source after the same gate).

If any gate fails → keep `status: 'draft'`. **Do not invent 45/60/90-day pilots for the live site.**

## Rules

- `listPublicOutcomeCases()` is the only UI query — drafts never serialize to the client.
- Public DTO omits `status`, `source`, and internal document ids.
- No clinic trade names, fake logos, invented % or NPS.
- Homepage outcome section returns `null` when there are no published cards and live signal is not ready.

## Promote a real pilot

1. Fill a case (or `SIGNED_METRIC_CASE_TEMPLATE`) with real before/after and denominator note.
2. Get written clinic approval; keep name withheld if required.
3. Set `status: 'published'`.
4. Deploy; verify `/sonuclar` shows only approved copy.
