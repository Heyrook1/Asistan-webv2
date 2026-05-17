'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'

export default function TakvimPage() {
  const { db } = useDashboardData()
  const [view, setView] = useState<'gun' | 'hafta' | 'ay'>('hafta')
  const [staffFilter, setStaffFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const filtered = useMemo(() => db.appointments.filter((a) => (staffFilter === 'all' || a.staffId === staffFilter) && (serviceFilter === 'all' || a.serviceId === serviceFilter)), [db.appointments, staffFilter, serviceFilter])

  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold text-[#0C1D36]">Takvim</h1><div className="flex gap-2"><button className={`rounded-lg border px-3 py-1 text-sm ${view === 'gun' ? 'bg-[#12C8AD] text-white' : ''}`} onClick={() => setView('gun')}>Günlük</button><button className={`rounded-lg border px-3 py-1 text-sm ${view === 'hafta' ? 'bg-[#12C8AD] text-white' : ''}`} onClick={() => setView('hafta')}>Haftalık</button><button className={`rounded-lg border px-3 py-1 text-sm ${view === 'ay' ? 'bg-[#12C8AD] text-white' : ''}`} onClick={() => setView('ay')}>Aylık</button></div></div>
  <div className="grid gap-3 md:grid-cols-2"><Select value={staffFilter} onValueChange={setStaffFilter}><SelectTrigger><SelectValue placeholder="Personel filtrele" /></SelectTrigger><SelectContent><SelectItem value="all">Tüm personel</SelectItem>{db.team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><Select value={serviceFilter} onValueChange={setServiceFilter}><SelectTrigger><SelectValue placeholder="Hizmet filtrele" /></SelectTrigger><SelectContent><SelectItem value="all">Tüm hizmetler</SelectItem>{db.services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
  <Card><CardContent className="p-4">{filtered.length === 0 ? <p className="text-sm text-muted-foreground">Henüz randevu yok. Boş bir saat seçerek randevu oluşturun.</p> : <div className="space-y-2">{filtered.map((a) => <div key={a.id} className="rounded-xl border-l-4 bg-white p-3" style={{ borderLeftColor: a.status === 'pending' ? '#f59e0b' : a.status === 'approved' ? '#06b6d4' : a.status === 'completed' ? '#16a34a' : '#ef4444' }}><p className="text-sm font-medium">{a.date} {a.startTime}-{a.endTime}</p><p className="text-xs text-muted-foreground">Durum: {a.status}</p></div>)}</div>}</CardContent></Card></div>
}
