import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileTopbar } from '@/components/dashboard/mobile-topbar'
import { MobileShell } from '@/components/dashboard/mobile-shell'
import { getSession } from '@/lib/session'
import { getUnreadNotificationCount } from '@/lib/queries'
import { prisma } from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const [unreadCount, patients, services, staff] = await Promise.all([
    getUnreadNotificationCount(session.businessId, session.userId),
    prisma.patient.findMany({
      where: { businessId: session.businessId, isArchived: false },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, patientNumber: true },
      take: 500,
    }),
    prisma.service.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMin: true },
    }),
    prisma.teamMember.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
    }),
  ])

  const lookups = {
    patients: patients.map((p) => ({ id: p.id, label: `${p.fullName} (#${p.patientNumber})` })),
    services: services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin })),
    staff: staff.map((s) => ({ id: s.id, label: s.fullName })),
  }

  return (
    <div className="min-h-screen bg-[#F4F8F9]">
      <DashboardSidebar unreadNotifications={unreadCount} session={session} />
      <div className="lg:pl-64">
        <MobileTopbar session={session} unreadCount={unreadCount} />
        <DashboardHeader session={session} unreadCount={unreadCount} />
        <main className="px-4 pb-28 pt-3 lg:px-6 lg:pb-6 lg:pt-6">{children}</main>
      </div>
      <MobileShell session={session} unreadCount={unreadCount} lookups={lookups} />
    </div>
  )
}
