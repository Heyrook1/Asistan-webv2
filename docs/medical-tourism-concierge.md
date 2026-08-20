# KKTC medical-tourism concierge (D3)

**Status:** Shipped 21 Temmuz 2026  
**Path:** `/visit-cyprus` (TR / EN / RU page-local)  
**Honest scope:** Clinic appointment routing + inbound lead — **not** travel agency, visa, hotel, or “AI concierge”.

## Acceptance

1. Multilingual landing with language toggle (TR/EN/RU)
2. Lead form persists `TourismLead` + optional ops email
3. Handoff to `/book/{slug}?lang=` or marketplace
4. Clinic note on public booking link card
5. Claim-bank: no travel-agency / AI-concierge present-tense claims

## API

`POST /api/tourism-leads` — rate-limited public

## Migrate

```bash
node scripts/apply-tourism-lead.mjs
pnpm prisma generate
```

## Code

- `lib/concierge/*`
- `components/concierge/visit-cyprus-concierge.tsx`
- `app/visit-cyprus/page.tsx`
- Soft book step labels via `?lang=`
