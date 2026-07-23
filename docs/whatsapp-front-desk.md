# WhatsApp ön-büro randevu asistanı (D1)

**Status:** Shipped 21 Temmuz 2026 (prototype)  
**Honest name:** Kural tabanlı WhatsApp randevu asistanı — **not** “AI-powered” / “yapay zeka” present-tense claim.

## Acceptance

1. Inbound WhatsApp (or provider POST) resolves clinic by `slug`
2. Multi-step dialogue: hizmet → tarih → slot (real `getAvailableSlots`) → ad → onay
3. Booking via `createGuestPublicBooking` (Person + guest book path)
4. Replies via existing `WHATSAPP_PROVIDER_WEBHOOK_URL` (`kind: front_desk_reply`)
5. Clinic toggle: **Ayarlar → Entegrasyonlar → WhatsApp randevu asistanı**

## Not in v1

- LLM / voice
- TR Meta Business App certification claims
- In-app Mesajlar chatbot (`teamMessaging` frozen)

## Webhook

**Fail-closed auth (BUG-001)** — missing secrets → `503` in every environment. Raw global bearer alone cannot book for arbitrary `slug`.

| Path | Env | Auth |
|------|-----|------|
| Meta Cloud API | `WHATSAPP_APP_SECRET` | `X-Hub-Signature-256: sha256=…` (HMAC of raw body) |
| Adapter / bridge | `NOTIFICATION_PROVIDER_TOKEN` | `Authorization: Bearer {HMAC-SHA256(token, "whatsapp-inbound:{slug}")}` |
| Adapter (static) | `WHATSAPP_INBOUND_TOKENS` | Bearer equals map entry for that slug (`slug:token,…` or JSON) |

Wrong slug ↔ token → `403`. Unsigned / unbound bearer → `401`.

```http
POST /api/webhooks/whatsapp?slug={clinic-slug}
Authorization: Bearer {clinic-bound-hmac-or-map-token}
Content-Type: application/json

{ "from": "905331112233", "text": "randevu", "messageId": "optional-idempotency" }
```

Optional adapter header: `x-asistan-clinic-slug: {same-slug}` (mismatch → 403).

Helper: `clinicBoundWebhookToken()` in `lib/security/whatsapp-webhook-auth.ts`.

Meta subscribe verify (optional): `GET` with `WHATSAPP_WEBHOOK_VERIFY_TOKEN` + `hub.challenge`.

Flag: `ASISTAN_FLAG_WHATSAPP_BOOKING_AGENT` (default on).

## Migrate

```bash
node scripts/apply-whatsapp-front-desk.mjs
pnpm prisma generate
```

## Code

- `lib/front-desk/*` — intents, session, handle-message, reply
- `app/api/webhooks/whatsapp/route.ts`
- Funnel: `book_requested` / `book_confirmed` + `channel=whatsapp_front_desk`
