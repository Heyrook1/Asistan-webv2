'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'

export default function BildirimlerPage() {
  const { db, markNotificationRead } = useDashboardData()
  return <div className="space-y-4"><h1 className="text-2xl font-bold text-[#0C1D36]">Bildirimler</h1><Card><CardContent className="p-4">{db.notifications.length === 0 ? <p className="text-sm text-muted-foreground">Henüz bildirim yok.</p> : db.notifications.map((n) => <button key={n.id} onClick={() => markNotificationRead(n.id)} className="mb-2 block w-full rounded-lg border p-3 text-left"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.message}</p></button>)}</CardContent></Card></div>
}
