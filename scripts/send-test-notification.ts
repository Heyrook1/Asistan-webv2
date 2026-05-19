// Smoke test: writes a realistic notification + dispatches Web Push so the
// browser tab (or service worker, when supported) gets it.
//
// Run with:  pnpm tsx scripts/send-test-notification.ts
//
// Standalone script — avoids Next's `server-only` boundary so it can run from
// the CLI. Mirrors what `createNotification` does in the app.

import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import webpush from 'web-push'

const prisma = new PrismaClient()

async function main() {
  // ── Configure Web Push (best-effort) ─────────────────────────────────────
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY
  const contactEmail = process.env.WEB_PUSH_CONTACT_EMAIL ?? 'admin@asistan.health'
  const pushReady = Boolean(publicKey && privateKey)
  if (pushReady) {
    webpush.setVapidDetails(`mailto:${contactEmail}`, publicKey!, privateKey!)
  }
  console.log(`Web Push: ${pushReady ? 'configured' : 'NOT configured (no VAPID keys)'}`)

  const business = await prisma.business.findFirst({
    select: { id: true, name: true, ownerUserId: true },
  })
  if (!business) {
    console.error('No business found.')
    process.exit(1)
  }

  const owner = await prisma.user.findUnique({
    where: { id: business.ownerUserId },
    select: { id: true, fullName: true, email: true },
  })

  console.log(`→ business: ${business.name}`)
  console.log(`→ owner:    ${owner?.fullName} <${owner?.email}>`)

  const patient = await prisma.patient.findFirst({
    where: { businessId: business.id, isArchived: false },
    select: { id: true, fullName: true, patientNumber: true, phone: true, tags: true },
  })
  const appointment = patient
    ? await prisma.appointment.findFirst({
        where: { businessId: business.id, patientId: patient.id },
        include: { service: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      })
    : null

  const today = new Date().toISOString().slice(0, 10)
  const title = 'Onay bekleyen randevu (TEST)'
  const message = patient
    ? `${patient.fullName} için ${appointment?.service?.name ?? 'muayene'} randevusu onay bekliyor. ${today} 14:30`
    : 'Test bildirimi — bildirim sistemi canlı.'
  const link = appointment ? `/dashboard/randevular?id=${appointment.id}` : '/dashboard/bildirimler'

  const notification = await prisma.notification.create({
    data: {
      businessId: business.id,
      userId: owner!.id,
      actorUserId: owner!.id,
      type: 'APPOINTMENT',
      subtype: 'appointment_pending_approval',
      title,
      message,
      link,
      entityType: appointment ? 'appointment' : 'system',
      entityId: appointment?.id ?? null,
      priority: 'HIGH',
      actionRequired: true,
      metadata: {
        source: 'smoke-test',
        patientId: patient?.id ?? null,
        patientName: patient?.fullName ?? null,
        phone: patient?.phone ?? null,
        tags: patient?.tags ?? [],
        appointmentId: appointment?.id ?? null,
        serviceName: appointment?.service?.name ?? null,
        date: today,
        startTime: '14:30',
      } as Prisma.InputJsonValue,
      actions: appointment
        ? {
            create: [
              { label: 'Onayla',   actionType: 'APPOINTMENT_APPROVE',    payload: { appointmentId: appointment.id } as Prisma.InputJsonValue },
              { label: 'İptal Et', actionType: 'APPOINTMENT_CANCEL',     payload: { appointmentId: appointment.id } as Prisma.InputJsonValue },
              { label: 'Ertele',   actionType: 'APPOINTMENT_RESCHEDULE', payload: { appointmentId: appointment.id } as Prisma.InputJsonValue },
            ],
          }
        : { create: [{ label: 'Tamam', actionType: 'ACK' }] },
    },
    include: { actions: true },
  })

  console.log(`\n✓ created notification ${notification.id} with ${notification.actions.length} action(s)`)

  // ── Dispatch Web Push ────────────────────────────────────────────────────
  const subs = await prisma.pushSubscription.findMany({ where: { userId: owner!.id } })
  console.log(`\nPushSubscription rows for owner: ${subs.length}`)

  if (!pushReady) {
    console.log('  ↳ VAPID anahtarları yok, push atlanıyor.')
  } else if (subs.length === 0) {
    console.log('  ↳ Tarayıcı henüz abone değil. Bildirim Merkezi\'nde "Tarayıcı bildirimlerini aç" düğmesine basın, izin verin, sonra bu testi tekrar çalıştırın.')
  } else {
    const body = JSON.stringify({
      id: notification.id,
      title,
      body: message,
      url: link,
      tag: `asistan-${notification.id}`,
    })
    const staleIds: string[] = []
    let sent = 0
    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body,
            { TTL: 60 * 60 }
          )
          sent += 1
        } catch (e) {
          const status = (e as { statusCode?: number })?.statusCode
          if (status === 404 || status === 410) staleIds.push(sub.id)
          else console.warn('  push failed:', sub.endpoint.slice(0, 60), e instanceof Error ? e.message : e)
        }
      })
    )
    console.log(`  ↳ ${sent}/${subs.length} push dispatched.`)
    if (staleIds.length) {
      await prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } })
      console.log(`  ↳ ${staleIds.length} stale subscription(s) removed.`)
    }
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
