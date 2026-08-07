import 'server-only'

import { prisma } from '@/lib/prisma'

export type ClientAppointmentHistoryEvent = {
  id: string
  type: string
  title: string
  description: string | null
  actorName: string | null
  createdAt: string
}

/**
 * Hasta sahibi randevu için TimelineEvent geçmişi (metadata.appointmentId).
 */
export async function listClientAppointmentHistory(input: {
  clientUserId: string
  appointmentId: string
}): Promise<
  | { ok: true; events: ClientAppointmentHistoryEvent[] }
  | { ok: false; error: string }
> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: input.appointmentId,
      clientUserId: input.clientUserId,
      deletedAt: null,
    },
    select: {
      id: true,
      businessId: true,
      patientId: true,
      status: true,
      date: true,
      startTime: true,
      createdAt: true,
    },
  })

  if (!appointment) {
    return { ok: false, error: 'Randevu bulunamadi' }
  }

  const rows = await prisma.timelineEvent.findMany({
    where: {
      businessId: appointment.businessId,
      patientId: appointment.patientId,
      deletedAt: null,
      metadata: {
        path: ['appointmentId'],
        equals: appointment.id,
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      actorName: true,
      createdAt: true,
    },
  })

  const seeded: ClientAppointmentHistoryEvent[] = [
    {
      id: `seed-created-${appointment.id}`,
      type: 'APPOINTMENT_CREATED',
      title: 'Randevu oluşturuldu',
      description: `${appointment.date.toISOString().slice(0, 10)} ${appointment.startTime}`,
      actorName: null,
      createdAt: appointment.createdAt.toISOString(),
    },
  ]

  const events = rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    actorName: row.actorName,
    createdAt: row.createdAt.toISOString(),
  }))

  // Seed only when no timeline rows yet (legacy appointments).
  return {
    ok: true,
    events: events.length > 0 ? events : seeded,
  }
}
