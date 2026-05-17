import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardDataProvider } from '@/components/dashboard/dashboard-data-provider'
import type { User, Provider, Notification } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/auth/login')
  }

  const [
    { data: userData },
    { data: providerData },
    { data: notificationsData },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase.from('providers').select('*').eq('user_id', authUser.id).single(),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const user = userData as User | null
  const provider = providerData as Provider | null
  const notifications = (notificationsData || []) as Notification[]
  const unreadCount = notifications.filter((n) => !n.is_read).length || 5

  return (
    <DashboardDataProvider>
      <div className="min-h-screen bg-[#F4F8F9]">
        <DashboardSidebar unreadNotifications={unreadCount} />
        <div className="lg:pl-64">
          <DashboardHeader user={user} provider={provider} notifications={notifications} />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardDataProvider>
  )
}
