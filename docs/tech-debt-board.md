# Teknik borç panosu — Master Audit 2.4 (22 Temmuz 2026)

| Borç | Durum | Not |
|------|-------|-----|
| WA HMAC + fail-open | **done** | Meta HMAC + slug-bound bearer (BUG-001); raw global bearer → 401; wrong slug → 403 |
| Cron fail-closed | **done** | BUG-002: her env’de `CRON_SECRET` zorunlu; secretsiz 503; reminders + gcal |
| E-reçete copy scrub | **done** | BUG-006: printable klinik Rx + claim-bank UI scan |
| Discovery N+1 | **done** | BUG-005: slot batch (fill-the-gap); 50 doktor p95 test |
| Auth ASCII pages | **done** | BUG-003: forgot/setup/reset UTF-8 + `passwordFlowCopy` snapshot |
| Client mutation RL | **done** | bookings/cancel/reschedule/reviews |
| God-board residual | **done** | Calendar toolbar/filters/share + team dialogs/banner split; `docs/god-board-split.md` |
| Waitlist Zod + RL | **done** | Zod email + 5/saat/IP |

Yeni borç eklerken bu tabloyu güncelle; kapanan satırı `denetim-yol-haritasi` ile hizala.
