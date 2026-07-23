# Public booking — 3-step + idempotency (Sprint 2)

## Guest UX (`/book/[slug]`)

| Step | Label | Content |
|------|-------|---------|
| 1 | Ne için? | Service (+ doctor if >1) (+ location if >1) |
| 2 | Ne zaman? | Date + live slots (skeleton while loading) |
| 3 | İletişim | Contact + confirm |

Success screen is post-submit (not a fourth primary step).

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
