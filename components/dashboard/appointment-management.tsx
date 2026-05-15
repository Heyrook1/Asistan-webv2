'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Appointment } from '@/lib/types'

type Status = 'Bekliyor' | 'Onaylandi' | 'Iptal' | 'Tamamlandi'

type LocalAppointment = {
  id: string
  customer: string
  service: string
  date: string
  time: string
  staff: string
  notes: string
  status: Status
}

interface AppointmentManagementProps {
  providerId: string
  initialAppointments: Appointment[]
  canEdit: boolean
  defaultCustomerId: string | null
  defaultServiceId: string | null
}

export function AppointmentManagement({ providerId, initialAppointments, canEdit, defaultCustomerId, defaultServiceId }: AppointmentManagementProps) {
  const [appointments, setAppointments] = useState<LocalAppointment[]>(
    initialAppointments.map((a) => ({
      id: a.id,
      customer: a.customer?.user?.full_name || 'Musteri',
      service: a.service?.name || 'Hizmet',
      date: a.appointment_date,
      time: a.start_time,
      staff: 'Atanmadi',
      notes: a.notes || '',
      status: a.status === 'confirmed' ? 'Onaylandi' : a.status === 'completed' ? 'Tamamlandi' : a.status.includes('cancelled') || a.status === 'rejected' ? 'Iptal' : 'Bekliyor',
    }))
  )
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customer: '', service: '', date: '', time: '', staff: '', notes: '' })

  const pendingCount = useMemo(() => appointments.filter((x) => x.status === 'Bekliyor').length, [appointments])

  async function createAppointment() {
    if (!canEdit) {
      toast.error('Bu islem icin yetkiniz yok')
      return
    }
    const row: LocalAppointment = {
      id: crypto.randomUUID(),
      customer: form.customer,
      service: form.service,
      date: form.date,
      time: form.time,
      staff: form.staff,
      notes: form.notes,
      status: 'Bekliyor',
    }
    setAppointments((prev) => [row, ...prev])
    if (!defaultCustomerId || !defaultServiceId) {
      toast.info('Randevu kalici kayit icin once musteri ve hizmet eklenmeli')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('appointments').insert({
      provider_id: providerId,
      customer_id: defaultCustomerId,
      service_id: defaultServiceId,
      appointment_date: form.date,
      start_time: form.time,
      end_time: form.time,
      status: 'requested',
      price: 0,
      currency: 'TRY',
      notes: `${form.customer} | ${form.service} | ${form.staff} | ${form.notes}`,
    })
    if (error) toast.error('Randevu veritabina kaydedilemedi')
    setOpen(false)
    setForm({ customer: '', service: '', date: '', time: '', staff: '', notes: '' })
  }

  async function updateStatus(id: string, status: Status) {
    if (!canEdit) {
      toast.error('Bu islem icin yetkiniz yok')
      return
    }
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    const statusMap = {
      Bekliyor: 'pending_provider_approval',
      Onaylandi: 'confirmed',
      Iptal: 'cancelled_by_provider',
      Tamamlandi: 'completed',
    } as const
    const supabase = createClient()
    const { error } = await supabase.from('appointments').update({ status: statusMap[status] }).eq('id', id)
    if (error) toast.error('Durum guncellenemedi')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Randevular</h1>
          <p className="text-sm text-muted-foreground">Randevu olustur, onayla, ertele veya iptal et.</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!canEdit} className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Randevu Olustur</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Bekleyen', String(pendingCount)],
          ['Onaylandi', String(appointments.filter((x) => x.status === 'Onaylandi').length)],
          ['Iptal', String(appointments.filter((x) => x.status === 'Iptal').length)],
          ['Tamamlandi', String(appointments.filter((x) => x.status === 'Tamamlandi').length)],
        ].map(([k, v]) => (
          <Card key={k}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="text-2xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Randevu Listesi</CardTitle></CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-medium">Henuz randevu yok</p>
              <p className="text-sm text-muted-foreground mt-1">Ilk randevunuzu olusturup takviminizi aktif edin.</p>
              <Button onClick={() => setOpen(true)} className="mt-4 bg-[#12C8AD] text-white hover:bg-[#10b49c]">Ilk Randevuyu Olustur</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((item) => (
                <div key={item.id} className="rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{item.customer} - {item.service}</p>
                      <p className="text-xs text-muted-foreground">{item.date} {item.time} • {item.staff}</p>
                    </div>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.notes || 'Not yok'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'Onaylandi')}>Onayla</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'Tamamlandi')}>Tamamla</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'Bekliyor')}>Ertele</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'Iptal')}>Iptal</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Randevu</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Musteri</Label><Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></div>
            <div><Label>Hizmet</Label><Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tarih</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Saat</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div><Label>Atanan Personel</Label><Input value={form.staff} onChange={(e) => setForm({ ...form, staff: e.target.value })} /></div>
            <div><Label>Not</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Vazgec</Button>
            <Button onClick={createAppointment} className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
