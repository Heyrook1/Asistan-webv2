'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createAppointment } from '@/lib/actions/appointments'
import { LOCATION_SETUP_HREF } from '@/lib/locations/constants'
import { AccessibleField } from '@/components/ui/accessible-field'
import {
  nextHalfHourTime,
  readUiPreference,
  todayIsoDate,
  UI_PREF_KEYS,
  writeUiPreference,
  type AppointmentDefaultsPref,
} from '@/lib/ui-preferences'

export type AppointmentOption = { id: string; label: string }

function pickValidId(id: string | undefined, options: AppointmentOption[]) {
  if (!id) return ''
  return options.some((option) => option.id === id) ? id : ''
}

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
  defaultStaffId,
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
  defaultStaffId?: string
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
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      hydratedRef.current = false
      return
    }
    if (hydratedRef.current) return
    hydratedRef.current = true

    const saved = readUiPreference<AppointmentDefaultsPref>(UI_PREF_KEYS.appointmentDefaults) ?? {}
    const locationId =
      pickValidId(saved.locationId, locations) ||
      (locations.length === 1 ? locations[0].id : '')
    const serviceId = pickValidId(saved.serviceId, services)
    const staffId =
      pickValidId(saved.staffId, staff) ||
      pickValidId(defaultStaffId, staff)
    const date = defaultDate || todayIsoDate()
    const startTime = defaultStartTime || saved.startTime || nextHalfHourTime()

    setForm({
      locationId,
      patientId: defaultPatientId ?? '',
      serviceId,
      staffId,
      date,
      startTime,
      notes: '',
    })
    setErrors({})
  }, [open, defaultPatientId, defaultDate, defaultStartTime, defaultStaffId, locations, services, staff])

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
    if (locations.length === 0) {
      nextErrors.locationId = 'Önce Ayarlar’dan bir şube ekleyin.'
    } else if (locations.length > 1 && !form.locationId) {
      nextErrors.locationId = 'Randevu için bir şube seçin.'
    }
    if (!form.patientId) nextErrors.patientId = 'Randevu oluşturmak için hasta seçin.'
    if (!form.serviceId) nextErrors.serviceId = 'Randevu süresini belirlemek için hizmet seçin.'
    if (!form.date) nextErrors.date = 'Randevu tarihini girin.'
    if (!form.startTime) nextErrors.startTime = 'Başlangıç saatini girin.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Eksik alanları kontrol edin')
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

      writeUiPreference<AppointmentDefaultsPref>(UI_PREF_KEYS.appointmentDefaults, {
        locationId: form.locationId || undefined,
        serviceId: form.serviceId || undefined,
        staffId: form.staffId && form.staffId !== 'none' ? form.staffId : undefined,
        startTime: form.startTime || undefined,
      })

      toast.success('Randevu oluşturuldu')
      onOpenChange(false)
      setErrors({})
      hydratedRef.current = false
      router.refresh()
    })
  }

  const noPatients = patients.length === 0
  const noServices = services.length === 0
  const noLocations = locations.length === 0
  const multipleLocations = locations.length > 1

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-full overflow-y-auto p-0 sm:max-w-md">
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="shrink-0 border-b bg-gradient-to-r from-brand-navy to-sidebar-card px-5 py-4 pt-safe text-white">
            <SheetTitle className="flex items-center gap-2 text-white">
              <CalendarPlus className="h-5 w-5 text-brand-teal" aria-hidden="true" />
              Yeni Randevu
            </SheetTitle>
            <SheetDescription className="text-white/60">
              Hasta, şube ve saat bilgilerini girin.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-dashboard-surface px-4 py-4 md:px-6 md:py-5">
            {noPatients && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="status">
                Henüz hasta yok. Önce Hasta Ekle ile bir hasta oluşturmalısınız.
              </div>
            )}
            {noServices && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="status">
                Henüz hizmet yok. Önce Hizmetler sayfasından bir hizmet ekleyin.
              </div>
            )}
            {noLocations && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
                <p className="font-semibold">Şube kaydı gerekli</p>
                <p className="mt-1 text-[13px] leading-5">
                  Randevu, şube oluşturmaz. Önce Ayarlar’da şube adı ve adresini kaydedin; ardından
                  buradan randevu alın.
                </p>
                <Link
                  href={LOCATION_SETUP_HREF}
                  className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-brand-teal underline-offset-2 hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Şube kurulumuna git →
                </Link>
              </div>
            )}
            {locations.length > 0 && (
              <AccessibleField
                label={multipleLocations ? 'Şube *' : 'Şube'}
                error={errors.locationId}
                required={multipleLocations}
                labelClassName="mb-1.5 block text-xs text-muted-foreground"
                errorClassName="text-xs text-destructive"
              >
                <Select value={form.locationId || undefined} onValueChange={(value) => update('locationId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şube seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AccessibleField>
            )}

            <AccessibleField
              label="Hasta *"
              error={errors.patientId}
              required
              labelClassName="mb-1.5 block text-xs text-muted-foreground"
              errorClassName="text-xs text-destructive"
            >
              <Select value={form.patientId || undefined} onValueChange={(value) => update('patientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Hasta seç" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccessibleField>

            <AccessibleField
              label="Hizmet *"
              error={errors.serviceId}
              required
              labelClassName="mb-1.5 block text-xs text-muted-foreground"
              errorClassName="text-xs text-destructive"
            >
              <Select value={form.serviceId || undefined} onValueChange={(value) => update('serviceId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Hizmet seç" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.label} - {service.durationMin} dk
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccessibleField>

            <AccessibleField label="Personel" labelClassName="mb-1.5 block text-xs text-muted-foreground">
              <Select value={form.staffId || 'none'} onValueChange={(value) => update('staffId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Atanmadı</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccessibleField>

            <div className="grid grid-cols-2 gap-3">
              <AccessibleField
                label="Tarih *"
                error={errors.date}
                required
                labelClassName="mb-1.5 block text-xs text-muted-foreground"
                errorClassName="text-xs text-destructive"
              >
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) => update('date', event.target.value)}
                  required
                />
              </AccessibleField>
              <AccessibleField
                label="Saat *"
                error={errors.startTime}
                required
                labelClassName="mb-1.5 block text-xs text-muted-foreground"
                errorClassName="text-xs text-destructive"
              >
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => update('startTime', event.target.value)}
                  required
                />
              </AccessibleField>
            </div>

            <AccessibleField label="Not" labelClassName="mb-1.5 block text-xs text-muted-foreground">
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={3} />
            </AccessibleField>
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
                İptal
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={pending || noPatients || noServices || noLocations}
                className="h-11 flex-[2] bg-brand-teal text-white hover:bg-brand-teal-hover md:flex-none"
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {pending ? 'Kaydediliyor...' : 'Randevu Oluştur'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
