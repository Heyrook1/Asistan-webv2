import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { can } from '@/lib/rbac'
import { requireSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import {
  isGoogleCalendarSyncEnabled,
  resolveAppOrigin,
} from '@/lib/calendar/config'
import { signOAuthState } from '@/lib/calendar/crypto'
import { buildGoogleAuthUrl } from '@/lib/calendar/google-oauth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!isGoogleCalendarSyncEnabled()) {
    return apiError('Takvim senkronu kapalı veya yapılandırılmamış', 503)
  }

  const session = await requireSession()
  const staffId = request.nextUrl.searchParams.get('staffId')?.trim()
  if (!staffId) {
    return apiError('staffId gerekli', 400)
  }

  const isSelf = session.staffMemberId === staffId
  const canManage = can(session, 'team.manage') || session.isOwner
  if (!isSelf && !canManage) {
    return apiError('Yetkisiz', 403)
  }

  const staff = await prisma.teamMember.findFirst({
    where: {
      id: staffId,
      businessId: session.businessId,
      isActive: true,
      isBookable: true,
    },
    select: { id: true },
  })
  if (!staff) {
    return apiError('Randevu alınabilir personel bulunamadı', 404)
  }

  const origin = resolveAppOrigin(request.url, request.headers)
  const state = signOAuthState({
    staffId,
    businessId: session.businessId,
    userId: session.userId,
    exp: Date.now() + 15 * 60 * 1000,
  })

  const url = buildGoogleAuthUrl({ origin, state })
  return NextResponse.redirect(url)
}
