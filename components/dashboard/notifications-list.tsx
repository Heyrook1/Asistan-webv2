'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Bell, CheckCheck, Calendar, Star, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/lib/types'
import { formatTimeAgo } from '@/lib/format'

interface NotificationsListProps {
  notifications: Notification[]
  userId: string
}

const notificationIcons: Record<NotificationType, typeof Bell> = {
  appointment_requested: Calendar,
  appointment_confirmed: Calendar,
  appointment_rejected: Calendar,
  appointment_cancelled: Calendar,
  appointment_completed: Calendar,
  appointment_reminder: Bell,
  review_received: Star,
  system: AlertCircle,
}

export function NotificationsList({ notifications, userId }: NotificationsListProps) {
  const router = useRouter()

  async function markAsRead(id: string) {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)

    router.refresh()
  }

  async function markAllAsRead() {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      toast.error('Bir hata oluştu')
      return
    }

    toast.success('Tüm bildirimler okundu olarak işaretlendi')
    router.refresh()
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Bildirim Yok</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Yeni bildirimleriniz burada görünecek.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Tümünü Okundu İşaretle
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.type] || Bell

          return (
            <Card
              key={notification.id}
              className={cn(
                'cursor-pointer transition-colors hover:bg-muted/50',
                !notification.is_read && 'border-primary/50 bg-primary/5'
              )}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'rounded-full p-2',
                      notification.is_read ? 'bg-muted' : 'bg-primary/10'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        notification.is_read ? 'text-muted-foreground' : 'text-primary'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={cn(
                          'font-medium',
                          !notification.is_read && 'text-primary'
                        )}
                      >
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
