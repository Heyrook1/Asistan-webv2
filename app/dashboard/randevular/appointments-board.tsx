'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { AccessibleField } from '@/components/ui/accessible-field'
import {
  MoreVertical,
  CalendarPlus,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  User,
  MapPin,
  Check,
  Calendar as CalendarIcon,
  Frown,
} from 'lucide-react'
import { toast } from 'sonner'
import { setAppointmentStatus, rescheduleAppointment, deleteAppointment } from '@/lib/actions/appointments'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import { AjandaModeSwitch } from '@/components/dashboard/ajanda-mode-switch'
import { EmptyState } from '@/components/dashboard/empty-state'
import { APPOINTMENT_STATUS_LABELS, formatTime } from '@/lib/format'
import { allowedNextStatuses } from '@/lib/appointment-transitions'
import { readUiPreference, UI_PREF_KEYS, writeUiPreference } from '@/lib/ui-preferences'
import { cn } from '@/lib/utils'

type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

type PlainAppointment = {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  serviceColor: string
  staffId: string | null
  staffName: string | null
  locationId: string | null
  locationName: string | null
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string | null
}

type Option = { id: string; label: string }

type FilterValue = 'ALL' | AppointmentStatus

const STATUS_TONE: Record<AppointmentStatus, {
  dateBg: string
  dateText: string
  dateMuted: string
  badgeBg: string
  badgeText: string
  dot: string
}> = {
  SCHEDULED: {
    dateBg: 'bg-orange-50',
    dateText: 'text-orange-700',
    dateMuted: 'text-orange-500/80',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  CONFIRMED: {
    dateBg: 'bg-sky-50',
    dateText: 'text-sky-700',
    dateMuted: 'text-sky-500/80',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-700',
    dot: 'bg-sky-500',
  },
  COMPLETED: {
    dateBg: 'bg-emerald-50',
    dateText: 'text-emerald-700',
    dateMuted: 'text-emerald-600/80',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    dateBg: 'bg-rose-50',
    dateText: 'text-rose-700',
    dateMuted: 'text-rose-500/80',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  NO_SHOW: {
    dateBg: 'bg-slate-100',
    dateText: 'text-slate-700',
    dateMuted: 'text-slate-500',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-700',
    dot: 'bg-slate-500',
  },
}

const STATUS_ICON: Record<AppointmentStatus, typeof Clock> = {
  SCHEDULED: Clock,
  CONFIRMED: CalendarCheck,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  NO_SHOW: Frown,
}

const FILTERS: Array<{ value: FilterValue; label: string; icon: typeof Clock; iconClass: string }> = [
  { value: 'ALL', label: 'Tümü', icon: Check, iconClass: 'text-current' },
  { value: 'SCHEDULED', label: 'Planlandı', icon: Clock, iconClass: 'text-orange-500' },
  { value: 'CONFIRMED', label: 'Onaylandı', icon: CalendarCheck, iconClass: 'text-sky-500' },
  { value: 'COMPLETED', label: 'Tamamlandı', icon: CheckCircle2, iconClass: 'text-emerald-500' },
  { value: 'CANCELLED', label: 'İptal', icon: XCircle, iconClass: 'text-rose-500' },
  { value: 'NO_SHOW', label: 'Gelmedi', icon: Frown, iconClass: 'text-slate-500' },
]

const monthYearFormatter = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' })
const shortDateFormatter = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

function parseDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

function durationMinutes(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppointmentsBoard({
  initialStatus,
  initialCreateOpen = false,
  appointments,
  patients,
  services,
  staff,
  locations,
  canManage,
  defaultStaffId,
}: {
  initialStatus: string
  initialCreateOpen?: boolean
  appointments: PlainAppointment[]
  patients: Option[]
  services: (Option & { durationMin: number })[]
  staff: Option[]
  locations: Option[]
  canManage: boolean
  defaultStaffId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<FilterValue>(
    (initialStatus as FilterValue) ?? 'ALL'
  )
  const [pending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(initialCreateOpen)
  const [reschedule, setReschedule] = useState<PlainAppointment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlainAppointment | null>(null)
  const focusId = searchParams.get('id')
  const prefsHydrated = useRef(false)

  useEffect(() => {
    if (prefsHydrated.current) return
    prefsHydrated.current = true
    if (initialStatus && initialStatus !== 'ALL') return
    const saved = readUiPreference<FilterValue>(UI_PREF_KEYS.appointmentStatusFilter)
    if (!saved || saved === 'ALL') return
    if (!FILTERS.some((filter) => filter.value === saved)) return
    setStatus(saved)
  }, [initialStatus])

  function selectStatusFilter(next: FilterValue) {
    setStatus(next)
    writeUiPreference(UI_PREF_KEYS.appointmentStatusFilter, next)
    const params = new URLSearchParams(searchParams.toString())
    if (pathname.includes('/ajanda')) params.set('mode', 'liste')
    if (next === 'ALL') params.delete('status')
    else params.set('status', next)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  useEffect(() => {
    if (!initialCreateOpen) return
    setCreateOpen(true)
    const next = new URLSearchParams(searchParams.toString())
    if (!next.has('create')) return
    next.delete('create')
    const queryString = next.toString()
    const href = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(href, { scroll: false })
  }, [initialCreateOpen, pathname, router, searchParams])

  useEffect(() => {
    if (!focusId) return
    const el = document.getElementById(`appointment-${focusId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId, appointments])

  const filtered = useMemo(
    () => (status === 'ALL' ? appointments : appointments.filter((a) => a.status === status)),
    [appointments, status]
  )

  function changeStatus(id: string, next: AppointmentStatus) {
    startTransition(async () => {
      const result = await setAppointmentStatus({ id, status: next })
      if (!result.ok) { toast.error(result.error); return }
      toast.success(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`)
      router.refresh()
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteAppointment({ id })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Randevu silindi')
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-brand-ink lg:text-[28px]">Ajanda</h1>
              <p className="mt-0.5 text-[13px] text-muted-foreground lg:text-sm">
                Liste modu — onay, iptal ve durum yönetimi.
              </p>
            </div>
            <AjandaModeSwitch mode="liste" />
          </div>
        </div>
        {canManage && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="hidden h-11 shrink-0 gap-2 bg-brand-teal text-white shadow-sm hover:bg-brand-teal-hover md:inline-flex"
          >
            <CalendarPlus className="h-4 w-4" />
            Randevu Oluştur
          </Button>
        )}
      </div>

      {/* Filter chips + Filtrele */}
      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        <div className="grid w-full grid-cols-3 gap-2 md:flex md:w-auto md:flex-1 md:flex-nowrap md:overflow-x-auto md:no-scrollbar">
          {FILTERS.map((filter) => {
            const active = status === filter.value
            const FilterIcon = filter.icon
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => selectStatusFilter(filter.value)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors md:h-10',
                  active
                    ? 'border-brand-teal bg-brand-teal text-white shadow-sm'
                    : 'border-border bg-white text-brand-ink hover:border-brand-teal/40'
                )}
              >
                <FilterIcon className={cn('h-4 w-4', active ? 'text-white' : filter.iconClass)} />
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={
            status === 'ALL'
              ? 'Henüz randevu yok'
              : 'Bu filtrede randevu yok'
          }
          description={
            status !== 'ALL'
              ? 'Filtreyi temizleyerek tüm randevuları görebilir veya yeni bir randevu oluşturabilirsiniz.'
              : canManage
                ? 'İlk randevuyu oluşturarak ajandayı doldurun.'
                : 'Yetkiniz dahilinde gösterilecek kayıt yok.'
          }
          ctaLabel={
            status !== 'ALL'
              ? 'Filtreyi temizle'
              : canManage
                ? 'Randevu oluştur'
                : undefined
          }
          onCtaClick={
            status !== 'ALL'
              ? () => selectStatusFilter('ALL')
              : canManage
                ? () => setCreateOpen(true)
                : undefined
          }
          secondaryCtaLabel={status !== 'ALL' && canManage ? 'Randevu oluştur' : undefined}
          onSecondaryCtaClick={status !== 'ALL' && canManage ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((appointment) => (
            <li key={appointment.id} id={`appointment-${appointment.id}`}>
              <AppointmentRow
                appointment={appointment}
                focused={focusId === appointment.id}
                canManage={canManage}
                pending={pending}
                onConfirm={() => changeStatus(appointment.id, 'CONFIRMED')}
                onComplete={() => changeStatus(appointment.id, 'COMPLETED')}
                onCancel={() => changeStatus(appointment.id, 'CANCELLED')}
                onNoShow={() => changeStatus(appointment.id, 'NO_SHOW')}
                onReschedule={() => setReschedule(appointment)}
                onDelete={() => setDeleteTarget(appointment)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Mobile floating create button (lives above the bottom-nav FAB area is already handled by global FAB, so we hide this) */}

      <AppointmentFormDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        locations={locations}
        patients={patients}
        services={services}
        staff={staff}
        defaultStaffId={defaultStaffId}
      />

      <RescheduleDialog
        appointment={reschedule}
        onClose={() => setReschedule(null)}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `${deleteTarget.patientName} - ${deleteTarget.serviceName} randevusu silinecek. Bu işlem geri alınamaz.` : 'Bu randevu silinecek.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => deleteTarget && remove(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AppointmentRow({
  appointment,
  focused,
  canManage,
  pending,
  onConfirm,
  onComplete,
  onCancel,
  onNoShow,
  onReschedule,
  onDelete,
}: {
  appointment: PlainAppointment
  focused?: boolean
  canManage: boolean
  pending: boolean
  onConfirm: () => void
  onComplete: () => void
  onCancel: () => void
  onNoShow: () => void
  onReschedule: () => void
  onDelete: () => void
}) {
  const tone = STATUS_TONE[appointment.status]
  const StatusIcon = STATUS_ICON[appointment.status]
  const date = parseDate(appointment.date)
  const dayNumber = date.getDate()
  const monthYear = monthYearFormatter.format(date)
  const weekday = weekdayFormatter.format(date)
  const shortDate = shortDateFormatter.format(date)
  const duration = durationMinutes(appointment.startTime, appointment.endTime)
  const next = allowedNextStatuses(appointment.status)
  const canConfirm = next.includes('CONFIRMED')
  const canComplete = next.includes('COMPLETED')
  const canCancelStatus = next.includes('CANCELLED')
  const canMarkNoShow = next.includes('NO_SHOW')
  const canReschedule = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md',
        focused && 'ring-2 ring-brand-teal/40'
      )}
    >
      <div className="flex items-stretch gap-3 p-3 md:gap-4 md:p-4">
        {/* Date badge */}
        <div
          className={cn(
            'flex w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl px-2 py-2 text-center md:w-[88px] md:py-3',
            tone.dateBg
          )}
        >
          <span className={cn('text-2xl font-bold leading-none md:text-3xl', tone.dateText)}>
            {dayNumber}
          </span>
          <span className={cn('mt-1 text-[10px] font-medium capitalize md:text-[11px]', tone.dateMuted)}>
            {monthYear}
          </span>
          <span className={cn('text-[10px] font-medium capitalize md:text-[11px]', tone.dateMuted)}>
            {weekday}
          </span>
        </div>

        {/* Time block — desktop only */}
        <div className="hidden w-[80px] shrink-0 flex-col justify-center md:flex">
          <span className="text-xl font-bold text-brand-ink">{formatTime(appointment.startTime)}</span>
          <span className="text-xs text-muted-foreground">{duration} dk</span>
        </div>

        {/* Avatar */}
        <div className="hidden shrink-0 items-center md:flex">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${appointment.serviceColor || 'var(--brand-teal)'}, var(--brand-cyan))` }}
          >
            {initialsOf(appointment.patientName)}
          </span>
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white md:hidden"
              style={{ background: `linear-gradient(135deg, ${appointment.serviceColor || 'var(--brand-teal)'}, var(--brand-cyan))` }}
            >
              {initialsOf(appointment.patientName)}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/hastalar/${appointment.patientId}`}
                className="block truncate text-[15px] font-bold text-brand-ink hover:text-brand-teal md:text-base"
              >
                {appointment.patientName}
              </Link>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground md:text-[13px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: appointment.serviceColor || 'var(--brand-teal)' }}
                />
                <span className="truncate">{appointment.serviceName}</span>
              </p>
              {appointment.staffName && (
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground md:text-[13px]">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="truncate">{appointment.staffName}</span>
                </p>
              )}
              {appointment.locationName && (
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground md:text-[13px]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{appointment.locationName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Mobile-only bottom row: time + status */}
          <div className="mt-3 flex items-center justify-between gap-2 md:hidden">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-ink">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {formatTime(appointment.startTime)}
              <span className="font-normal text-muted-foreground">• {duration} dk</span>
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
              tone.badgeBg, tone.badgeText
            )}>
              <StatusIcon className="h-3 w-3" />
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </span>
          </div>
        </div>

        {/* Status + datetime — desktop only */}
        <div className="hidden shrink-0 flex-col items-end justify-center gap-2 md:flex">
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            tone.badgeBg, tone.badgeText
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            {shortDate} {formatTime(appointment.startTime)}
          </span>
        </div>

        {/* Menu */}
        {canManage && (
          <div className="flex shrink-0 items-start md:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-slate-50 hover:text-brand-ink"
                  aria-label="İşlemler"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canConfirm ? (
                  <DropdownMenuItem onClick={onConfirm} disabled={pending}>
                    <CalendarCheck className="mr-2 h-4 w-4 text-sky-600" /> Onayla
                  </DropdownMenuItem>
                ) : null}
                {canComplete ? (
                  <DropdownMenuItem onClick={onComplete} disabled={pending}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Tamamlandı
                  </DropdownMenuItem>
                ) : null}
                {canReschedule ? (
                  <DropdownMenuItem onClick={onReschedule} disabled={pending}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Yeniden Planla
                  </DropdownMenuItem>
                ) : null}
                {canCancelStatus ? (
                  <DropdownMenuItem onClick={onCancel} disabled={pending}>
                    <XCircle className="mr-2 h-4 w-4 text-rose-600" /> İptal
                  </DropdownMenuItem>
                ) : null}
                {canMarkNoShow ? (
                  <DropdownMenuItem onClick={onNoShow} disabled={pending}>
                    <Frown className="mr-2 h-4 w-4 text-slate-600" /> Gelmedi
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={onDelete} disabled={pending} className="text-rose-600 focus:text-rose-600">
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </article>
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
          <DialogDescription>
            {appointment.patientName} için yeni tarih ve saat seçin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            {appointment.patientName} • {appointment.serviceName}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <AccessibleField label="Tarih" required labelClassName="text-xs text-muted-foreground mb-1.5 block">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </AccessibleField>
            <AccessibleField label="Saat" required labelClassName="text-xs text-muted-foreground mb-1.5 block">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </AccessibleField>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={pending} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
              {pending ? 'Kaydediliyor...' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
