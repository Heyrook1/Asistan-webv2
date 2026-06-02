import 'server-only'

import { Prisma, type ClientNotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function createClientNotification(input: {
  clientUserId: string
  businessId?: string | null
  appointmentId?: string | null
  type: ClientNotificationType
  title: string
  message: string
  link?: string | null
  metadata?: Record<string, unknown> | null
}) {
  await prisma.clientNotification.create({
    data: {
      clientUserId: input.clientUserId,
      businessId: input.businessId ?? null,
      appointmentId: input.appointmentId ?? null,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? '/client/appointments',
      metadata:
        input.metadata == null
          ? Prisma.JsonNull
          : (input.metadata as Prisma.InputJsonValue),
    },
  })
}

export async function listClientNotifications(clientUserId: string) {
  const rows = await prisma.clientNotification.findMany({
    where: { clientUserId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  }))
}
