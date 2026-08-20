# Google Calendar busy-block sync (FreeBusy)

## Scope (MVP)

- **In:** OAuth connect per bookable clinician → Google FreeBusy → `TeamMemberUnavailableBlock` (`source=GOOGLE_CALENDAR`)
- **Out (deferred):** write appointments back to Google; Outlook/Graph (UI shows “Yakında”)

Patient marketplace slot math and dashboard appointment conflict checks both respect unavailable blocks.

## Env

```bash
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
CALENDAR_TOKEN_ENCRYPTION_KEY=   # 64-hex or any passphrase (SHA-256)
# Optional: pin OAuth redirect origin (prod proxy / multi-host)
GOOGLE_CALENDAR_REDIRECT_ORIGIN=https://kktc.asistan.online
ASISTAN_FLAG_CALENDAR_SYNC=1     # set 0 to disable even when configured
CRON_SECRET=                     # protects /api/cron/google-calendar-sync
```

Google Cloud Console redirect URI:

`https://<host>/api/integrations/google-calendar/callback`

OAuth scope: `https://www.googleapis.com/auth/calendar.freebusy` (busy only — no event titles / PHI).

## UI

Dashboard → Ayarlar → **Entegrasyonlar**

## Cron

`CRON_SECRET` protects both routes. Schedule via system crontab or `.github/workflows/cron.example.yml` (not Vercel Cron).

## Migrate

Apply `supabase/migrations/20260714000100_google_calendar_busy_sync.sql` (or `pnpm db:push` in non-prod).
