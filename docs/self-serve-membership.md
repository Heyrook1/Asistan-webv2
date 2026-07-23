# Self-serve membership upgrade

Owner requests a plan upgrade/renewal → `MembershipPayment` (PENDING) → Manual invoice instructions or Stripe PaymentIntent → Super Admin confirms (or Stripe webhook) → `VendorAccount` activated.

## Clinic UI

**Ayarlar → Abonelik** — choose monthly/yearly → “Yükselt / yenile” → “Ödeme bekleniyor” banner.

Flag: `ASISTAN_FLAG_SELF_SERVE_BILLING` (default on).

## Admin

**Super Admin** — “Self-serve paket ödemeleri” → Onayla / Reddet  
(`confirmMembershipPayment` / `rejectMembershipPayment`)

## Env

```bash
PAYMENT_PROVIDER=manual   # or stripe
MEMBERSHIP_BANK_INSTRUCTIONS=  # optional template: {{amount}} {{currency}} {{plan}} {{paymentId}}
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Webhook: `POST /api/webhooks/stripe` (`payment_intent.succeeded` + metadata.paymentId)

## Migrate

`supabase/migrations/20260714000300_membership_payments.sql` then regenerate Prisma client.
