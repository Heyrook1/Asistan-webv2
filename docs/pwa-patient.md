# Patient installable app — PWA-first

## Decision (P2 Platform)

**Lean hard into PWA install.** Native Expo App Store / Google Play publish stays optional until credentials, listings, and review readiness exist.

`start_url=/client` is intentional: the installable surface is **Asistan Rezervasyon** (patient shell), not the clinic marketing homepage.

## What shipped

| Piece | Behavior |
|-------|----------|
| `app/manifest.ts` | Name Asistan Rezervasyon; `start_url=/client?source=pwa`; shortcuts; `prefer_related_applications: false` |
| `/client` | Soft install prompt (Chromium / iOS / manual); shell from `web-mobile/` |
| `/r` | Short share entry → `/client` |
| Home `#uygulama` | Primary: open app + install steps; `#waitlist` email = store updates only |
| Footer | PWA / open app — not fake App Store badges |
| `public/sw.js` | Shell SW `asistan-shell-v2` + apple-touch icon precache |

## Entry routes

- `PATIENT_BOOK_PATH` → `/client`
- `PATIENT_PWA_PATH` → `/#uygulama`
- `STORE_WAITLIST_PATH` → `/#waitlist` (optional native news)

## When to revisit native stores

Only after: production PWA metrics (install / re-open), Apple + Google developer accounts, store screenshots/copy, and a planned Expo release channel. Until then say **“PWA ile yükleyin”**, not **“mağazada uygulama”**.
