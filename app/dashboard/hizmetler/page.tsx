'use client'

import { Card, CardContent } from '@/components/ui/card'
import { QuickActionButtons } from '@/components/dashboard/quick-action-buttons'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'
import { EmptyState } from '@/components/dashboard/empty-state'

export default function HizmetlerPage() {
  const { db } = useDashboardData()
  return <div className="space-y-4"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-[#0C1D36]">Hizmetler</h1><QuickActionButtons /></div>
    <Card><CardContent className="p-4">{db.services.length === 0 ? <EmptyState title="Henüz hizmet yok" description="Hizmet ekleyerek randevu oluşturmayı aktif edin." ctaLabel="Hizmet Ekle" onCta={() => {}} /> : <div className="space-y-2">{db.services.map((s) => <div key={s.id} className="rounded-xl border p-3"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration} dk • {s.price} TRY • {s.category || 'Kategori yok'}</p></div>)}</div>}</CardContent></Card></div>
}
