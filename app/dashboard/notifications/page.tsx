import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsList } from '@/components/dashboard/notifications-list'
import type { Notification } from '@/lib/types'

export const metadata = {
  title: 'Bildirimler',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bildirimler</h1>
        <p className="text-muted-foreground">
          Tüm bildirimlerinizi görüntüleyin
        </p>
      </div>

      {/* Notifications List */}
      <NotificationsList 
        notifications={(notifications || []) as Notification[]}
        userId={user.id}
      />
    </div>
  )
}
