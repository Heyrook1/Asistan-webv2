import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { getSession } from '@/lib/session'
import { getUnreadNotificationCount } from '@/lib/queries'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const unreadCount = await getUnreadNotificationCount(session.businessId, session.userId)

  return (
    <div className="min-h-screen bg-[#F4F8F9]">
      <DashboardSidebar unreadNotifications={unreadCount} session={session} />
      <div className="lg:pl-64">
        <DashboardHeader session={session} unreadCount={unreadCount} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
