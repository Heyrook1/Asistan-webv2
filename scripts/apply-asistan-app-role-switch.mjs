/**
 * Apply S2 GUC RLS migration + switch runtime DATABASE_URL to asistan_app.
 *
 * - Connects as owner via DIRECT_URL / POSTGRES_URL_NON_POOLING
 * - Applies 20260720000100 + 20260720000200 (idempotent)
 * - Sets passwords for asistan_app / asistan_identity
 * - Rewrites .env.local: DATABASE_URL → asistan_app (session 5432),
 *   DATABASE_URL_MIGRATE + DIRECT_URL stay owner
 *
 * Usage: node scripts/apply-asistan-app-role-switch.mjs
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const MIGRATIONS = [
  '20260720000100_marketing_and_webhook_idempotency.sql',
  '20260720000200_prisma_guc_rls.sql',
]

function resolveOwnerUrl() {
  return (
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_MIGRATE ||
    process.env.DATABASE_URL ||
    null
  )
}

function createClient(connectionString) {
  const url = new URL(connectionString)
  url.searchParams.set('uselibpqcompat', 'true')
  return new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000,
  })
}

function parseProjectRef(ownerUrl) {
  // postgres.PROJECTREF@... or user@db.PROJECTREF.supabase.co
  const u = new URL(ownerUrl)
  const user = decodeURIComponent(u.username)
  if (user.includes('.')) return user.split('.').slice(1).join('.')
  const host = u.hostname
  const m = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
  if (m) return m[1]
  return null
}

function buildRoleUrl(ownerUrl, roleName, password, { port = 5432, pgbouncer = false } = {}) {
  const u = new URL(ownerUrl)
  const ref = parseProjectRef(ownerUrl)
  // Supabase pooler expects role.projectref; direct db host accepts bare role.
  const isPooler = u.hostname.includes('pooler.supabase.com')
  const user = isPooler && ref ? `${roleName}.${ref}` : roleName
  u.username = user
  u.password = password
  u.port = String(port)
  const params = new URLSearchParams(u.search)
  params.set('sslmode', 'require')
  if (pgbouncer) params.set('pgbouncer', 'true')
  else params.delete('pgbouncer')
  params.delete('connection_limit')
  params.delete('pool_timeout')
  u.search = params.toString()
  return u.toString()
}

function upsertEnvFile(filePath, updates) {
  let text = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
  if (!text.endsWith('\n') && text.length > 0) text += '\n'

  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}="${value}"`
    const re = new RegExp(`^${key}=.*$`, 'm')
    if (re.test(text)) {
      text = text.replace(re, line)
    } else {
      text += `\n# S2 asistan_app role switch\n${line}\n`
    }
  }
  fs.writeFileSync(filePath, text, 'utf8')
}

async function main() {
  const ownerUrl = resolveOwnerUrl()
  if (!ownerUrl) {
    console.error('No owner DATABASE_URL / DIRECT_URL')
    process.exit(1)
  }

  const appPassword = crypto.randomBytes(24).toString('base64url')
  const identityPassword = crypto.randomBytes(24).toString('base64url')

  const client = createClient(ownerUrl)
  console.log('[s2-switch] Connecting as owner...')
  await client.connect()

  try {
    for (const file of MIGRATIONS) {
      const migrationPath = path.join('supabase', 'migrations', file)
      if (!fs.existsSync(migrationPath)) {
        console.warn(`[s2-switch] skip missing ${file}`)
        continue
      }
      console.log(`[s2-switch] Applying ${file}...`)
      const sql = fs.readFileSync(migrationPath, 'utf8')
      await client.query(sql)
    }

    console.log('[s2-switch] Setting role passwords...')
    // ALTER ROLE ... PASSWORD does not accept bind params — escape safely.
    const escapeLiteral = (value) => `'${String(value).replace(/'/g, "''")}'`
    await client.query(
      `ALTER ROLE asistan_app WITH LOGIN PASSWORD ${escapeLiteral(appPassword)}`,
    )
    await client.query(
      `ALTER ROLE asistan_identity WITH LOGIN PASSWORD ${escapeLiteral(identityPassword)}`,
    )

    // Ensure roles can use schema (migration should have granted; belt+suspenders)
    await client.query('GRANT USAGE ON SCHEMA public TO asistan_app, asistan_identity')

    const roles = await client.query(
      `SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname IN ('asistan_app','asistan_identity')`,
    )
    for (const row of roles.rows) {
      console.log(`[s2-switch] role ${row.rolname} bypassrls=${row.rolbypassrls}`)
    }
  } finally {
    await client.end()
  }

  // Session-mode 5432 for app (SET LOCAL / interactive tx safe)
  const asistanAppUrl = buildRoleUrl(ownerUrl, 'asistan_app', appPassword, {
    port: 5432,
    pgbouncer: false,
  })
  const asistanIdentityUrl = buildRoleUrl(ownerUrl, 'asistan_identity', identityPassword, {
    port: 5432,
    pgbouncer: false,
  })

  // Owner migrate URL: prefer existing DIRECT_URL
  const migrateUrl =
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ownerUrl

  const envLocal = path.join(process.cwd(), '.env.local')
  console.log('[s2-switch] Updating .env.local ...')
  upsertEnvFile(envLocal, {
    DATABASE_URL_MIGRATE: migrateUrl,
    DIRECT_URL: migrateUrl,
    DATABASE_URL: asistanAppUrl,
    ASISTAN_APP_DATABASE_URL: asistanAppUrl,
    ASISTAN_IDENTITY_DATABASE_URL: asistanIdentityUrl,
  })

  // Also patch .env if it defines DATABASE_URL (keep migrate owner there too)
  const envFile = path.join(process.cwd(), '.env')
  if (fs.existsSync(envFile)) {
    upsertEnvFile(envFile, {
      DATABASE_URL_MIGRATE: migrateUrl,
      DIRECT_URL: migrateUrl,
      DATABASE_URL: asistanAppUrl,
      ASISTAN_APP_DATABASE_URL: asistanAppUrl,
      ASISTAN_IDENTITY_DATABASE_URL: asistanIdentityUrl,
    })
  }

  console.log('[s2-switch] Done.')
  console.log('[s2-switch] DATABASE_URL → asistan_app (session :5432)')
  console.log('[s2-switch] DATABASE_URL_MIGRATE / DIRECT_URL → owner')
  console.log('[s2-switch] Next: pnpm smoke:asistan-app-rls')
}

main().catch((error) => {
  console.error('[s2-switch] FAILED:', error.message)
  process.exit(1)
})
