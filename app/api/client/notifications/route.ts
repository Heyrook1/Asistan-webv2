import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { listClientNotifications } from '@/lib/client-marketplace/notifications'

export const dynamic = 'force-dynamic'

const markReadSchema = z.object({
  all: z.boolean().optional(),
  ids: z.array(z.string().uuid()).optional(),
})

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notifications = await listClientNotifications(auth.clientUser.id)
  return NextResponse.json({ notifications })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = markReadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz bildirim istegi' }, { status: 400 })
  }

  if (parsed.data.all) {
    await prisma.clientNotification.updateMany({
      where: {
        clientUserId: auth.clientUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  } else if (parsed.data.ids && parsed.data.ids.length > 0) {
    await prisma.clientNotification.updateMany({
      where: {
        clientUserId: auth.clientUser.id,
        id: { in: parsed.data.ids },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  }

  return NextResponse.json({ ok: true })
}

