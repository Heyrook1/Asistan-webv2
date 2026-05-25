'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createAppointment } from '@/lib/actions/appointments'

export type AppointmentOption = { id: string; label: string }

export function AppointmentFormDrawer({
  open,
  onOpenChange,
  locations,
  patients,
  services,
  staff,
  defaultPatientId,
  defaultDate,
  defaultStartTime,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  locations: AppointmentOption[]
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
  defaultPatientId?: string
  defaultDate?: string
  defaultStartTime?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    locationId: '',
    patientId: defaultPatientId ?? '',
    serviceId: '',
    staffId: '',
    date: defaultDate ?? '',
    startTime: defaultStartTime ?? '',
    notes: '',
  })

  useEffect(() => {
    if (!open) return
    setForm((current) => ({
      ...current,
      locationId:
        current.locationId && locations.some((location) => location.id === current.locationId)
          ? current.locationId
          : locations.length === 1
            ? locations[0].id
            : '',
      patientId: defaultPatientId ?? current.patientId,
      date: defaultDate ?? current.date,
      startTime: defaultStartTime ?? current.startTime,
    }))
  }, [open, defaultPatientId, defaultDate, defaultStartTime, locations])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}
    if (locations.length > 1 && !form.locationId) nextErrors.locationId = 'Randevu icin bir sube secin.'
    if (!form.patientId) nextErrors.patientId = 'Randevu olusturmak icin hasta secin.'
    if (!form.serviceId) nextErrors.serviceId = 'Randevu suresini belirlemek icin hizmet secin.'
    if (!form.date) nextErrors.date = 'Randevu tarihini girin.'
    if (!form.startTime) nextErrors.startTime = 'Baslangic saatini girin.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Eksik alanlari kontrol edin')
      return
    }

    startTransition(async () => {
      const result = await createAppointment({
        locationId: form.locationId || undefined,
        patientId: form.patientId,
        serviceId: form.serviceId,
        staffId: form.staffId && form.staffId !== 'none' ? form.staffId : undefined,
        date: form.date,
        startTime: form.startTime,
        notes: form.notes || undefined,
        status: 'SCHEDULED',
      })

      if (!result.ok) {
        const fieldErrors = result.fieldErrors ?? {}
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((current) => ({ ...current, ...fieldErrors }))
        }
        toast.error(result.error)
        return
      }

      toast.success('Randevu olusturuldu')
      onOpenChange(false)
      setErrors({})
      setForm({
        locationId: locations.length === 1 ? locations[0].id : '',
        patientId: '',
        serviceId: '',
        staffId: '',
        date: '',
        startTime: '',
        notes: '',
      })
      router.refresh()
    })
  }

  const noPatients = patients.length === 0
  const noServices = services.length === 0
  const multipleLocations = locations.length > 1

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-full overflow-y-auto p-0 sm:max-w-md">
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="shrink-0 border-b bg-gradient-to-r from-brand-navy to-sidebar-card px-5 py-4 pt-safe text-white">
            <SheetTitle className="flex items-center gap-2 text-white">
              <CalendarPlus className="h-5 w-5 text-brand-teal" />
              Yeni Randevu
            </SheetTitle>
            <SheetDescription className="text-white/60">
              Hasta, sube ve saat bilgilerini girin.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-dashboard-surface px-4 py-4 md:px-6 md:py-5">
            {noPatients && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Henuz hasta yok. Once Hasta Ekle ile bir hasta olusturmalisiniz.
              </div>
            )}
            {noServices && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Henuz hizmet yok. Once Hizmetler sayfasindan bir hizmet ekleyin.
              </div>
            )}
            {locations.length === 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Henuz sube kaydi yok. Bu randevu ile varsayilan sube olusturulacak.
              </div>
            )}
            {locations.length > 0 && (
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">
                  Sube{multipleLocations ? ' *' : ''}
                </Label>
                <Select value={form.locationId || undefined} onValueChange={(value) => update('locationId', value)}>
                  <SelectTrigger aria-invalid={Boolean(errors.locationId)}>
                    <SelectValue placeholder="Sube sec" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationId && <p className="mt-1 text-xs text-destructive">{errors.locationId}</p>}
              </div>
            )}

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Hasta *</Label>
              <Select value={form.patientId || undefined} onValueChange={(value) => update('patientId', value)}>
                <SelectTrigger aria-invalid={Boolean(errors.patientId)}>
                  <SelectValue placeholder="Hasta sec" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && <p className="mt-1 text-xs text-destructive">{errors.patientId}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Hizmet *</Label>
              <Select value={form.serviceId || undefined} onValueChange={(value) => update('serviceId', value)}>
                <SelectTrigger aria-invalid={Boolean(errors.serviceId)}>
                  <SelectValue placeholder="Hizmet sec" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.label} - {service.durationMin} dk
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceId && <p className="mt-1 text-xs text-destructive">{errors.serviceId}</p>}
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Personel</Label>
              <Select value={form.staffId || 'none'} onValueChange={(value) => update('staffId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Atanmadi</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">Tarih *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) => update('date', event.target.value)}
                  required
                  aria-invalid={Boolean(errors.date)}
                />
                {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block text-xs text-muted-foreground">Saat *</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => update('startTime', event.target.value)}
                  required
                  aria-invalid={Boolean(errors.startTime)}
                />
                {errors.startTime && <p className="mt-1 text-xs text-destructive">{errors.startTime}</p>}
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Not</Label>
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={3} />
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-4 py-3 pb-safe md:px-6 md:py-4">
            <div className="flex gap-2 md:justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="h-11 flex-1 md:flex-none"
              >
                Iptal
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={pending || noPatients || noServices}
                className="h-11 flex-[2] bg-brand-teal text-white hover:bg-brand-teal-hover md:flex-none"
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pending ? 'Kaydediliyor...' : 'Randevu Olustur'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
