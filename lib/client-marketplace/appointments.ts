import 'server-only'

import { prisma } from '@/lib/prisma'

export async function listClientAppointments(clientUserId: string) {
  const rows = await prisma.appointment.findMany({
    where: { clientUserId },
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    include: {
      business: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
      staff: { select: { id: true, fullName: true, specialty: true } },
      location: { select: { id: true, name: true, address: true } },
    },
    take: 200,
  })

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    source: row.source,
    date: row.date.toISOString().slice(0, 10),
    startTime: row.startTime,
    endTime: row.endTime,
    note: row.notes,
    clinic: row.business,
    service: row.service,
    doctor: row.staff,
    location: row.location,
    price: row.price != null ? Number(row.price) : null,
    createdAt: row.createdAt.toISOString(),
  }))
}

