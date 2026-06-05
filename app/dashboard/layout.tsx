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
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(0,113,227,0.08),transparent_38%),radial-gradient(circle_at_100%_0%,rgba(45,212,191,0.08),transparent_35%),linear-gradient(180deg,#F7FAFD_0%,#F3F6FA_100%)]">
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
        <main className="mx-auto max-w-[1720px] px-4 pb-28 pt-3 lg:px-6 lg:pb-8 lg:pt-6">{children}</main>
      </div>
      <MobileShell
        session={session}
        unreadCount={unreadCount}
        showSuperAdmin={showSuperAdmin}
      />
    </div>
  )
}
