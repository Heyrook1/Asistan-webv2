'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreHorizontal, CalendarPlus, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { setAppointmentStatus, rescheduleAppointment, deleteAppointment } from '@/lib/actions/appointments'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import { EmptyState } from '@/components/dashboard/empty-state'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, formatDate, formatTime } from '@/lib/format'

type PlainAppointment = {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  serviceColor: string
  staffId: string | null
  staffName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string | null
}

type Option = { id: string; label: string }

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'SCHEDULED', label: 'Planlandı' },
  { value: 'CONFIRMED', label: 'Onaylandı' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'CANCELLED', label: 'İptal' },
  { value: 'NO_SHOW', label: 'Gelmedi' },
]

export function AppointmentsBoard({
  initialStatus,
  appointments,
  patients,
  services,
  staff,
  canManage,
}: {
  initialStatus: string
  appointments: PlainAppointment[]
  patients: Option[]
  services: (Option & { durationMin: number })[]
  staff: Option[]
  canManage: boolean
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [pending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [reschedule, setReschedule] = useState<PlainAppointment | null>(null)

  const filtered = useMemo(
    () => (status === 'ALL' ? appointments : appointments.filter((a) => a.status === status)),
    [appointments, status]
  )

  function changeStatus(id: string, next: PlainAppointment['status']) {
    startTransition(async () => {
      const result = await setAppointmentStatus({ id, status: next })
      if (!result.ok) { toast.error(result.error); return }
      toast.success(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`)
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return
    startTransition(async () => {
      const result = await deleteAppointment({ id })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Randevu silindi')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Randevular</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} randevu listeleniyor</p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Randevu Oluştur
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-2 flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                status === tab.value
                  ? 'bg-[#12C8AD] text-white border-[#12C8AD]'
                  : 'bg-white text-muted-foreground hover:bg-[#F7F9FB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="Bu filtrede randevu yok"
          description={canManage ? 'Yeni bir randevu oluşturarak başlayın.' : 'Yetkiniz dahilinde gösterilecek kayıt yok.'}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FB] text-left">
                  <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Tarih / Saat</th>
                    <th className="px-4 py-3 font-medium">Hasta</th>
                    <th className="px-4 py-3 font-medium">Hizmet</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Personel</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F7F9FB]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-[#0C1D36]">{formatDate(a.date)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatTime(a.startTime)} - {formatTime(a.endTime)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/hastalar/${a.patientId}`} className="text-sm font-medium text-[#0C1D36] hover:text-[#12C8AD]">
                          {a.patientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: a.serviceColor }} />
                          <span className="text-sm text-[#0C1D36]">{a.serviceName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                        {a.staffName ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${APPOINTMENT_STATUS_COLORS[a.status]}`}>
                          {APPOINTMENT_STATUS_LABELS[a.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => changeStatus(a.id, 'CONFIRMED')} disabled={pending}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeStatus(a.id, 'COMPLETED')} disabled={pending}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-sky-600" /> Tamamlandı
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setReschedule(a)} disabled={pending}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Yeniden Planla
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeStatus(a.id, 'CANCELLED')} disabled={pending}>
                                <XCircle className="mr-2 h-4 w-4 text-rose-600" /> İptal
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeStatus(a.id, 'NO_SHOW')} disabled={pending}>
                                <Clock className="mr-2 h-4 w-4 text-slate-600" /> Gelmedi
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(a.id)} disabled={pending} className="text-rose-600">
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AppointmentFormDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        patients={patients}
        services={services}
        staff={staff}
      />

      <RescheduleDialog
        appointment={reschedule}
        onClose={() => setReschedule(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

function RescheduleDialog({
  appointment,
  onClose,
  onSuccess,
}: {
  appointment: PlainAppointment | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [date, setDate] = useState(appointment?.date ?? '')
  const [startTime, setStartTime] = useState(appointment?.startTime ?? '')

  useEffect(() => {
    setDate(appointment?.date ?? '')
    setStartTime(appointment?.startTime ?? '')
  }, [appointment])

  if (!appointment) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!appointment) return
    startTransition(async () => {
      const result = await rescheduleAppointment({ id: appointment.id, date, startTime })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Randevu yeniden planlandı')
      onSuccess()
      onClose()
    })
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Randevuyu Yeniden Planla</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            {appointment.patientName} • {appointment.serviceName}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Tarih</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Saat</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={pending} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
              {pending ? 'Kaydediliyor...' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
