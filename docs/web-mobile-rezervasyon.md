# Asistan Rezervasyon (web mobile)

## Role

Patient product shell — discover clinics, open live availability, request appointments.
Clinic ops stay on **Asistan Health** (`/dashboard`). Native Expo stays in `mobile/`.

## Surfaces

| Path | Role |
|------|------|
| `/client` | App shell (PWA start) — greeting home + featured clinics |
| `/r` | Short redirect → `/client` |
| `/book/{slug}` | Guest per-clinic wizard (+ `?embed=1`) |
| `web-mobile/` | Source of home / top bar / tokens |

UI density tracks the Expo web reference (`mobile-asistan-rezervasyon` / Netlify) while keeping brand blue `#0071E3` and live marketplace APIs.

## Run

```bash
npm run rezervasyon:dev
# open http://localhost:3000/client
```

## Implementer notes

- Import product UI from `@/web-mobile/*` (alias in `tsconfig`).
- Do not invent fourth product names in UI.
- Clinic cards open `/book/{businessSlug}`.
