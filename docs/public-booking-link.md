# Public clinic booking link (`/book/[slug]`)

Calendly-style per-clinic booking for Instagram bio / website embed.

## Routes

| Path | Role |
|------|------|
| `/book/{slug}` | Full public booking wizard (no patient login) |
| `/book/{slug}?embed=1` | Chrome-light embed surface |
| `/randevu/{slug}` | Permanent redirect → `/book/{slug}` (legacy share links) |

## APIs

- `GET /api/public/clinics/[slug]` — clinic payload
- `GET /api/client/availability` — slots (existing)
- `POST /api/public/bookings` — guest create (rate-limited); respects `autoConfirmClientAppointments`

## Clinic ops

Dashboard → **Ayarlar → Randevu**: copy link + iframe snippet.

Share actions in overview / quick actions / calendar also use `/book/{slug}`.

## Notes

- Guest bookings set `clientUserId: null`, source `CLIENT_APP`, notes tagged `[Genel link]`.
- Slot math still honors appointments + Google busy blocks.
