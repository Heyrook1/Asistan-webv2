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
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { setAppointmentStatus, rescheduleAppointment, deleteAppointment } from '@/lib/actions/appointments'
import { createDraftInvoiceFromAppointment } from '@/lib/actions/invoices'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import {
  AppointmentCancelDialog,
  AppointmentConfirmDialog,
  formatAppointmentSlotLabel,
} from '@/components/dashboard/appointment-action-dialogs'
import { AjandaModeSwitch } from '@/components/dashboard/ajanda-mode-switch'
import { EmptyState } from '@/components/dashboard/empty-state'
import { MobileAgendaShell } from '@/components/dashboard/mobile-agenda-shell'
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
  { value: 'SCHEDULED', label: 'Onay bekliyor', icon: Clock, iconClass: 'text-orange-500' },
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
  const [cancelTarget, setCancelTarget] = useState<PlainAppointment | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PlainAppointment | null>(null)
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
    const focused = appointments.find((a) => a.id === focusId)
    if (!focused) return
    // Deep-link must not be hidden by a conflicting status chip / saved pref.
    if (status !== 'ALL' && status !== focused.status) {
      setStatus(focused.status)
      writeUiPreference(UI_PREF_KEYS.appointmentStatusFilter, focused.status)
      const params = new URLSearchParams(searchParams.toString())
      if (pathname.includes('/ajanda')) params.set('mode', 'liste')
      params.set('status', focused.status)
      params.set('id', focusId)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [focusId, appointments, status, pathname, router, searchParams])

  useEffect(() => {
    if (!focusId) return
    const el = document.getElementById(`appointment-${focusId}`)
    if (!el) return
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [focusId, appointments, status])

  const filtered = useMemo(
    () => (status === 'ALL' ? appointments : appointments.filter((a) => a.status === status)),
    [appointments, status]
  )

  const scheduledCount = useMemo(
    () => appointments.filter((a) => a.status === 'SCHEDULED').length,
    [appointments]
  )

  function changeStatus(
    id: string,
    next: AppointmentStatus,
    options?: { cancelReason?: string; undoCancel?: boolean }
  ) {
    startTransition(async () => {
      try {
        const result = await setAppointmentStatus({
          id,
          status: next,
          cancelReason: options?.cancelReason,
          undoCancel: options?.undoCancel,
        })
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        if (result.data.alreadyInStatus) {
          toast.message(`Randevu zaten: ${APPOINTMENT_STATUS_LABELS[next]}`)
          router.refresh()
          return
        }
        const channel = result.data.channelDelivery
        const offer = result.data.fillGapOffer
        const offerNote =
          offer && offer.attempted > 0
            ? `Boşalan saat için ${offer.attempted} dönen hastaya teklif denendi.`
            : null
        const channelNote = channel?.label ?? null
        const description = [channelNote, offerNote].filter(Boolean).join(' ') || undefined
        const previousStatus = result.data.previousStatus
        const appt = appointments.find((row) => row.id === id)
        const slotLabel = appt ? formatAppointmentSlotLabel(appt) : null

        if (next === 'CANCELLED' && !options?.undoCancel) {
          toast.success(slotLabel ? `İptal edildi — ${slotLabel}` : 'Randevu iptal edildi', {
            description: description ?? 'Hasta bildirim kanalları kontrol edildi.',
            duration: 8000,
            action:
              previousStatus === 'SCHEDULED' || previousStatus === 'CONFIRMED'
                ? {
                    label: 'Geri al',
                    onClick: () => {
                      changeStatus(id, previousStatus, { undoCancel: true })
                    },
                  }
                : undefined,
          })
        } else if (options?.undoCancel) {
          toast.success(`İptal geri alındı → ${APPOINTMENT_STATUS_LABELS[next]}`, {
            description,
          })
        } else if (next === 'CONFIRMED') {
          toast.success(slotLabel ? `Onaylandı — ${slotLabel}` : 'Randevu onaylandı', {
            description,
          })
        } else if (channel && channel.outcome === 'error') {
          toast.warning(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`, { description })
        } else if (channel && channel.outcome === 'not_configured') {
          toast.message(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`, { description })
        } else if (channel && (channel.outcome === 'sent' || channel.outcome === 'skipped')) {
          toast.success(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`, { description })
        } else if (offerNote) {
          toast.success(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`, {
            description: offerNote,
          })
        } else {
          toast.success(`Durum güncellendi: ${APPOINTMENT_STATUS_LABELS[next]}`)
        }
        router.refresh()
      } catch {
        toast.error('Randevu durumu güncellenemedi. Lütfen tekrar deneyin.')
      }
    })
  }

  async function confirmCancel(appointment: PlainAppointment, reason: string) {
    setCancelTarget(null)
    changeStatus(appointment.id, 'CANCELLED', {
      cancelReason: reason.trim(),
    })
  }

  function confirmAppointment(appointment: PlainAppointment) {
    setConfirmTarget(null)
    changeStatus(appointment.id, 'CONFIRMED')
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteAppointment({ id })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Randevu ajandadan kaldırıldı')
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

      {/* Onay bekleyenler inbox — desktop / tablet */}
      {scheduledCount > 0 && status !== 'SCHEDULED' && (
        <button
          type="button"
          onClick={() => selectStatusFilter('SCHEDULED')}
          className="hidden w-full items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-left transition-colors hover:bg-amber-50 md:flex"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-amber-900">
              Onay bekleyenler
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-amber-950">
                {scheduledCount > 99 ? '99+' : scheduledCount}
              </span>
            </p>
            <p className="mt-0.5 text-[12px] text-amber-800/80">
              Hasta talepleri onay veya iptal bekliyor — kuyruğu açın.
            </p>
          </div>
          <span className="shrink-0 text-[12px] font-semibold text-amber-900">Kuyruk →</span>
        </button>
      )}

      {status === 'SCHEDULED' && (
        <div className="hidden rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-2.5 md:block">
          <p className="text-[13px] font-bold text-amber-900">
            Onay bekleyenler
            {scheduledCount > 0 ? (
              <span className="ml-2 font-semibold text-amber-800/80">({scheduledCount})</span>
            ) : null}
          </p>
          <p className="text-[12px] text-amber-800/75">
            Onaylayın veya iptal edin — hasta SMS/WhatsApp ile bilgilendirilir (kanal bağlıysa).
          </p>
        </div>
      )}

      <MobileAgendaShell
        appointments={appointments}
        canManage={canManage}
        pending={pending}
        onConfirm={(appointment) => setConfirmTarget(appointment)}
        onCancel={(appointment) => setCancelTarget(appointment)}
        onCreate={canManage ? () => setCreateOpen(true) : undefined}
      />

      {/* Filter chips — desktop / tablet */}
      <div className="hidden flex-wrap items-center gap-2 md:flex md:flex-nowrap">
        <div className="grid w-full grid-cols-3 gap-2 md:flex md:w-auto md:flex-1 md:flex-nowrap md:overflow-x-auto md:no-scrollbar">
          {FILTERS.map((filter) => {
            const active = status === filter.value
            const FilterIcon = filter.icon
            const chipCount = filter.value === 'SCHEDULED' ? scheduledCount : null
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
                {chipCount != null && chipCount > 0 ? (
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                      active ? 'bg-white/25 text-white' : 'bg-amber-400 text-amber-950'
                    )}
                  >
                    {chipCount > 9 ? '9+' : chipCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* List — desktop / tablet */}
      <div className="hidden md:block">
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
                onConfirm={() => setConfirmTarget(appointment)}
                onComplete={() => changeStatus(appointment.id, 'COMPLETED')}
                onCancel={() => setCancelTarget(appointment)}
                onNoShow={() => changeStatus(appointment.id, 'NO_SHOW')}
                onReschedule={() => setReschedule(appointment)}
                onDelete={() => setDeleteTarget(appointment)}
                onInvoice={() => {
                  startTransition(async () => {
                    const result = await createDraftInvoiceFromAppointment({
                      appointmentId: appointment.id,
                    })
                    if (!result.ok) {
                      toast.error(result.error)
                      return
                    }
                    toast.success(`Fatura taslağı: ${result.data.number}`)
                    router.push('/dashboard/faturalar')
                  })
                }}
              />
            </li>
          ))}
        </ul>
      )}
      </div>

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

      <AppointmentConfirmDialog
        appointment={confirmTarget}
        pending={pending}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => {
          if (confirmTarget) confirmAppointment(confirmTarget)
        }}
      />

      <AppointmentCancelDialog
        appointment={cancelTarget}
        pending={pending}
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) void confirmCancel(cancelTarget, reason)
        }}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ajandadan kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.patientName} — ${deleteTarget.serviceName} randevusu ajanda, hasta kartı, zaman çizelgesi ve sayaçlardan kaldırılır. Kayıt denetim için arşivlenir; bu işlem geri alınamaz.`
                : 'Bu randevu ajandadan kaldırılacak ve arşivlenecek.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => deleteTarget && remove(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ajandadan kaldır
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
  onInvoice,
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
  onInvoice: () => void
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
            style={{ background: `linear-gradient(135deg, ${appointment.serviceColor || 'var(--brand-blue)'}, var(--brand-blue-hover))` }}
          >
            {initialsOf(appointment.patientName)}
          </span>
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white md:hidden"
              style={{ background: `linear-gradient(135deg, ${appointment.serviceColor || 'var(--brand-blue)'}, var(--brand-blue-hover))` }}
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
                  <DropdownMenuItem
                    onClick={onConfirm}
                    disabled={pending}
                    data-testid="appointment-confirm"
                  >
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
                {appointment.status === 'COMPLETED' ? (
                  <DropdownMenuItem onClick={onInvoice} disabled={pending}>
                    <FileText className="mr-2 h-4 w-4 text-brand-teal" /> Fatura taslağı
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={onDelete} disabled={pending} className="text-rose-600 focus:text-rose-600">
                  Ajandadan kaldır
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
  const [pending, setPending] = useState(false)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!appointment) return
    setDate(appointment.date)
    // Strip seconds so controlled <input type="time"> stays HH:mm across browsers.
    setStartTime(appointment.startTime.slice(0, 5))
    setFormError(null)
  }, [appointment?.id, appointment?.date, appointment?.startTime])

  if (!appointment) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!appointment || pending) return

    const normalizedTime = startTime.trim().slice(0, 5)
    if (!/^\d{2}:\d{2}$/.test(normalizedTime)) {
      setFormError('Saat ss:dd formatında olmalı (örn. 15:30)')
      toast.error('Saat ss:dd formatında olmalı (örn. 15:30)')
      return
    }

    setPending(true)
    setFormError(null)
    try {
      const result = await rescheduleAppointment({
        id: appointment.id,
        date,
        startTime: normalizedTime,
      })
      if (!result.ok) {
        setFormError(result.error)
        toast.error(result.error)
        return
      }
      // Close first so the toast is not hidden behind the dialog layer.
      onClose()
      const slotLabel = formatAppointmentSlotLabel({
        date,
        startTime: normalizedTime,
      })
      toast.success(`Yeniden planlandı — ${slotLabel}`, {
        description: 'Hasta ve ekip bildirimleri gönderildi (kanal bağlıysa).',
      })
      onSuccess()
    } catch {
      setFormError('Randevu yeniden planlanamadı. Lütfen tekrar deneyin.')
      toast.error('Randevu yeniden planlanamadı. Lütfen tekrar deneyin.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
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
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={pending}
              />
            </AccessibleField>
            <AccessibleField
              label="Saat"
              required
              error={formError ?? undefined}
              labelClassName="text-xs text-muted-foreground mb-1.5 block"
              errorClassName="text-xs text-destructive"
            >
              <Input
                type="time"
                step={60}
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value.slice(0, 5))
                  setFormError(null)
                }}
                required
                disabled={pending}
              />
            </AccessibleField>
          </div>
          {formError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
              {pending ? 'Kaydediliyor...' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
