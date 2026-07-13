import 'server-only'

import { AppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClientNotification } from '@/lib/client-marketplace/notifications'
import { sendAppointmentReminder } from '@/lib/notifications/channels'

type ReminderWindow = '24h' | '2h'

type DueAppointment = {
  id: string
  date: Date
  startTime: string
  clientUserId: string
  businessId: string
  patientId: string
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  serviceName: string
  clinicName: string
}

function parseLocalDateTime(date: Date, startTime: string) {
  const ymd = date.toISOString().slice(0, 10)
  return new Date(`${ymd}T${startTime}:00`)
}

function windowBounds(now: Date, window: ReminderWindow) {
  const ms = window === '24h' ? 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000
  const skew = window === '24h' ? 30 * 60 * 1000 : 15 * 60 * 1000
  return {
    from: new Date(now.getTime() + ms - skew),
    to: new Date(now.getTime() + ms + skew),
  }
}

async function alreadyReminded(appointmentId: string, window: ReminderWindow) {
  const existing = await prisma.clientNotification.findMany({
    where: {
      appointmentId,
      type: 'APPOINTMENT_REMINDER',
    },
    select: { id: true, metadata: true },
    take: 20,
  })
  return existing.some((row) => {
    const meta = row.metadata as { window?: string } | null
    return meta?.window === window
  })
}

async function loadDueAppointments(from: Date, to: Date): Promise<DueAppointment[]> {
  const fromDay = new Date(from.toISOString().slice(0, 10))
  const toDay = new Date(to.toISOString().slice(0, 10))

  const rows = await prisma.appointment.findMany({
    where: {
      deletedAt: null,
      clientUserId: { not: null },
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      date: { gte: fromDay, lte: toDay },
    },
    include: {
      patient: { select: { fullName: true, email: true, phone: true } },
      service: { select: { name: true } },
      business: { select: { name: true } },
    },
    take: 500,
  })

  return rows
    .filter((row) => row.clientUserId)
    .map((row) => ({
      id: row.id,
      date: row.date,
      startTime: row.startTime,
      clientUserId: row.clientUserId as string,
      businessId: row.businessId,
      patientId: row.patientId,
      patientName: row.patient.fullName,
      patientEmail: row.patient.email,
      patientPhone: row.patient.phone,
      serviceName: row.service.name,
      clinicName: row.business.name,
    }))
    .filter((row) => {
      const startsAt = parseLocalDateTime(row.date, row.startTime)
      return startsAt >= from && startsAt <= to
    })
}

async function dispatchReminder(row: DueAppointment, window: ReminderWindow) {
  if (await alreadyReminded(row.id, window)) {
    return { skipped: true as const }
  }

  const startsAt = parseLocalDateTime(row.date, row.startTime).toISOString()
  const whenLabel = window === '24h' ? 'yarın' : 'yaklaşan'
  const dateStr = row.date.toISOString().slice(0, 10)

  await createClientNotification({
    clientUserId: row.clientUserId,
    businessId: row.businessId,
    appointmentId: row.id,
    type: 'APPOINTMENT_REMINDER',
    title: window === '24h' ? 'Yarın randevunuz var' : 'Randevunuz yaklaşıyor',
    message: `${row.clinicName} • ${row.serviceName} • ${dateStr} ${row.startTime}`,
    link: `/client/bookings?id=${row.id}`,
    metadata: {
      window,
      appointmentId: row.id,
      startsAt,
      whenLabel,
    },
  })

  const channels: Array<'email' | 'sms'> = []
  if (row.patientEmail) channels.push('email')
  if (row.patientPhone) channels.push('sms')

  const channelResults = []
  for (const channel of channels) {
    const to = channel === 'email' ? row.patientEmail : row.patientPhone
    if (!to) continue
    channelResults.push(
      await sendAppointmentReminder(channel, {
        businessId: row.businessId,
        appointmentId: row.id,
        patientId: row.patientId,
        to,
        patientName: row.patientName,
        serviceName: row.serviceName,
        startsAt,
        locale: 'tr',
      })
    )
  }

  return { skipped: false as const, channelResults }
}

export async function processAppointmentReminders(now = new Date()) {
  const windows: ReminderWindow[] = ['24h', '2h']
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const window of windows) {
    const { from, to } = windowBounds(now, window)
    const due = await loadDueAppointments(from, to)
    for (const row of due) {
      try {
        const result = await dispatchReminder(row, window)
        if (result.skipped) skipped += 1
        else sent += 1
      } catch (error) {
        errors.push(
          `${row.id}:${window}:${error instanceof Error ? error.message : 'unknown error'}`
        )
      }
    }
  }

  return { sent, skipped, errors }
}
