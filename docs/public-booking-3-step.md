# Public booking — 3-step + idempotency (Sprint 2)

## Guest UX (`/book/[slug]`)

| Step | Label | Content |
|------|-------|---------|
| 1 | Ne için? | Service (+ doctor if >1) (+ location if >1) |
| 2 | Ne zaman? | Date + live slots (skeleton while loading) |
| 3 | İletişim | Name + phone (+ optional ID) + privacy notice / consent |

Success screen is post-submit (not a fourth primary step).

### Identity (P0.6 data minimization)

- Default: national ID / passport is **optional** on guest book and client book.
- Clinic opt-in: `Business.requireGuestIdentity` (Ayarlar → Randevu) makes it required and shows why-copy on the form.
- Guest path never writes plaintext ID to `Patient`; optional value is hashed into `Person.identityHash` only.
- Auto-link never uses hash alone — dual strong signals or staff match queue (`shouldAutoLinkPerson`).

### Consent (P0.7)

- Step 3 shows an **aydınlatma** notice: clinic = data controller (patient/appointment); Asistan Rezervasyon = SaaS processor; links to `/privacy`, `/terms`, `/guven`.
- **Required** checkbox: privacy notice + processing for this booking only (`privacyNoticeAccepted`).
- **Optional** separate checkbox: marketing / campaign opt-in (`marketingOptIn`) — never bundled with the required ack.
- Operational SMS/WhatsApp for this appointment (confirm/remind) is described as service fulfilment, not marketing.
- Server rejects bookings without `privacyNoticeAccepted: true`; consent flags + `BOOKING_PRIVACY_NOTICE_VERSION` are stamped on appointment timeline metadata.

### Mobile (BUG-004)

Location `<select>` (and shared `Input`/`Textarea`) use `text-base md:text-sm` so iOS Safari does not zoom on focus (<16px).

### Empty states

No published services → dashed card + **Kliniği ara** (`tel:`) when phone exists (state table Empty ✅).

### Deep links

`/book/{slug}?serviceId=&doctorId=&locationId=&date=&embed=1`

Marketplace clinic cards pass `doctorId`.

## Idempotency

- Client sends `Idempotency-Key` (UUID) on `POST /api/public/bookings`
- Server stores SHA-256 hash → JSON response in `BookingIdempotency` (24h TTL)
- Retries with the same key replay the same appointment payload (`idempotentReplay: true`)

Migration: `supabase/migrations/20260715000200_booking_idempotency.sql`
