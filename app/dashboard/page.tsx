'use client'

import { Card, CardContent } from '@/components/ui/card'
import { QuickActionButtons } from '@/components/dashboard/quick-action-buttons'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'
import { Calendar, Clock, HeartPulse, Star, Wallet } from 'lucide-react'

const trMoney = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })

export default function DashboardPage() {
  const { db, stats } = useDashboardData()
  const patientById = new Map(db.patients.map((p) => [p.id, p.fullName]))
  const serviceById = new Map(db.services.map((s) => [s.id, s.name]))

  const cards = [
    { title: 'Bugünkü Randevular', value: stats.todayAppointments, hint: stats.todayAppointments === 0 ? 'Henüz randevu yok. İlk randevunuzu oluşturun.' : 'Takvime göre hesaplandı', icon: Calendar },
    { title: 'Bekleyen Onay', value: stats.pending, hint: stats.pending === 0 ? 'Onay bekleyen kayıt yok.' : 'Durumu pending olan randevular', icon: Clock },
    { title: 'Aktif Hasta', value: stats.activePatients, hint: stats.activePatients === 0 ? 'Henüz hasta yok. İlk hastayı ekleyin.' : 'Toplam hasta kaydı', icon: HeartPulse },
    { title: 'Ortalama Puan', value: stats.averageReview ? stats.averageReview.toFixed(1) : '0', hint: stats.averageReview ? 'Değerlendirmelerden hesaplandı' : 'Henüz değerlendirme yok', icon: Star },
    { title: 'Aylık Ciro', value: trMoney.format(stats.monthlyRevenue), hint: stats.monthlyRevenue === 0 ? 'Tamamlanan randevu olmadığından 0' : 'Tamamlanan randevu fiyat toplamı', icon: Wallet },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div><h1 className="text-[26px] font-bold tracking-tight text-[#0C1D36]">Genel Bakış</h1><p className="mt-1 text-sm text-muted-foreground">Tüm metrikler canlı durum verinizden hesaplanır.</p></div>
        <QuickActionButtons />
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">{cards.map((s) => <Card key={s.title} className="border-border/40"><CardContent className="p-4"><s.icon className="mb-2 h-5 w-5 text-[#12C8AD]" /><p className="text-xs text-muted-foreground">{s.title}</p><p className="text-2xl font-bold text-[#0C1D36]">{s.value}</p><p className="mt-1 text-[11px] text-muted-foreground">{s.hint}</p></CardContent></Card>)}</div>
      <Card><CardContent className="p-5"><h3 className="mb-3 text-sm font-semibold text-[#0C1D36]">Yaklaşan Randevular</h3>{db.appointments.length === 0 ? <p className="text-sm text-muted-foreground">Henüz randevu yok. İlk randevunuzu oluşturun.</p> : <div className="space-y-2">{db.appointments.slice(0, 6).map((a) => <div key={a.id} className="rounded-xl border p-3"><p className="text-sm font-medium">{patientById.get(a.patientId) || 'Hasta'} - {serviceById.get(a.serviceId) || 'Hizmet'}</p><p className="text-xs text-muted-foreground">{a.date} {a.startTime} • {a.status}</p></div>)}</div>}</CardContent></Card>
    </div>
  )
}
