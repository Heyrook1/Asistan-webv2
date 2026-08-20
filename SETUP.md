# Setup Guide — Asistan-webv2

This guide walks you through setting up Asistan-webv2 for local development.

## Prerequisites

- **Node.js:** Version 20 or higher
- **pnpm:** Package manager (`npm install -g pnpm`)
- **Git:** For version control
- **Docker:** (Optional) For running PostgreSQL locally
- **Supabase Account:** For database and authentication

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Asistan-webv2
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all project dependencies including Next.js, Prisma, Supabase, and testing libraries.

## Step 3: Environment Variables

Create two environment files in the project root:

### `.env` (Database connection for development)

```bash
# Database connection (pooled, for app queries)
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?schema=public&sslmode=require&pgbouncer=true"

# Direct connection (non-pooled, for migrations/admin tasks)
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/postgres?schema=public&sslmode=require"
```

Get these URLs from your Supabase Dashboard → Settings → Database.

### `.env.local` (Supabase keys - never commit)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

Get these from Supabase Dashboard → Settings → API.

### `.env.production` (Optional, for staging/production)

```bash
# Set environment-specific values
NODE_ENV=production
NEXT_PUBLIC_SENTRY_DSN=https://...   # browser
SENTRY_DSN=https://...               # server/edge (optional; falls back to public DSN)
NEXT_PUBLIC_APP_VERSION=1.0.0        # Sentry release tag
```

## Step 4: Database Setup

### Option A: Use Existing Supabase Project

If your Supabase project already has the schema:

```bash
# Verify database connection
pnpm db:migrate:deploy

# Generate Prisma client
pnpm db:generate
```

### Option B: Fresh Database Setup

If starting from scratch:

```bash
# Push Prisma schema to database (development only, overwrites existing schema)
pnpm db:push

# Generate Prisma client
pnpm db:generate

# Optional: Seed demo data
pnpm db:seed
```

## Step 5: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** The dev server will take 5-10 seconds to start as it compiles Next.js and TypeScript.

## Step 6: Verify Setup

1. **Homepage loads** — Navigate to http://localhost:3000
2. **Database connected** — Check Network tab (should see API calls succeeding)
3. **Styles loaded** — Page should be styled (not plain HTML)
4. **No console errors** — Open DevTools → Console tab (should be clean)

## Mobile App Setup (Optional)

To run the React Native mobile app alongside the web app:

```bash
# Install mobile dependencies
cd mobile
pnpm install
cd ..

# Run web + mobile simultaneously
pnpm mobile:web:full
```

This starts:
- Next.js dev server on http://localhost:3000
- Metro bundler on http://localhost:8081
- Web preview of mobile app on http://localhost:3001

## Development Workflow

### Running Tests

```bash
# Unit tests (watch mode)
pnpm test:watch

# Unit tests (run once)
pnpm test

# Unit tests with UI
pnpm test:ui

# E2E tests (Playwright)
pnpm e2e

# E2E tests with browser UI
pnpm e2e:ui

# E2E tests in debug mode
pnpm e2e:debug
```

### Code Quality

```bash
# Lint code
pnpm lint

# Type check (included in lint)
pnpm lint
```

### Database Migrations

After modifying `prisma/schema.prisma`:

```bash
# Development (push schema to DB, overwrites existing)
pnpm db:push

# Production (create migration file)
pnpm db:migrate:dev --name my_migration_name

# Run pending migrations
pnpm db:migrate:deploy
```

### Generating Prisma Client

Required after any schema changes:

```bash
pnpm db:generate
```

## Folder Structure

```
Asistan-webv2/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── [lang]/            # Language-based routing
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── client/            # Client-facing pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn)
│   ├── dashboard/        # Dashboard-specific components
│   ├── sections/         # Landing page sections
│   └── marketing/        # Marketing page components
├── lib/                  # Utility functions & hooks
│   ├── actions/         # Server actions
│   ├── supabase/        # Supabase client setup
│   └── api-response.ts  # API response utilities
├── prisma/              # Database schema & migrations
│   ├── schema.prisma    # Data model
│   └── seed.ts          # Seed script
├── tests/               # Test files
│   ├── unit/           # Unit tests (Vitest)
│   └── e2e/            # E2E tests (Playwright)
├── public/              # Static files
└── tailwind.config.ts   # Tailwind configuration
```

## Common Issues & Troubleshooting

### "Connection refused" error

**Problem:** Cannot connect to database

**Solution:**
1. Verify DATABASE_URL and DIRECT_URL in `.env`
2. Check Supabase project status (should be "Healthy")
3. Verify IP whitelist in Supabase (if applicable)
4. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### "NEXT_PUBLIC_SUPABASE_URL is missing"

**Problem:** Supabase client initialization fails

**Solution:**
1. Add NEXT_PUBLIC_SUPABASE_URL to `.env.local`
2. Restart dev server: Ctrl+C, then `pnpm dev`

### Port 3000 already in use

**Problem:** Another process using port 3000

**Solution:**
```bash
# macOS/Linux: Find and kill process
lsof -i :3000
kill -9 <PID>

# Windows: Use Task Manager or
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
pnpm dev -- -p 3001
```

### Prisma migration conflicts

**Problem:** "Migration failed: column already exists"

**Solution:**
```bash
# Reset database (⚠️ deletes all data)
pnpm db:push --force-reset

# Or manually check schema conflicts
# prisma/schema.prisma vs supabase/migrations/
```

### Tests failing with "cannot find module"

**Problem:** Module resolution error in tests

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .pnpm-store
pnpm install

# Regenerate Prisma
pnpm db:generate
```

## Performance Tips

1. **Enable Fast Refresh:** Auto-reload on file changes (enabled by default)
2. **TypeScript:** Type checking in background doesn't block dev server
3. **Bundle Analysis:** Check bundle size with `ANALYZE=true pnpm build`
4. **Database Query Profiling:** Use Supabase dashboard's "Logs" tab

## Next Steps

1. Create a `.env.local` and add Supabase credentials
2. Run `pnpm dev` and open http://localhost:3000
3. Create an account to test the dashboard
4. Read [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
5. Check out tests with `pnpm test` or `pnpm e2e`

## Getting Help

- **Issues:** Check existing [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation:** See [README.md](README.md) for architecture
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Last updated:** June 9, 2026
