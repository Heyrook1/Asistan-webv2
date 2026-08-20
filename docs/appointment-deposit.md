# Appointment deposit / no-show fee (Q3 MVP)

**Status:** Shipped 21 Temmuz 2026  
**Separate from:** Membership self-serve (`MembershipPayment`)

## Acceptance (Sprint 4)

Clinic can require ₺X deposit on public book **or** mark a no-show fee policy (collection may be later).

## Clinic settings

**Ayarlar → Randevu**

| Control | Behavior |
|---------|----------|
| Depozito iste | After public book, creates `AppointmentDeposit` PENDING |
| Depozito tutarı | TRY/USD/EUR from business currency |
| No-show ücreti politikası | Shown on public book step 3; on `NO_SHOW` writes funnel `deposit_pending` with `kind=no_show_fee_policy` |

## Patient public book

- Step 3 shows deposit + no-show policy when enabled
- Success screen shows deposit instructions + optional Stripe checkout link
- Booking **soft-fails** payment: appointment always commits

## Providers

| Mode | Env |
|------|-----|
| Manual (default) | `PAYMENT_PROVIDER=manual` or Stripe unset |
| Stripe | `PAYMENT_PROVIDER=stripe` + `STRIPE_SECRET_KEY` (+ webhook secret) |

Stripe PaymentIntent metadata: `kind=appointment_deposit`, `depositId`, `appointmentId`, `businessId`.

Webhook `POST /api/webhooks/stripe` marks deposit PAID (idempotent via `ProcessedWebhookEvent`).

**iyzico:** not wired — use Stripe or manual; claim-bank must not say “iyzico hazır”.

## Migrate

```bash
# apply
supabase/migrations/20260721000200_appointment_deposit.sql
pnpm prisma generate
```

## Funnel

- `deposit_pending` — deposit intent created (or no-show fee policy logged)
- `deposit_paid` — Stripe webhook / mark paid
- `deposit_failed` — Stripe intent creation failed (falls back to manual)

## Code

- `lib/payments/deposit.ts`
- `lib/payments/deposit-public.ts` — `/book/deposit` status + Checkout Session
- `app/book/deposit/page.tsx`
- `lib/public-booking/create-guest-booking.ts`
- `app/dashboard/ayarlar` randevu tab
- `components/book/public-booking-widget.tsx`
