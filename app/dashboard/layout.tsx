import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileTopbar } from '@/components/dashboard/mobile-topbar'
import { MobileShell } from '@/components/dashboard/mobile-shell'
import { GlobalCommandPalette } from '@/components/dashboard/global-command-palette'
import { requireSession, isSuperAdmin, isSystemAdmin } from '@/lib/session'
import {
  getNotificationsList,
  getUnreadMessageCount,
  getUnreadNotificationCount,
  serializeNotification,
} from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { getVendorPlanName } from '@/lib/vendor-membership'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const showPlatformAdmin = isSystemAdmin(session)
  const showSuperAdmin = isSuperAdmin(session)

  const [unreadCount, unreadMessages, recentNotifications, vendorAccount] = await Promise.all([
    getUnreadNotificationCount(session.businessId, session.userId),
    getUnreadMessageCount(session.businessId, session.userId),
    getNotificationsList(session.businessId, session.userId, 10),
    prisma.vendorAccount.findUnique({
      where: { businessId: session.businessId },
      select: {
        plan: true,
        isDemo: true,
        accessEndAt: true,
      },
    }),
  ])

  const notificationPreview = recentNotifications.map(serializeNotification)

  const membership = vendorAccount
    ? {
        planName: getVendorPlanName(vendorAccount.plan),
        isDemo: vendorAccount.isDemo,
        accessEndAt: vendorAccount.accessEndAt ? vendorAccount.accessEndAt.toISOString() : null,
      }
    : null

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <DashboardSidebar
        unreadNotifications={unreadCount}
        session={session}
        showPlatformAdmin={showPlatformAdmin}
        showSuperAdmin={showSuperAdmin}
      />
      <div className="lg:pl-64">
        <MobileTopbar
          session={session}
          unreadCount={unreadCount}
          unreadMessages={unreadMessages}
          notifications={notificationPreview}
          membership={membership}
        />
        <DashboardHeader
          session={session}
          unreadCount={unreadCount}
          unreadMessages={unreadMessages}
          notifications={notificationPreview}
          membership={membership}
        />
        <GlobalCommandPalette
          session={session}
          showPlatformAdmin={showPlatformAdmin}
          showSuperAdmin={showSuperAdmin}
        />
        <main className="px-4 pb-28 pt-3 lg:px-6 lg:pb-6 lg:pt-6">{children}</main>
      </div>
      <MobileShell
        session={session}
        unreadCount={unreadCount}
        showSuperAdmin={showSuperAdmin}
      />
    </div>
  )
}
