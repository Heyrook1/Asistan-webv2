# Deployment Guide — Asistan-webv2

Complete guide for deploying Asistan-webv2 to production on Vercel with Supabase database.

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- GitHub repository connected to Vercel
- Supabase project set up and migrated
- All environment variables configured

## Step 1: Prepare Production Supabase Database

### 1.1 Run Database Migrations

Ensure all migrations are applied to production database:

```bash
# Verify pending migrations
pnpm prisma migrate status

# Apply all pending migrations
pnpm db:migrate:deploy \
  --skip-generate \
  --skip-seed
```

**Note:** Never run `db:push` on production (it can destroy data).

### 1.2 Verify RLS Policies

All Row Level Security policies should be enabled in production:

```bash
# Check Supabase Dashboard → SQL Editor
# Verify all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All should show `rowsecurity = true`.

## Step 2: Configure Vercel

### 2.1 Create Vercel Project

```bash
# Link project to Vercel (if not already linked)
npx vercel link

# Or: Manually connect via Vercel Dashboard
```

### 2.2 Set Environment Variables

Add all required environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Visibility |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Production |
| `DATABASE_URL` | `postgresql://...@xxx.pooler.supabase.com:6543/postgres?...` | Production |
| `DIRECT_URL` | `postgresql://...@xxx.supabase.com:5432/postgres?...` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production (secret) |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@xxx.ingest.sentry.io/xxx` | Public |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | Production (secret) |
| `UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` | Production (secret) |
| `UPSTASH_REDIS_REST_TOKEN` | Token from Upstash | Production (secret) |

### 2.3 Verify Build Settings

In Vercel Dashboard → Settings → Build & Development Settings:

- **Framework Preset:** Next.js ✓
- **Build Command:** `node scripts/prisma-generate.mjs && next build`
- **Output Directory:** `.next`
- **Install Command:** `pnpm install --frozen-lockfile`

## Step 3: Deploy to Staging (Optional)

Create a staging environment to test before production:

```bash
# Create staging branch
git checkout -b staging

# Deploy to Vercel (staging environment)
# In Vercel Dashboard, link this branch to a separate preview deployment
```

Test thoroughly on staging before merging to main.

## Step 4: Deploy to Production

### 4.1 Automated Deployment (Recommended)

When you push to `main` branch, Vercel automatically:
1. Runs CI/CD checks (.github/workflows/ci.yml)
2. Builds the application
3. Applies database migrations
4. Deploys to production

```bash
# Push to main branch
git push origin main

# Monitor in Vercel Dashboard → Deployments
```

### 4.2 Manual Deployment

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs --prod
```

## Step 5: Post-Deployment Verification

### 5.1 Health Check

```bash
curl https://your-domain.com/api/health

# Should return:
# {"ok": true, "timestamp": "2026-06-09T..."}
```

### 5.2 Database Connection

```bash
# Check Supabase dashboard
# Logs tab should show successful queries
```

### 5.3 Error Monitoring

- **Sentry:** https://sentry.io/organizations/your-org/issues/
- **Vercel:** Dashboard → Monitoring → Performance

### 5.4 Analytics

- **Vercel Analytics:** https://vercel.com/analytics
- **Web Vitals:** Check LCP, CLS, FID metrics

## Step 6: Production Monitoring Setup

### 6.1 Alerts

Configure alerts in Vercel → Settings → Alerts:

- [ ] Deployment failed
- [ ] Project error rate > 1%
- [ ] Function duration > 30s

### 6.2 Sentry Alerts

Configure in Sentry → Alerts:

- [ ] New error (critical/error level)
- [ ] Error frequency spike
- [ ] Performance degradation

### 6.3 Database Monitoring

Monitor in Supabase Dashboard:

- [ ] Disk usage > 80%
- [ ] Slow queries (> 100ms)
- [ ] Connection pool exhaustion

## Step 7: Database Backups

### 7.1 Automated Backups (Supabase)

Supabase automatically backs up daily. Verify in Dashboard:

```
Settings → Backups → Daily backups enabled
```

### 7.2 Manual Export

Export sensitive data weekly:

```bash
# Export all patients as CSV
psql $DIRECT_URL -c "\COPY patients TO '/tmp/patients-backup.csv' CSV HEADER"

# Store securely (encrypted)
```

### 7.3 Restore from Backup

In case of data loss:

```bash
# 1. Supabase Dashboard → Backups → Choose restore point
# 2. Click "Restore"
# 3. Verify data restored successfully
# 4. Notify team of restoration
```

## Step 8: Scaling & Performance

### 8.1 Database Connection Pooling

Already configured with `pgbouncer` in DATABASE_URL.

Current limits:
- **Connections per app:** 20
- **Max concurrent:** 100

Monitor in Supabase → Logs:

```sql
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'postgres';
```

### 8.2 Cache Warming

On first deploy, cache will be cold. Monitor:

```
https://vercel.com/dashboard/team/your-team/insights
```

Expect 2-3 minutes before performance stabilizes.

### 8.3 Image CDN

Images are optimized by Vercel CDN automatically.

Monitor:
- Vercel → Analytics → Images
- Check cache hit ratio (should be > 90%)

## Step 9: Rollback Strategy

### 9.1 Quick Rollback

In Vercel Dashboard → Deployments:

1. Find previous stable deployment
2. Click "•••" menu
3. Select "Promote to Production"

⚠️ **Warning:** This doesn't rollback database schema changes.

### 9.2 Database Rollback

If migrations caused issues:

```bash
# 1. Revert schema changes
prisma migrate resolve --rolled-back <migration_name>

# 2. Deploy reverted migration
pnpm db:migrate:deploy

# 3. Redeploy to Vercel
git push origin main
```

## Step 10: CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. **Lints** code on every push
2. **Runs tests** before deployment
3. **Builds** Next.js application
4. **Runs E2E tests** on staging
5. **Applies migrations** before production deploy

#### Branch Protection Rules (Recommended)

Set up in GitHub Settings → Branches → Branch protection:

- Require status checks to pass:
  - ✓ lint
  - ✓ test
  - ✓ build
  - ✓ e2e
- Dismiss stale reviews when new commits pushed
- Require code review before merge (min 1)

## Troubleshooting

### Deployment Fails: "Out of Memory"

**Cause:** Build process too large

**Solution:**
```bash
# Optimize bundle
pnpm build -- --debug

# Reduce image sizes
# Compress assets
# Split code better
```

### Database Connection Timeout

**Cause:** Connection pool exhausted or network issue

**Solution:**
```bash
# Check connections in Supabase
# Increase pool size if needed
# Restart deployments
```

### Migrations Not Applied

**Cause:** Automatic migration didn't run

**Solution:**
```bash
# Manually run migrations
# Set DIRECT_URL in Vercel
# Trigger manual deployment
```

### "Rate limited" errors in production

**Cause:** API endpoints receiving too many requests

**Solution:**
- Check Upstash Redis configuration
- Verify UPSTASH_REDIS_REST_URL is set
- Monitor rate limit metrics in logs

## Production Checklist

Before launching to production:

- [ ] All environment variables set in Vercel
- [ ] Database backups enabled in Supabase
- [ ] RLS policies verified in production
- [ ] Error tracking (Sentry) configured
- [ ] Rate limiting working (test with curl)
- [ ] SSL certificate installed (automatic with Vercel)
- [ ] Security headers configured (vercel.json)
- [ ] CORS policies set correctly
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment plan
- [ ] Rollback procedure documented
- [ ] Performance baselines established

## Monitoring Commands

```bash
# View deployment logs
vercel logs --prod

# Check function duration
vercel logs --prod --type function

# See errors
vercel logs --prod --type error

# Follow live logs
vercel logs --prod --follow
```

## Support & Escalation

| Issue | Escalation |
|-------|-----------|
| Deployment fails | Check GitHub Actions logs, Vercel dashboard |
| Database down | Supabase support, check status page |
| Performance degraded | Check Vercel metrics, Sentry errors |
| Data loss | Restore from Supabase backup |

---

**Last updated:** June 9, 2026
**Maintained by:** DevOps Team
