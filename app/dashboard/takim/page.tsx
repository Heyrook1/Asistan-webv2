import { requirePermission, can } from '@/lib/session'
import { getTeamList } from '@/lib/queries'
import { TeamBoard } from './team-board'

export const dynamic = 'force-dynamic'

export default async function TakimPage() {
  const session = await requirePermission('team.manage')
  const team = await getTeamList(session.businessId)

  return (
    <TeamBoard
      currentUserId={session.userId}
      members={team.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        email: m.email,
        phone: m.phone,
        role: m.role,
        permissions: m.permissions,
        color: m.color,
        isActive: m.isActive,
        lastSeenAt: m.lastSeenAt ? m.lastSeenAt.toISOString() : null,
        userId: m.userId,
      }))}
      canManage={can(session, 'team.manage')}
    />
  )
}
