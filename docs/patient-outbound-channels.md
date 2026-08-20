# Patient outbound channels (SMS / WhatsApp / email)

**Status:** Adapter + fail-visible UI shipped · **prod live = bind webhook URLs**  
**Date:** 22 Temmuz 2026

## Behavior

| Event | Channels attempted |
|-------|-------------------|
| Clinic **approves** appointment | SMS + WhatsApp (if phone) · email (if email) |
| Clinic **cancels** / no-show | same + waitlist proxy `slot_offer` to up to 3 returning patients |
| Public / client **book** with auto-confirm | same (`kind=confirm`) — soft-fail |
| Cron reminder T-24h / T-2h | SMS + WhatsApp (phone) · email-only if no phone · in-app if `clientUserId` |
| Fill-the-gap **slot_offer** | SMS + WhatsApp only (phone required) |

Guest public-book patients (no app account) get SMS/WA when phone present and status is `CONFIRMED`.

**Soft-fail:** booking and approve/cancel always commit even when the provider is down or unset.

## Env

```bash
SMS_PROVIDER_WEBHOOK_URL=
WHATSAPP_PROVIDER_WEBHOOK_URL=
EMAIL_PROVIDER_WEBHOOK_URL=
NOTIFICATION_PROVIDER_TOKEN=   # Bearer on outbound; also seeds clinic-bound inbound HMAC
```

Webhook body: `{ "channel": "sms"|"whatsapp"|"email", "payload": { …, "kind": "confirm"|"cancel"|"reminder_24h"|"reminder_2h"|"slot_offer"|"front_desk_reply" } }`

If URL unset → `status: not_configured` (`ok: false`), booking/approve still succeeds.

There is **no first-party Twilio/Netgsm/MessageBird SDK** in this repo. Ops stands up a bridge that speaks those APIs.

## Prod bind checklist (ops)

1. Apply `supabase/migrations/20260722000100_patient_channel_attempt.sql` + `pnpm db:generate` (stop `next` on Windows if `EPERM`).
2. Deploy a bridge (Cloud Function / n8n / Twilio Function) that:
   - Accepts `POST` + optional `Authorization: Bearer $NOTIFICATION_PROVIDER_TOKEN`
   - Maps `payload.kind` → approved templates (sheet below)
   - Calls carrier / Meta Cloud API
   - Returns HTTP 2xx on accept
3. Set prod env: `SMS_PROVIDER_WEBHOOK_URL` and/or `WHATSAPP_PROVIDER_WEBHOOK_URL` + `NOTIFICATION_PROVIDER_TOKEN`.
4. Schedule `GET /api/cron/appointment-reminders` with `Authorization: Bearer $CRON_SECRET`.
5. Smoke: approve a test appointment → toast shows `Hasta bildirimi: SMS gönderildi` · Ayarlar → Entegrasyonlar badges **bağlı** · 24s oran görünür.
6. Inbound WA (front-desk): Meta `WHATSAPP_APP_SECRET` + `WHATSAPP_WEBHOOK_VERIFY_TOKEN` → `POST /api/webhooks/whatsapp?slug={clinic}` · enable clinic WhatsApp agent.

**Honest metric:** panel **gönderim %** = adapter HTTP ACK (`sent / (sent+error)`), **not** carrier delivery receipt. DLR / `statuses[]` correlation is not shipped (no `externalId` on attempts yet).

## Fail-visible UI

| Surface | Behavior |
|---------|----------|
| Ajanda / Randevular onay-iptal toast | Description: `Hasta bildirimi: SMS gönderildi · WhatsApp yapılandırılmadı · …` |
| Bildirim Merkezi aksiyon toast | Same label appended to success message |
| Ayarlar → Entegrasyonlar | SMS / WhatsApp / e-posta **bağlı** / **yapılandırılmadı** badges |
| Ayarlar → Entegrasyonlar | Son 24s **gönderim oranı** (`PatientChannelAttempt`; `not_configured` hariç) + ≥%80 badge |

Ops gate: keep rolling-day adapter delivery ≥ 0.80. Helper: `providerDeliveryRate()` · store: `lib/notifications/channel-delivery-store.ts` · migrate: `20260722000100_patient_channel_attempt.sql`.

## Bridge contract (minimal)

```http
POST {SMS|WHATSAPP|EMAIL}_PROVIDER_WEBHOOK_URL
Authorization: Bearer {NOTIFICATION_PROVIDER_TOKEN}
Content-Type: application/json

{
  "channel": "sms",
  "payload": {
    "kind": "confirm",
    "appointmentId": "…",
    "businessId": "…",
    "clinicName": "…",
    "serviceName": "…",
    "startsAt": "2026-07-22T09:00:00.000Z",
    "phone": "+905xxxxxxxxx"
  }
}
```

Expect `2xx`. Non-2xx → attempt `error` (booking still OK).

## TR template sheet (provider-facing)

Use these as WhatsApp/SMS approved templates. Placeholders match webhook `payload` fields.

| kind | Channel | Suggested TR body |
|------|---------|-------------------|
| `confirm` | SMS / WA | `{{clinicName}}: {{serviceName}} randevunuz onaylandı. {{startsAt}}. Asistan Rezervasyon` |
| `cancel` | SMS / WA | `{{clinicName}}: {{serviceName}} randevunuz iptal edildi ({{startsAt}}). Yeni saat için klinik linkini kullanın.` |
| `reminder_24h` | SMS / WA | `Hatırlatma: Yarın {{startsAt}} — {{serviceName}} ({{clinicName}}). Asistan Rezervasyon` |
| `reminder_2h` | SMS / WA | `Hatırlatma: 2 saat sonra {{startsAt}} — {{serviceName}} ({{clinicName}}).` |
| `slot_offer` | SMS / WA | `{{clinicName}}: {{startsAt}} saatinde {{serviceName}} açıldı. İsterseniz klinik linkinden alın. Asistan Rezervasyon` |
| `confirm` | email | Subject: `Randevunuz onaylandı` · Body: hasta adı + hizmet + `startsAt` + klinik |
| `cancel` | email | Subject: `Randevunuz iptal edildi` · Body: aynı alanlar |

`startsAt` is ISO or clinic-local string from server — provider may reformat to `dd.MM.yyyy HH:mm`.

## Observability

Each attempt logs (no phone/email cleartext):

```text
[patient-channel] { appointmentId, businessId, kind, channel, provider, status, ok, externalId? | error? }
```

`status` ∈ `sent` | `not_configured` | `error`.

### Delivery % (≥ 80 target)

After binding a webhook, filter server logs by `[patient-channel]` and compute:

```
sent / (sent + error)   # exclude not_configured
```

Ops gate: keep this ≥ 0.80 over a rolling day. Helper for the same math in tests: `providerDeliveryRate()` in `lib/notifications/channel-delivery.ts`.

## Code

- `lib/notifications/channel-delivery.ts` — status labels + summary + delivery rate
- `lib/notifications/channels.ts` — HTTP POST adapter + `getPatientOutboundChannelConfig`
- `lib/notifications/patient-channels.ts` — multi-channel fanout + `[patient-channel]` log
- `lib/actions/appointments.ts` — approve/cancel returns `channelDelivery` for UI
- `lib/public-booking/create-guest-booking.ts` · `lib/client-marketplace/bookings.ts` — auto-confirm book fanout
- `lib/client-marketplace/reminders.ts` — cron path
- UI: `components/dashboard/patient-outbound-channels-panel.tsx` · ajanda toast
- Cron: `app/api/cron/appointment-reminders` — schedule via host crontab or `.github/workflows/cron.example.yml`
- Deploy table: `DEPLOYMENT.md` Step 2

## Claims

Say: “SMS/WhatsApp bildirimleri webhook ile bağlanabilir; kanal durumu panelde görünür.”  
Do not say: “Netgsm/Twilio hazır” unless a named provider is configured and delivery % is measured live.
