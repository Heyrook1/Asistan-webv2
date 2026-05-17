'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'

export default function DegerlendirmelerPage() {
  const { db } = useDashboardData()
  return <div className="space-y-4"><h1 className="text-2xl font-bold text-[#0C1D36]">Değerlendirmeler</h1><Card><CardContent className="p-4">{db.reviews.length === 0 ? <p className="text-sm text-muted-foreground">Henüz değerlendirme yok.</p> : db.reviews.map((r) => <div key={r.id} className="mb-2 rounded-lg border p-2 text-sm">{r.rating}/5 - {r.message}</div>)}</CardContent></Card></div>
}
