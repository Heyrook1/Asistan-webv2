'use client'

import { Card, CardContent } from '@/components/ui/card'
import { QuickActionButtons } from '@/components/dashboard/quick-action-buttons'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'
import { EmptyState } from '@/components/dashboard/empty-state'

export default function RandevularPage() {
  const { db } = useDashboardData()
  const patientById = new Map(db.patients.map((p) => [p.id, p.fullName]))
  const serviceById = new Map(db.services.map((s) => [s.id, s.name]))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#0C1D36]">Randevular</h1><QuickActionButtons /></div>
      <Card><CardContent className="p-4">{db.appointments.length === 0 ? <EmptyState title="Henüz randevu yok" description="İlk randevunuzu oluşturarak takviminizi başlatın." ctaLabel="Randevu Oluştur" onCta={() => {}} /> : <div className="space-y-2">{db.appointments.map((a) => <div key={a.id} className="rounded-xl border bg-white p-3"><p className="font-medium">{patientById.get(a.patientId) || 'Hasta'} - {serviceById.get(a.serviceId) || 'Hizmet'}</p><p className="text-xs text-muted-foreground">{a.date} {a.startTime} • {a.status}</p></div>)}</div>}</CardContent></Card>
    </div>
  )
}
