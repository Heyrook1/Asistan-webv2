import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { z } from 'zod'
import { can } from '@/lib/rbac'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isGoogleCalendarSyncEnabled } from '@/lib/calendar/config'
import { disconnectGoogleCalendar, syncGoogleCalendarConnection } from '@/lib/calendar/sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bodySchema = z.object({
  connectionId: z.string().uuid(),
  action: z.enum(['disconnect', 'sync']).default('sync'),
})

export async function POST(request: NextRequest) {
  if (!isGoogleCalendarSyncEnabled()) {
    return apiError('Takvim senkronu kapalı', 503)
  }

  const session = await getSession()
  if (!session) {
    return apiError('Oturum gerekli', 401)
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return apiError('Geçersiz istek', 400)
  }

  const connection = await prisma.calendarConnection.findFirst({
    where: {
      id: parsed.data.connectionId,
      businessId: session.businessId,
      deletedAt: null,
    },
    select: { id: true, staffId: true },
  })
  if (!connection) {
    return apiError('Bağlantı bulunamadı', 404)
  }

  const isSelf = session.staffMemberId === connection.staffId
  const canManage = can(session, 'team.manage') || session.isOwner
  if (!isSelf && !canManage) {
    return apiError('Yetkisiz', 403)
  }

  if (parsed.data.action === 'disconnect') {
    await disconnectGoogleCalendar(connection.id, session.businessId)
    return NextResponse.json({ ok: true })
  }

  const result = await syncGoogleCalendarConnection(connection.id)
  if (!result.ok) {
    return apiError(result.error ?? 'Takvim senkronu başarısız', 502)
  }
  return NextResponse.json({ ok: true, importedBlocks: result.importedBlocks })
}
