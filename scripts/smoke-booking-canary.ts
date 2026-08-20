#!/usr/bin/env tsx
/**
 * Booking pipeline smoke — health + in-process canary (or remote cron).
 *
 * Usage:
 *   pnpm smoke:booking-canary
 *   APP_URL=https://kktc.asistan.online CRON_SECRET=... pnpm smoke:booking-canary
 *
 * Without APP_URL: runs runBookingCanary() against local DB (catalog Prisma).
 * With APP_URL: hits /api/health then /api/cron/booking-canary (Bearer).
 *
 * Run via package.json so `scripts/shim-server-only.cjs` is loaded first.
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

async function remoteSmoke(appUrl: string, cronSecret: string) {
  const base = appUrl.replace(/\/$/, '')
  const healthRes = await fetch(`${base}/api/health`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const healthJson = (await healthRes.json()) as {
    ok?: boolean
    checks?: { database?: string; catalog?: string }
  }
  console.log(
    `HEALTH ${healthRes.status} ok=${healthJson.ok} db=${healthJson.checks?.database} catalog=${healthJson.checks?.catalog}`,
  )
  if (!healthRes.ok || !healthJson.ok) {
    throw new Error('Health check failed — booking stack unhealthy')
  }

  const canaryRes = await fetch(`${base}/api/cron/booking-canary`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${cronSecret}`,
    },
    cache: 'no-store',
  })
  const canaryJson = (await canaryRes.json()) as {
    ok?: boolean
    infraFailures?: number
    configOnly?: number
    sampleSize?: number
    clinics?: Array<{ slug?: string | null; status?: string; emptyReason?: string }>
  }
  console.log(
    `CANARY ${canaryRes.status} ok=${canaryJson.ok} sample=${canaryJson.sampleSize} infra=${canaryJson.infraFailures} config=${canaryJson.configOnly}`,
  )
  for (const clinic of canaryJson.clinics ?? []) {
    console.log(`  - ${clinic.slug ?? '?'} ${clinic.status} ${clinic.emptyReason ?? ''}`)
  }
  if (!canaryRes.ok || canaryJson.ok === false) {
    throw new Error('Booking canary reported INFRA failure')
  }
}

async function localSmoke() {
  const { runBookingCanary } = await import('../lib/ops/booking-canary')
  const { runWithTenantBypassAsync } = await import('../lib/security/tenant-guard')
  const report = await runWithTenantBypassAsync('smoke:booking-canary', () =>
    runBookingCanary({ sampleSize: 5, horizonDays: 7 }),
  )
  console.log(
    `LOCAL canary ok=${report.ok} sample=${report.sampleSize} infra=${report.infraFailures} config=${report.configOnly}`,
  )
  for (const clinic of report.clinics) {
    console.log(
      `  - ${clinic.slug ?? clinic.name} ${clinic.status} slotsDays=${clinic.slotDays} ${clinic.emptyReason ?? ''}`,
    )
  }
  if (!report.ok) {
    throw new Error('Local booking canary reported INFRA failure')
  }
}

async function main() {
  const appUrl = process.env.APP_URL?.trim()
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (appUrl) {
    if (!cronSecret) {
      throw new Error('APP_URL set but CRON_SECRET missing')
    }
    await remoteSmoke(appUrl, cronSecret)
  } else {
    await localSmoke()
  }

  console.log('smoke:booking-canary PASS')
}

main().catch((error) => {
  console.error('smoke:booking-canary FAIL', error)
  process.exitCode = 1
})
