import { requirePageAnyPermission, can, TEAM_ACCESS_PERMISSIONS } from '@/lib/session'
import { getTeamList } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { getVendorPlanName, getVendorPlanUserLimit } from '@/lib/vendor-membership'
import { TeamBoard } from './team-board'

export const dynamic = 'force-dynamic'

export default async function TakimPage() {
  const session = await requirePageAnyPermission(...TEAM_ACCESS_PERMISSIONS)
  const [team, vendorAccount] = await Promise.all([
    getTeamList(session.businessId),
    prisma.vendorAccount.findUnique({
      where: { businessId: session.businessId },
      select: { plan: true, isDemo: true, accessEndAt: true },
    }),
  ])
  const activeMembers = team.filter((member) => member.isActive).length
  const userLimit = getVendorPlanUserLimit({
    plan: vendorAccount?.plan,
    isDemo: vendorAccount?.isDemo,
  })

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
      membership={
        vendorAccount
          ? {
              planName: getVendorPlanName(vendorAccount.plan),
              isDemo: vendorAccount.isDemo,
              userLimit,
              activeMembers,
              accessEndAt: vendorAccount.accessEndAt ? vendorAccount.accessEndAt.toISOString() : null,
            }
          : null
      }
    />
  )
}
