# Team messaging deprecation (staff Mesajlar)

**Status:** Frozen by default (16 Temmuz 2026)  
**Flag:** `ASISTAN_FLAG_TEAM_MESSAGING` (default **off**)

## Decision

In-app `/dashboard/mesajlar` rebuilt a Slack/WhatsApp-like staff chat. Clinics and patients already live in WhatsApp. We **freeze** the product surface and invest in **patient outbound SMS/WhatsApp** instead (`docs/patient-outbound-channels.md`).

## What still exists

- Prisma tables (`Conversation`, `Message`, …) and RLS — kept for rollback / historical data
- Code paths gated by `isTeamMessagingEnabled()` / `isFeatureEnabled('teamMessaging')`

## What clinics should use

| Need | Path |
|------|------|
| Appointment confirm / cancel / reminder | SMS + WhatsApp webhooks (`patient-outbound-channels.md`) |
| Share booking link via WhatsApp | Ajanda / hızlı işlemler → `wa.me` share |
| Staff coordination | External WhatsApp / phone — not Asistan chat |

## Re-enable (emergency / pilot only)

```bash
ASISTAN_FLAG_TEAM_MESSAGING=true
```

Do not market “ekip sohbeti” while the flag is off.

## Claims

**Say:** Hasta randevu bildirimleri SMS/WhatsApp webhook ile bağlanabilir.  
**Do not say:** Asistan içinde ekip mesajlaşma / Slack alternatifi (unless flag on and intentional).
