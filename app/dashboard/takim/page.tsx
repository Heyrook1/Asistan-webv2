'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'
import { EmptyState } from '@/components/dashboard/empty-state'
import { toast } from 'sonner'

const perms = ['Randevuları görüntüle', 'Randevu düzenle', 'Hasta yönet', 'Hizmet yönet', 'Analitik görüntüle', 'Takım yönet']

export default function TakimPage() {
  const { db, addTeamMember, updateTeamMember } = useDashboardData()
  const [form, setForm] = useState({ name: '', email: '', role: 'Personel' })

  return <div className="space-y-4"><h1 className="text-2xl font-bold text-[#0C1D36]">Takım</h1>
    <Card><CardContent className="grid gap-3 p-4 md:grid-cols-4"><Input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input type="email" placeholder="E-posta" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['İşletme Sahibi', 'Doktor', 'Sekreter', 'Personel'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><Button onClick={() => { if (!form.name || !form.email) return toast.error('Ad ve e-posta zorunlu'); addTeamMember({ ...form, status: 'active', permissions: [perms[0]] }); toast.success('Takım üyesi eklendi'); setForm({ name: '', email: '', role: 'Personel' }) }} className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Ekle</Button></CardContent></Card>
    <Card><CardContent className="p-4">{db.team.length === 0 ? <EmptyState title="Henüz ekip üyesi yok" description="İlk ekip üyesini ekleyin." ctaLabel="Üye Ekle" onCta={() => {}} /> : <div className="space-y-3">{db.team.map((m) => <div key={m.id} className="rounded-xl border p-3"><div className="flex items-center justify-between"><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email} • {m.role}</p></div><Button variant="outline" size="sm" onClick={() => updateTeamMember(m.id, { status: m.status === 'active' ? 'inactive' : 'active' })}>{m.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}</Button></div><div className="mt-2 flex flex-wrap gap-1">{perms.map((p) => <button key={p} onClick={() => updateTeamMember(m.id, { permissions: m.permissions.includes(p) ? m.permissions.filter((x) => x !== p) : [...m.permissions, p] })} className={`rounded-full border px-2 py-1 text-xs ${m.permissions.includes(p) ? 'bg-[#12C8AD] text-white border-[#12C8AD]' : ''}`}>{p}</button>)}</div></div>)}</div>}</CardContent></Card></div>
}
