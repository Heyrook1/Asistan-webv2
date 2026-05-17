'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'

export default function AnalitikPage() {
  const { stats } = useDashboardData()
  return <div className="space-y-4"><h1 className="text-2xl font-bold text-[#0C1D36]">Analitik</h1><div className="grid gap-3 md:grid-cols-3"><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Toplam Hasta</p><p className="text-2xl font-bold">{stats.activePatients}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Bugünkü Randevu</p><p className="text-2xl font-bold">{stats.todayAppointments}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Aylık Ciro</p><p className="text-2xl font-bold">{stats.monthlyRevenue} TRY</p></CardContent></Card></div></div>
}
