import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileTopbar } from '@/components/dashboard/mobile-topbar'
import { MobileShell } from '@/components/dashboard/mobile-shell'
import { GlobalCommandPalette } from '@/components/dashboard/global-command-palette'
import { requireSession, isSuperAdmin, isSystemAdmin } from '@/lib/session'
import {
  getNotificationsList,
  getPendingAppointmentCount,
  getUnreadMessageCount,
  getUnreadNotificationCount,
  serializeNotification,
} from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import {
  getMembershipUrgency,
  getVendorPlanName,
  normalizeVendorPlanCode,
} from '@/lib/vendor-membership'
import { canViewAppointmentSchedule } from '@/lib/rbac'
import { MembershipExpiryBanner } from '@/components/dashboard/membership-expiry-banner'
import { AnnouncementBanner } from '@/components/dashboard/announcement-banner'
import { SupportModeBanner } from '@/components/dashboard/support-mode-banner'
import { getActiveAnnouncements } from '@/lib/announcements'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { Metadata } from 'next'

/** Klinik paneli bilinçli olarak Türkçe-only (KKTC operasyon dili). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const showPlatformAdmin = isSystemAdmin(session)
  const showSuperAdmin = isSuperAdmin(session)

  const [unreadCount, unreadMessages, recentNotifications, vendorAccount, pendingAppointments] = await Promise.all([
    getUnreadNotificationCount(session.businessId, session.userId),
    getUnreadMessageCount(session.businessId, session.userId),
    getNotificationsList(session.businessId, session.userId, 10),
    prisma.vendorAccount.findUnique({
      where: { businessId: session.businessId },
      select: {
        plan: true,
        status: true,
        isDemo: true,
        accessEndAt: true,
      },
    }),
    canViewAppointmentSchedule(session)
      ? getPendingAppointmentCount(session.businessId, session)
      : Promise.resolve(0),
  ])

  const notificationPreview = recentNotifications.map(serializeNotification)

  const membership = vendorAccount
    ? {
        planName: getVendorPlanName(vendorAccount.plan),
        planCode: normalizeVendorPlanCode(vendorAccount.plan),
        status: vendorAccount.status,
        isDemo: vendorAccount.isDemo,
        accessEndAt: vendorAccount.accessEndAt ? vendorAccount.accessEndAt.toISOString() : null,
      }
    : null

  const showExpiryBanner =
    session.isOwner &&
    membership &&
    getMembershipUrgency({
      accessEndAt: membership.accessEndAt,
      status: membership.status,
    }) !== 'ok'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(0,113,227,0.10),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(0,113,227,0.05),transparent_36%),linear-gradient(180deg,#F7F7F5_0%,#F3F6FA_100%)]">
      <DashboardSidebar
        unreadNotifications={unreadCount}
        unreadMessages={unreadMessages}
        pendingAppointments={pendingAppointments}
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
        <main id="main-content" tabIndex={-1} lang="tr" className="mx-auto max-w-[1720px] px-4 pb-28 pt-3 lg:px-6 lg:pb-8 lg:pt-6">
          {session.supportMode ? (
            <SupportModeBanner businessName={session.supportMode.businessName} />
          ) : null}
          {isFeatureEnabled('announcements') ? (
            <div className="mb-3">
              <AnnouncementBanner items={getActiveAnnouncements()} />
            </div>
          ) : null}
          {showExpiryBanner ? (
            <MembershipExpiryBanner membership={membership} isOwner={session.isOwner} />
          ) : null}
          {children}
        </main>
      </div>
      <MobileShell
        session={session}
        unreadCount={unreadCount}
        unreadMessages={unreadMessages}
        pendingAppointments={pendingAppointments}
        showSuperAdmin={showSuperAdmin}
      />
    </div>
  )
}
