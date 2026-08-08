# Deployment Guide — Asistan-webv2

Production stack: **Node.js host** (VPS, bare metal, PaaS, or your own runner) + **Supabase Postgres/Auth/Storage**.  
This project does **not** require Vercel.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project (Postgres + Auth + Storage buckets)
- Host with HTTPS reverse proxy (nginx, Caddy, Cloudflare, etc.)
- Upstash Redis REST (rate limits across instances)
- Sentry (optional, recommended)

## Step 1: Database & security (Supabase)

```bash
# One command — Prisma deploy + RLS stack + storage validation + checks
pnpm production:rollout
```

Or step-by-step:

```bash
pnpm db:deploy
pnpm db:files:migrate -- --apply --validate   # only if legacy base64 rows exist
pnpm check:rls-policies
pnpm check:production
```

**Never** run `db:push` on production.

Canonical RLS inventory: `lib/security/rls-inventory.ts` · ops: `docs/security-ops.md`

## Step 2: Environment variables

Set on your host (systemd, Docker, PM2, hosting panel, etc.):

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | yes | `production` |
| `DATABASE_URL` | yes | Supabase pooler (port 6543) |
| `DIRECT_URL` | yes | Direct Postgres (port 5432) for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Public (allowlisted) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon — RLS enforced; never service_role |
| `NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY` | optional | Public VAPID; private key is `WEB_PUSH_VAPID_PRIVATE_KEY` only |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (server) | Auth Admin / Storage Admin only — never browser; elevated scripts need `--i-know-this-bypasses-rls` (`docs/security-ops.md`) |
| `CRON_SECRET` | yes (all envs) | `Authorization: Bearer <secret>` for `/api/cron/*` — missing secret → `503` (fail-closed) |
| `SMS_PROVIDER_WEBHOOK_URL` | for live SMS | Outbound patient SMS bridge — see `docs/patient-outbound-channels.md` § Prod bind |
| `WHATSAPP_PROVIDER_WEBHOOK_URL` | for live WA | Outbound patient WhatsApp + front-desk replies |
| `EMAIL_PROVIDER_WEBHOOK_URL` | optional | Outbound patient email |
| `NOTIFICATION_PROVIDER_TOKEN` | for adapter | Bearer on outbound POSTs; clinic-bound inbound HMAC(`token`, `whatsapp-inbound:{slug}`) — raw token alone rejected |
| `WHATSAPP_APP_SECRET` | for Meta inbound | `X-Hub-Signature-256` on `/api/webhooks/whatsapp` (unsigned → 401) |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | for Meta GET verify | `hub.challenge` on `/api/webhooks/whatsapp` |
| `WHATSAPP_INBOUND_TOKENS` | optional | Static `slug:token,…` map; wrong slug → 403 |
| `UPSTASH_REDIS_REST_URL` | yes | Shared rate limits |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Shared rate limits |
| `PERSON_IDENTITY_PEPPER` | yes | ≥16 chars in production |
| `ASISTAN_TENANT_GUARD` | recommended | `enforce` in production |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | Browser error tracking |
| `SENTRY_DSN` | optional | Server/Edge (falls back to public DSN) |
| `SENTRY_AUTH_TOKEN` | optional | Source maps upload |
| `NEXT_PUBLIC_APP_VERSION` | optional | Sentry release tag |

## Step 3: Build & run

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
pnpm start   # listens on PORT (default 3000)
```

### Example: systemd unit

```ini
[Unit]
Description=Asistan Rezervasyon
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/asistan-webv2
EnvironmentFile=/etc/asistan/env
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Put env in `/etc/asistan/env`, then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now asistan
```

### Reverse proxy

Terminate TLS at nginx/Caddy and proxy to `127.0.0.1:3000`. Security headers are set in `next.config.mjs` / `lib/security/response-headers.ts`.

## Step 4: Scheduled jobs (cron)

Vercel Cron is **not** used. Call HTTP endpoints from your scheduler with `CRON_SECRET`:

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Appointment reminders | hourly `:00` | `GET /api/cron/appointment-reminders` |
| Google Calendar sync | hourly `:15` | `GET /api/cron/google-calendar-sync` |
| Notification outbox | every 10m | `GET /api/cron/notification-outbox` |
| Booking availability canary | every 10m | `GET /api/cron/booking-canary` |

```bash
# crontab -e (replace APP_URL and CRON_SECRET)
0 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://APP_URL/api/cron/appointment-reminders"
15 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://APP_URL/api/cron/google-calendar-sync"
*/10 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://APP_URL/api/cron/notification-outbox"
*/10 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://APP_URL/api/cron/booking-canary"
```

GitHub Actions scheduled workflow is fine too — see `.github/workflows/cron.example.yml`.

## Step 5: Deploy new releases

```bash
git pull
pnpm install --frozen-lockfile
pnpm production:rollout    # DB layer (idempotent)
pnpm build
sudo systemctl restart asistan   # or your process manager
```

### Health check

```bash
curl -fsS https://your-domain.com/api/health
# {"ok":true,"timestamp":"...","checks":{"database":"healthy","catalog":"healthy","rateLimit":{...}}}

# Live booking canary (infra vs clinic config)
curl -fsS -H "Authorization: Bearer $CRON_SECRET" "https://your-domain.com/api/cron/booking-canary"
# Local/CI: pnpm smoke:booking-canary
# Remote: APP_URL=https://your-domain.com CRON_SECRET=... pnpm smoke:booking-canary
```

## Step 6: Monitoring

- **Sentry** — errors and performance; booking canary INFRA → error events (`component:booking-canary`)
- **Supabase** — DB metrics, backups, slow queries
- **Host logs** — `journalctl -u asistan -f` or your platform logs
- **Booking canary crontab** — every 10m; HTTP 503 = infrastructure failure (empty slots for all clinics class)
- **Upstash** — rate-limit dashboard (optional on single-node; required when scaling)

## Rollback

1. **App:** redeploy previous build artifact / git checkout + `pnpm build` + restart process
2. **Database:** RLS migrations are additive/idempotent; do not roll back without a planned SQL revert. Supabase point-in-time restore for emergencies.

## Production checklist

- [ ] `pnpm production:rollout` passes (except env you intentionally skip in staging)
- [ ] `CRON_SECRET` set; reminders, outbox, and booking-canary return 200 with Bearer token
- [ ] `pnpm smoke:booking-canary` PASS (or remote `APP_URL=… pnpm smoke:booking-canary`)
- [ ] `/api/health` reports `database` + `catalog` healthy
- [ ] Upstash env set (`check:production` rate-limit check passes)
- [ ] `patient-files` bucket private; storage constraints validated
- [ ] HTTPS + reverse proxy configured
- [ ] Supabase daily backups enabled
- [ ] Sentry receiving events from production

## Troubleshooting

| Issue | Action |
|-------|--------|
| `check:production` Upstash FAIL | Set `UPSTASH_REDIS_REST_URL` + `TOKEN` on host |
| Cron 401 | Set `CRON_SECRET` on host; send `Authorization: Bearer …` |
| Cron 503 | `CRON_SECRET` missing — required in all environments (no fail-open) |
| RLS audit FAIL | Run `pnpm db:ready` against `DIRECT_URL` |
| Migrations | Use `pnpm db:deploy`, not manual SQL unless documented |

---

**Last updated:** July 2026
