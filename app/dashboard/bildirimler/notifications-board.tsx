'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications'
import { EmptyState } from '@/components/dashboard/empty-state'
import { formatTimeAgo } from '@/lib/format'

type N = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  APPOINTMENT: 'bg-sky-100 text-sky-800',
  PATIENT: 'bg-emerald-100 text-emerald-800',
  TEAM: 'bg-violet-100 text-violet-800',
  SYSTEM: 'bg-slate-100 text-slate-700',
}

export function NotificationsBoard({ notifications }: { notifications: N[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const unread = notifications.filter((n) => !n.isRead).length

  function read(id: string) {
    startTransition(async () => {
      const result = await markNotificationRead({ id })
      if (!result.ok) toast.error(result.error)
      router.refresh()
    })
  }

  function readAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (!result.ok) toast.error(result.error)
      else toast.success('Tüm bildirimler okundu olarak işaretlendi')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Bildirimler</h1>
          <p className="text-sm text-muted-foreground">{notifications.length} bildirim • {unread} okunmamış</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={readAll} disabled={pending}>
            <CheckCheck className="mr-2 h-4 w-4" /> Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Henüz bildirim yok"
          description="Randevu, hasta ve sistem güncellemeleri buraya düşecek."
          icon={<Bell className="h-6 w-6" />}
        />
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.isRead && read(n.id)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[#F7F9FB] ${
                  n.isRead ? 'opacity-70' : ''
                }`}
              >
                {!n.isRead && <span className="mt-2 h-2 w-2 rounded-full bg-[#12C8AD]" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#0C1D36] truncate">{n.title}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${TYPE_COLORS[n.type] ?? 'bg-slate-100 text-slate-700'}`}>
                      {n.type.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
