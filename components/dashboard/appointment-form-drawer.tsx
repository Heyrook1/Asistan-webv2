'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { createAppointment } from '@/lib/actions/appointments'

export type AppointmentOption = { id: string; label: string }

export function AppointmentFormDrawer({
  open,
  onOpenChange,
  patients,
  services,
  staff,
  defaultPatientId,
  defaultDate,
  defaultStartTime,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
  defaultPatientId?: string
  defaultDate?: string
  defaultStartTime?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    patientId: defaultPatientId ?? '',
    serviceId: '',
    staffId: '',
    date: defaultDate ?? '',
    startTime: defaultStartTime ?? '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        patientId: defaultPatientId ?? f.patientId,
        date: defaultDate ?? f.date,
        startTime: defaultStartTime ?? f.startTime,
      }))
    }
  }, [open, defaultPatientId, defaultDate, defaultStartTime])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patientId) { toast.error('Hasta seçiniz'); return }
    if (!form.serviceId) { toast.error('Hizmet seçiniz'); return }
    if (!form.date) { toast.error('Tarih giriniz'); return }
    if (!form.startTime) { toast.error('Başlangıç saatini giriniz'); return }

    startTransition(async () => {
      const result = await createAppointment({
        patientId: form.patientId,
        serviceId: form.serviceId,
        staffId: form.staffId && form.staffId !== 'none' ? form.staffId : undefined,
        date: form.date,
        startTime: form.startTime,
        notes: form.notes || undefined,
        status: 'SCHEDULED',
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Randevu oluşturuldu')
      onOpenChange(false)
      setForm({ patientId: '', serviceId: '', staffId: '', date: '', startTime: '', notes: '' })
      router.refresh()
    })
  }

  const noPatients = patients.length === 0
  const noServices = services.length === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="border-b px-6 py-5 bg-gradient-to-r from-[#06142A] to-[#0E2D52] text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-[#12C8AD]" /> Yeni Randevu
            </SheetTitle>
            <SheetDescription className="text-white/60">
              Hasta, hizmet ve saat bilgilerini girin.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#F7F9FB]">
            {noPatients && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Henüz hasta yok. Önce <strong>Hasta Ekle</strong> ile bir hasta oluşturmalısınız.
              </div>
            )}
            {noServices && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Henüz hizmet yok. Önce <strong>Hizmetler</strong> sayfasından bir hizmet ekleyin.
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Hasta *</Label>
              <Select value={form.patientId || undefined} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                <SelectTrigger><SelectValue placeholder="Hasta seç" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Hizmet *</Label>
              <Select value={form.serviceId || undefined} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
                <SelectTrigger><SelectValue placeholder="Hizmet seç" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label} • {s.durationMin} dk</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Personel</Label>
              <Select value={form.staffId || 'none'} onValueChange={(v) => setForm({ ...form, staffId: v })}>
                <SelectTrigger><SelectValue placeholder="Personel (opsiyonel)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Atanmadı</SelectItem>
                  {staff.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Tarih *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Saat *</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Not</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t bg-white px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button type="submit" disabled={pending || noPatients || noServices} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
              {pending ? 'Kaydediliyor...' : 'Randevu Oluştur'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
