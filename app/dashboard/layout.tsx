import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
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

  // Fetch user profile
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Fetch provider profile
  const { data: providerData } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', authUser.id)
    .single()

  // Fetch recent notifications
  const { data: notificationsData } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const user = userData as User | null
  const provider = providerData as Provider | null
  const notifications = (notificationsData || []) as Notification[]

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader 
          user={user} 
          provider={provider} 
          notifications={notifications} 
        />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
