#!/usr/bin/env tsx
/**
 * S2 cross-tenant IDOR integration test (A2).
 *
 * Creates two throwaway tenants (owner connection), then proves via the
 * asistan_app connection that tenant A cannot read, update, or insert into
 * tenant B's PHI — even with B's real UUIDs in hand.
 *
 * Usage:
 *   pnpm smoke:cross-tenant
 *
 * Requires:
 *   DATABASE_URL_MIGRATE (or DIRECT_URL)  — owner, for fixture setup/teardown
 *   ASISTAN_APP_DATABASE_URL              — asistan_app runtime role
 *
 * Fixture rows are tagged with the `s2-smoke-` slug/email prefix and deleted
 * in a finally block, so re-runs are safe.
 */
import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const ownerUrl =
  process.env.DATABASE_URL_MIGRATE?.trim() || process.env.DIRECT_URL?.trim()
const appUrl = process.env.ASISTAN_APP_DATABASE_URL?.trim()

if (!ownerUrl) {
  console.error('FAIL: DATABASE_URL_MIGRATE / DIRECT_URL (owner) is required')
  process.exit(1)
}
if (!appUrl) {
  console.error('FAIL: ASISTAN_APP_DATABASE_URL is required')
  process.exit(1)
}

const owner = new PrismaClient({ datasources: { db: { url: ownerUrl } } })
const app = new PrismaClient({ datasources: { db: { url: appUrl } } })

type Check = { name: string; pass: boolean; detail?: string }
const checks: Check[] = []

function record(name: string, pass: boolean, detail?: string) {
  checks.push({ name, pass, detail })
}

const runId = randomUUID().slice(0, 8)
const TAG = `s2-smoke-${runId}`

type Tenant = {
  userId: string
  businessId: string
  patientId: string
  serviceId: string
  appointmentId: string
}

async function createTenant(label: 'a' | 'b'): Promise<Tenant> {
  const userId = randomUUID()
  const user = await owner.user.create({
    data: {
      id: userId,
      email: `${TAG}-${label}@smoke.invalid`,
      fullName: `S2 Smoke ${label.toUpperCase()}`,
    },
  })
  const business = await owner.business.create({
    data: {
      name: `S2 Smoke Clinic ${label.toUpperCase()}`,
      slug: `${TAG}-${label}`,
      ownerUserId: user.id,
    },
  })
  const patient = await owner.patient.create({
    data: {
      businessId: business.id,
      patientNumber: `${TAG}-${label}`,
      fullName: `Smoke Patient ${label.toUpperCase()}`,
      phone: '+905000000000',
    },
  })
  const service = await owner.service.create({
    data: {
      businessId: business.id,
      name: `Smoke Service ${label.toUpperCase()}`,
    },
  })
  const appointment = await owner.appointment.create({
    data: {
      businessId: business.id,
      patientId: patient.id,
      serviceId: service.id,
      date: new Date('2099-01-01'),
      startTime: '10:00',
      endTime: '10:30',
    },
  })
  return {
    userId: user.id,
    businessId: business.id,
    patientId: patient.id,
    serviceId: service.id,
    appointmentId: appointment.id,
  }
}

async function cleanup() {
  // Cascade: deleting Business removes patients/services/appointments.
  await owner.business
    .deleteMany({ where: { slug: { startsWith: 's2-smoke-' } } })
    .catch(() => null)
  await owner.user
    .deleteMany({ where: { email: { endsWith: '@smoke.invalid' } } })
    .catch(() => null)
}

async function setGuc(businessId: string) {
  // Session-level (local=false): persists across the pooled connection for probes.
  await app.$executeRaw`SELECT set_config('app.business_id', ${businessId}, false)`
}

async function countAppointment(id: string): Promise<number> {
  const rows = await app.$queryRaw<Array<{ count: bigint }>>`
    SELECT count(*)::bigint AS count FROM "Appointment" WHERE id = ${id}
  `
  return Number(rows[0]?.count ?? -1)
}

async function countPatient(id: string): Promise<number> {
  const rows = await app.$queryRaw<Array<{ count: bigint }>>`
    SELECT count(*)::bigint AS count FROM "Patient" WHERE id = ${id}
  `
  return Number(rows[0]?.count ?? -1)
}

async function main() {
  await cleanup() // clear any leftovers from aborted runs

  const a = await createTenant('a')
  const b = await createTenant('b')

  try {
    // ── As tenant A ─────────────────────────────────────────────────────────
    await setGuc(a.businessId)

    record(
      'A reads own appointment',
      (await countAppointment(a.appointmentId)) === 1,
    )
    record(
      'A cannot read B appointment (IDOR)',
      (await countAppointment(b.appointmentId)) === 0,
    )
    record('A cannot read B patient (PHI)', (await countPatient(b.patientId)) === 0)

    const crossUpdate = await app.$executeRaw`
      UPDATE "Appointment" SET notes = 'hacked' WHERE id = ${b.appointmentId}
    `
    record('A cannot UPDATE B appointment', Number(crossUpdate) === 0, `rows=${crossUpdate}`)

    let insertBlocked = false
    try {
      await app.$executeRaw`
        INSERT INTO "Appointment"
          ("id", "businessId", "patientId", "serviceId", "date", "startTime", "endTime", "updatedAt")
        VALUES
          (${randomUUID()}, ${b.businessId}, ${b.patientId}, ${b.serviceId},
           '2099-01-02', '11:00', '11:30', now())
      `
    } catch {
      insertBlocked = true
    }
    record('A cannot INSERT into B (WITH CHECK)', insertBlocked)

    // ── As tenant B: A's data must be invisible ────────────────────────────
    await setGuc(b.businessId)
    record(
      'B reads own appointment',
      (await countAppointment(b.appointmentId)) === 1,
    )
    record(
      'B cannot read A appointment',
      (await countAppointment(a.appointmentId)) === 0,
    )

    // ── No GUC: everything invisible ───────────────────────────────────────
    await app.$executeRaw`SELECT set_config('app.business_id', '', false)`
    record(
      'No GUC sees nothing',
      (await countAppointment(a.appointmentId)) === 0 &&
        (await countAppointment(b.appointmentId)) === 0,
    )

    // Verify owner-side B row is untouched by the blocked UPDATE
    const bRow = await owner.appointment.findFirst({
      where: { id: b.appointmentId },
      select: { notes: true },
    })
    record('B appointment notes untouched', bRow?.notes == null, `notes=${bRow?.notes}`)
  } finally {
    await cleanup()
    await owner.$disconnect()
    await app.$disconnect()
  }

  let failed = 0
  for (const c of checks) {
    if (!c.pass) failed += 1
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name}${c.detail ? ` — ${c.detail}` : ''}`)
  }
  console.log(
    failed === 0
      ? '\nCross-tenant isolation VERIFIED — tenant A cannot touch tenant B via asistan_app.'
      : `\n${failed} check(s) FAILED — tenant isolation is broken, do not ship.`,
  )
  process.exit(failed === 0 ? 0 : 1)
}

main().catch(async (error) => {
  console.error(error)
  await cleanup().catch(() => null)
  await owner.$disconnect()
  await app.$disconnect()
  process.exit(1)
})
