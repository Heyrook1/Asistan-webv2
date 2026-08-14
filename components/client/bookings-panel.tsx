'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  MapPin,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { useLiveAvailability } from '@/hooks/use-live-availability'
import { userMessageFromUnknown } from '@/lib/http/read-json'
import {
  canCancelOrRescheduleByPolicy,
  DEFAULT_CANCEL_MIN_HOURS,
} from '@/lib/client-marketplace/cancel-policy'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

type AppointmentRow = {
  id: string
  status: AppointmentStatus
  date: string
  startTime: string
  endTime: string
  businessId: string
  serviceId: string
  doctorId: string | null
  locationId: string | null
  hasReview?: boolean
  clinic: { id: string; name: string; slug?: string | null }
  doctor: { id: string; fullName: string; specialty: string | null } | null
  service: { id: string; name: string }
  location: { id: string; name: string; address: string | null } | null
}

type Slot = { startTime: string; endTime: string }

/** Same pair shape as useLanguage().t — for module-level helpers. */
type Translate = <T>(translations: { tr: T; en: T }) => T

function statusLabel(status: AppointmentStatus, t: Translate): string {
  switch (status) {
    case 'SCHEDULED':
      return t({ tr: 'Onay bekliyor', en: 'Awaiting confirmation' })
    case 'CONFIRMED':
      return t({ tr: 'Onaylandı', en: 'Confirmed' })
    case 'COMPLETED':
      return t({ tr: 'Tamamlandı', en: 'Completed' })
    case 'CANCELLED':
      return t({ tr: 'İptal', en: 'Cancelled' })
    case 'NO_SHOW':
      return t({ tr: 'Gelinmedi', en: 'No-show' })
  }
}

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-800 border-sky-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
  NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
}

function isActive(status: AppointmentStatus) {
  return status === 'SCHEDULED' || status === 'CONFIRMED'
}

function appointmentStartsAtMs(date: string, startTime: string): number {
  const time = startTime.length === 5 ? `${startTime}:00` : startTime
  return new Date(`${date}T${time}`).getTime()
}

/** Yaklaşan = aktif durum + henüz başlamamış (geçmiş tarihli SCHEDULED past'e düşer). */
function isUpcomingRow(row: AppointmentRow, now = Date.now()) {
  return isActive(row.status) && appointmentStartsAtMs(row.date, row.startTime) >= now
}

function nextStepCopy(status: AppointmentStatus, t: Translate) {
  switch (status) {
    case 'SCHEDULED':
      return t({
        tr: 'Klinik onayı bekleniyor. Onaylanınca bildirim alırsınız.',
        en: 'Waiting for clinic confirmation. You will be notified once it is approved.',
      })
    case 'CONFIRMED':
      return t({
        tr: 'Randevunuz onaylandı. Zamanı gelince hatırlatma gönderilir.',
        en: 'Your appointment is confirmed. A reminder will be sent closer to the time.',
      })
    case 'COMPLETED':
      return t({
        tr: 'Ziyaret tamamlandı. Deneyiminizi puanlayabilirsiniz.',
        en: 'Visit completed. You can rate your experience.',
      })
    case 'CANCELLED':
      return t({
        tr: 'Bu randevu iptal edildi. Yeni bir saat seçebilirsiniz.',
        en: 'This appointment was cancelled. You can pick a new time.',
      })
    case 'NO_SHOW':
      return t({
        tr: 'Bu randevu gelinmedi olarak işaretlendi.',
        en: 'This appointment was marked as a no-show.',
      })
  }
}

const CANCEL_MIN_HOURS = DEFAULT_CANCEL_MIN_HOURS

async function getAccessToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function clientFetch<T>(path: string, init?: RequestInit, t?: Translate): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('AUTH_REQUIRED')
  }
  const response = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const fallback = t
      ? t({ tr: 'İstek başarısız', en: 'Request failed' })
      : 'Request failed'
    throw new Error((body as { error?: string }).error ?? fallback)
  }
  return body as T
}

export function ClientBookingsPanel() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const focusId = searchParams.get('id')

  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const [showPast, setShowPast] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<AppointmentRow | null>(null)

  const rescheduleRow = useMemo(
    () => rows.find((row) => row.id === rescheduleId) ?? null,
    [rows, rescheduleId],
  )

  const {
    slots,
    loading: slotsLoading,
    refresh: refreshRescheduleSlots,
  } = useLiveAvailability({
    businessId: rescheduleRow?.businessId ?? '',
    doctorId: rescheduleRow?.doctorId ?? null,
    serviceId: rescheduleRow?.serviceId ?? null,
    date: rescheduleDate || null,
    locationId: rescheduleRow?.locationId ?? null,
    enabled: Boolean(rescheduleId && rescheduleRow?.doctorId && rescheduleDate),
  })

  useEffect(() => {
    if (!selectedSlot) return
    if (!slots.some((slot) => slot.startTime === selectedSlot)) {
      setSelectedSlot(null)
    }
  }, [slots, selectedSlot])

  const load = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setLoading(true)
    try {
      const data = await clientFetch<{ appointments: AppointmentRow[] }>(
        '/api/client/appointments',
        undefined,
        t,
      )
      setRows(data.appointments)
      setAuthRequired(false)
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        setAuthRequired(true)
        setRows([])
      } else if (!opts?.quiet) {
        toast.error(
          error instanceof Error
            ? error.message
            : t({ tr: 'Randevular yüklenemedi', en: 'Could not load appointments' }),
        )
      }
    } finally {
      if (!opts?.quiet) setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
    function onVisible() {
      if (document.visibilityState === 'visible') void load({ quiet: true })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  // Soft poll while tab is focused — catch clinic approve/cancel without manual refresh.
  useEffect(() => {
    const SOFT_POLL_MS = 30_000
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      void load({ quiet: true })
    }, SOFT_POLL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (!focusId) return
    const el = document.getElementById(`booking-${focusId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusId, rows])

  const upcoming = useMemo(
    () =>
      rows
        .filter((row) => isUpcomingRow(row))
        .sort(
          (a, b) =>
            appointmentStartsAtMs(a.date, a.startTime) - appointmentStartsAtMs(b.date, b.startTime)
        ),
    [rows]
  )
  const past = useMemo(
    () =>
      rows
        .filter((row) => !isUpcomingRow(row))
        .sort(
          (a, b) =>
            appointmentStartsAtMs(b.date, b.startTime) - appointmentStartsAtMs(a.date, a.startTime)
        ),
    [rows]
  )

  async function cancelAppointment(row: AppointmentRow) {
    const policy = canCancelOrRescheduleByPolicy(row.date, row.startTime, CANCEL_MIN_HOURS)
    if (!policy.ok) {
      toast.error(
        t({
          tr: `Randevu başlangıcına ${CANCEL_MIN_HOURS} saatten az kaldığı için iptal edilemez. Klinik ile iletişime geçin.`,
          en: `This cannot be cancelled with less than ${CANCEL_MIN_HOURS} hours to the appointment. Please contact the clinic.`,
        }),
      )
      return
    }
    setCancelTarget(row)
  }

  async function confirmCancelAppointment() {
    const row = cancelTarget
    if (!row) return
    setCancelTarget(null)

    setSavingId(row.id)
    try {
      await clientFetch(
        `/api/client/appointments/${row.id}/cancel`,
        { method: 'POST', body: JSON.stringify({}) },
        t,
      )
      toast.success(
        t({
          tr: 'Randevu iptal edildi — bildirim gönderildi',
          en: 'Appointment cancelled — notification sent',
        }),
      )
      await load()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t({ tr: 'İptal başarısız', en: 'Cancellation failed' }),
      )
    } finally {
      setSavingId(null)
    }
  }

  function openReschedule(row: AppointmentRow) {
    const policy = canCancelOrRescheduleByPolicy(row.date, row.startTime, CANCEL_MIN_HOURS)
    if (!policy.ok) {
      toast.error(
        t({
          tr: `Randevu başlangıcına ${CANCEL_MIN_HOURS} saatten az kaldığı için yeniden planlama yapılamaz.`,
          en: `This cannot be rescheduled with less than ${CANCEL_MIN_HOURS} hours to the appointment.`,
        }),
      )
      return
    }
    if (!row.doctorId) {
      toast.error(
        t({
          tr: 'Bu randevu için hekim bilgisi eksik',
          en: 'Doctor information is missing for this appointment',
        }),
      )
      return
    }
    setRescheduleId(row.id)
    setRescheduleDate(row.date)
    setSelectedSlot(null)
  }

  function changeRescheduleDate(date: string) {
    setRescheduleDate(date)
    setSelectedSlot(null)
  }

  async function submitReschedule(id: string) {
    if (!rescheduleDate || !selectedSlot) {
      toast.error(t({ tr: 'Tarih ve saat seçin', en: 'Select a date and time' }))
      return
    }
    setSavingId(id)
    try {
      await clientFetch(
        `/api/client/appointments/${id}/reschedule`,
        {
          method: 'POST',
          body: JSON.stringify({ date: rescheduleDate, startTime: selectedSlot }),
        },
        t,
      )
      toast.success(t({ tr: 'Randevu yeniden planlandı', en: 'Appointment rescheduled' }))
      setRescheduleId(null)
      await load()
    } catch (error) {
      const msg = userMessageFromUnknown(
        error,
        t({ tr: 'Yeniden planlama başarısız', en: 'Rescheduling failed' }),
      )
      toast.error(msg)
      setSelectedSlot(null)
      refreshRescheduleSlots()
    } finally {
      setSavingId(null)
    }
  }

  async function submitReview(id: string) {
    setSavingId(id)
    try {
      await clientFetch(
        '/api/client/reviews',
        {
          method: 'POST',
          body: JSON.stringify({ appointmentId: id, rating, comment: comment.trim() || undefined }),
        },
        t,
      )
      toast.success(t({ tr: 'Yorumunuz kaydedildi', en: 'Your review was saved' }))
      setReviewId(null)
      setComment('')
      setRating(5)
      await load()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t({ tr: 'Yorum kaydedilemedi', en: 'Review could not be saved' }),
      )
    } finally {
      setSavingId(null)
    }
  }

  if (authRequired) {
    return (
      <main className="space-y-5">
        <header className="space-y-1">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight text-slate-900">
            {t({ tr: 'Randevularım', en: 'My appointments' })}
          </h1>
          <p className="text-[13px] text-slate-500">
            {t({
              tr: 'Kayıtlı randevularınızı görmek, iptal veya yeniden planlamak için giriş yapın.',
              en: 'Sign in to view, cancel or reschedule your saved appointments.',
            })}
          </p>
        </header>
        <div className="rounded-[1.25rem] bg-white p-5 ring-1 ring-slate-200/70">
          <p className="text-sm text-slate-600">
            {t({
              tr: 'Misafir olarak klinik sayfasından randevu alabilirsiniz. Takip için ',
              en: 'You can book as a guest from a clinic page. To track bookings you need an ',
            })}
            <span className="font-semibold text-slate-900">Asistan</span>
            {t({ tr: ' hesabı gerekir.', en: ' account.' })}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
              <Link href="/client/profile">
                {t({ tr: 'Giriş / kayıt', en: 'Sign in / sign up' })}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link href="/client/clinics">
                {t({ tr: 'Hesapsız klinik bul', en: 'Find a clinic without an account' })}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight text-slate-900">
            {t({ tr: 'Randevularım', en: 'My appointments' })}
          </h1>
          <p className="text-[13px] text-slate-500">
            {t({
              tr: 'Onay, iptal, yeniden planlama ve değerlendirme burada.',
              en: 'Confirmations, cancellations, rescheduling and reviews live here.',
            })}
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
          <Link href="/client/clinics">{t({ tr: 'Yeni randevu', en: 'New appointment' })}</Link>
        </Button>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t({ tr: 'Randevular yükleniyor…', en: 'Loading appointments…' })}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[1.25rem] bg-white p-6 ring-1 ring-slate-200/70">
          <p className="text-sm font-semibold text-slate-900">
            {t({ tr: 'Henüz randevunuz yok', en: 'You have no appointments yet' })}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t({
              tr: 'Klinik keşfedin veya bildiğiniz klinik linkinden 3 adımda talep oluşturun.',
              en: 'Browse clinics, or use a clinic link you already have to request one in three steps.',
            })}
          </p>
          <div className="mt-4">
            <Button asChild className="h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
              <Link href="/client/clinics">{t({ tr: 'Klinik ara', en: 'Search clinics' })}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t({ tr: 'Yaklaşan', en: 'Upcoming' })} ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t({ tr: 'Yaklaşan randevu yok.', en: 'No upcoming appointments.' })}
              </p>
            ) : (
              upcoming.map((row) => (
                <BookingCard
                  key={row.id}
                  row={row}
                  focused={focusId === row.id}
                  saving={savingId === row.id}
                  rescheduleOpen={rescheduleId === row.id}
                  rescheduleDate={rescheduleDate}
                  slots={slots}
                  slotsLoading={slotsLoading}
                  selectedSlot={selectedSlot}
                  onCancel={() => void cancelAppointment(row)}
                  onOpenReschedule={() => openReschedule(row)}
                  onDateChange={(date) => changeRescheduleDate(date)}
                  onSelectSlot={setSelectedSlot}
                  onSubmitReschedule={() => void submitReschedule(row.id)}
                  onCloseReschedule={() => setRescheduleId(null)}
                />
              ))
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t({ tr: 'Geçmiş', en: 'Past' })} ({past.length})
              </h2>
              {past.length > 3 ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#0071E3] hover:underline"
                  onClick={() => setShowPast((value) => !value)}
                >
                  {showPast
                    ? t({ tr: 'Daralt', en: 'Collapse' })
                    : t({ tr: 'Tümünü göster', en: 'Show all' })}
                </button>
              ) : null}
            </div>
            {(showPast ? past : past.slice(0, 3)).map((row) => (
              <BookingCard
                key={row.id}
                row={row}
                focused={focusId === row.id}
                saving={savingId === row.id}
                reviewOpen={reviewId === row.id}
                rating={rating}
                comment={comment}
                onOpenReview={() => {
                  setReviewId(row.id)
                  setRating(5)
                  setComment('')
                }}
                onCloseReview={() => setReviewId(null)}
                onRatingChange={setRating}
                onCommentChange={setComment}
                onSubmitReview={() => void submitReview(row.id)}
              />
            ))}
            {past.length > 0 ? (
              <Link
                href="/client/health"
                className="block rounded-[1.15rem] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 transition hover:border-[#0071E3]/30 hover:bg-[#0071E3]/5"
              >
                {t({
                  tr: 'Boylamsal ziyaret görünümü için ',
                  en: 'For a longitudinal view of your visits, see the ',
                })}
                <span className="font-semibold text-[#0071E3]">
                  {t({ tr: 'Asistan pasaportu', en: 'Asistan passport' })}
                </span>
              </Link>
            ) : null}
          </section>
        </>
      )}

      <AlertDialog open={cancelTarget !== null} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t({
                tr: 'Bu randevuyu iptal etmek istiyor musunuz?',
                en: 'Cancel this appointment?',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? t({
                    tr: `${cancelTarget.clinic.name} — ${cancelTarget.date} ${cancelTarget.startTime}. İptal, randevu başlangıcından en az ${CANCEL_MIN_HOURS} saat önce yapılmalıdır.`,
                    en: `${cancelTarget.clinic.name} — ${cancelTarget.date} ${cancelTarget.startTime}. Cancellation must be at least ${CANCEL_MIN_HOURS} hours before the appointment starts.`,
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t({ tr: 'Hayır, geri dön', en: 'No, go back' })}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmCancelAppointment()}>
              {t({ tr: 'Evet, iptal et', en: 'Yes, cancel it' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

function BookingCard({
  row,
  focused,
  saving,
  rescheduleOpen,
  rescheduleDate,
  slots,
  slotsLoading,
  selectedSlot,
  reviewOpen,
  rating,
  comment,
  onCancel,
  onOpenReschedule,
  onDateChange,
  onSelectSlot,
  onSubmitReschedule,
  onCloseReschedule,
  onOpenReview,
  onCloseReview,
  onRatingChange,
  onCommentChange,
  onSubmitReview,
}: {
  row: AppointmentRow
  focused?: boolean
  saving?: boolean
  rescheduleOpen?: boolean
  rescheduleDate?: string
  slots?: Slot[]
  slotsLoading?: boolean
  selectedSlot?: string | null
  reviewOpen?: boolean
  rating?: number
  comment?: string
  onCancel?: () => void
  onOpenReschedule?: () => void
  onDateChange?: (date: string) => void
  onSelectSlot?: (slot: string) => void
  onSubmitReschedule?: () => void
  onCloseReschedule?: () => void
  onOpenReview?: () => void
  onCloseReview?: () => void
  onRatingChange?: (value: number) => void
  onCommentChange?: (value: string) => void
  onSubmitReview?: () => void
}) {
  const { t } = useLanguage()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyEvents, setHistoryEvents] = useState<
    Array<{ id: string; title: string; description: string | null; createdAt: string }>
  >([])
  const policyOk = canCancelOrRescheduleByPolicy(row.date, row.startTime, CANCEL_MIN_HOURS).ok

  async function loadHistory() {
    if (historyOpen) {
      setHistoryOpen(false)
      return
    }
    setHistoryOpen(true)
    if (historyEvents.length > 0) return
    setHistoryLoading(true)
    try {
      const data = await clientFetch<{
        events: Array<{ id: string; title: string; description: string | null; createdAt: string }>
      }>(`/api/client/appointments/${row.id}/history`, undefined, t)
      setHistoryEvents(data.events ?? [])
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t({ tr: 'Durum geçmişi alınamadı', en: 'Could not load status history' }),
      )
      setHistoryOpen(false)
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <article
      id={`booking-${row.id}`}
      className={cn(
        'rounded-[1.35rem] bg-white/90 p-4 ring-1 ring-slate-900/5 transition',
        focused && 'ring-2 ring-[#0071E3]/35',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{row.clinic.name}</p>
          <p className="text-sm text-muted-foreground">
            {row.service.name}
            {row.doctor ? ` • ${row.doctor.fullName}` : ''}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            {row.date} {row.startTime}–{row.endTime}
          </p>
          {row.location?.address || row.location?.name ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {row.location.address ?? row.location.name}
            </p>
          ) : null}
        </div>
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', STATUS_CLASS[row.status])}>
          {statusLabel(row.status, t)}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">{nextStepCopy(row.status, t)}</p>

      {isActive(row.status) ? (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={saving || !policyOk}
              onClick={onOpenReschedule}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t({ tr: 'Yeniden planla', en: 'Reschedule' })}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={saving || !policyOk}
              onClick={onCancel}
              className="gap-1.5 text-rose-700 hover:text-rose-800"
            >
              <XCircle className="h-3.5 w-3.5" />
              {t({ tr: 'İptal et', en: 'Cancel' })}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={async () => {
                try {
                  const token = await getAccessToken()
                  if (!token) throw new Error('AUTH_REQUIRED')
                  const response = await fetch(`/api/client/appointments/${row.id}/ics`, {
                    headers: { authorization: `Bearer ${token}` },
                  })
                  if (!response.ok)
                    throw new Error(
                      t({ tr: 'Takvim dosyası alınamadı', en: 'Could not fetch calendar file' }),
                    )
                  const blob = await response.blob()
                  const url = URL.createObjectURL(blob)
                  const anchor = document.createElement('a')
                  anchor.href = url
                  anchor.download = `asistan-randevu-${row.id.slice(0, 8)}.ics`
                  anchor.click()
                  URL.revokeObjectURL(url)
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : t({ tr: 'Takvim dosyası alınamadı', en: 'Could not fetch calendar file' }),
                  )
                }
              }}
            >
              {t({ tr: 'Takvime ekle', en: 'Add to calendar' })}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {policyOk
              ? t({
                  tr: `İptal / yeniden planlama: randevu başlangıcından en az ${CANCEL_MIN_HOURS} saat önce.`,
                  en: `Cancel / reschedule: at least ${CANCEL_MIN_HOURS} hours before the appointment starts.`,
                })
              : t({
                  tr: `Randevu başlangıcına ${CANCEL_MIN_HOURS} saatten az kaldı — iptal için klinik ile iletişime geçin.`,
                  en: `Less than ${CANCEL_MIN_HOURS} hours to the appointment — contact the clinic to cancel.`,
                })}
          </p>
        </div>
      ) : null}

      {row.status === 'COMPLETED' && !row.hasReview ? (
        <div className="mt-4">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onOpenReview} disabled={saving}>
            <Star className="h-3.5 w-3.5" />
            {t({ tr: 'Değerlendir', en: 'Leave a review' })}
          </Button>
        </div>
      ) : null}

      {row.clinic.slug ? (
        <div className="mt-3">
          <Button asChild size="sm" variant="ghost" className="h-9 px-0 text-[#0071E3]">
            <Link
              href={`/book/${row.clinic.slug}${row.doctorId ? `?doctorId=${encodeURIComponent(row.doctorId)}` : ''}${row.serviceId ? `${row.doctorId ? '&' : '?'}serviceId=${encodeURIComponent(row.serviceId)}` : ''}`}
            >
              {t({ tr: 'Bu klinikten yeni randevu', en: 'New appointment at this clinic' })}
            </Link>
          </Button>
        </div>
      ) : null}

      {row.status === 'COMPLETED' && row.hasReview ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t({
            tr: 'Doğrulanmış ziyaret · değerlendirme gönderildi',
            en: 'Verified visit · review submitted',
          })}
        </p>
      ) : null}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => void loadHistory()}
          className="text-xs font-semibold text-slate-600 underline-offset-2 hover:text-[#0071E3] hover:underline"
        >
          {historyOpen
            ? t({ tr: 'Durum geçmişini gizle', en: 'Hide status history' })
            : t({ tr: 'Durum geçmişini göster', en: 'Show status history' })}
        </button>
        {historyOpen ? (
          <div className="mt-2 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            {historyLoading ? (
              <p className="text-xs text-muted-foreground">
                {t({ tr: 'Geçmiş yükleniyor…', en: 'Loading history…' })}
              </p>
            ) : historyEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t({ tr: 'Henüz kayıtlı durum olayı yok.', en: 'No status events recorded yet.' })}
              </p>
            ) : (
              historyEvents.map((event) => (
                <div key={event.id} className="text-xs text-slate-700">
                  <p className="font-medium">{event.title}</p>
                  {event.description ? (
                    <p className="text-muted-foreground">{event.description}</p>
                  ) : null}
                  <p className="text-[10px] text-slate-400">
                    {event.createdAt.slice(0, 16).replace('T', ' ')}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      {rescheduleOpen ? (
        <div className="mt-4 space-y-3 rounded-xl border bg-slate-50/80 p-3">
          <Input
            type="date"
            value={rescheduleDate}
            onChange={(e) => onDateChange?.(e.target.value)}
          />
          {slotsLoading ? (
            <p className="text-xs text-muted-foreground">
              {t({ tr: 'Saatler yükleniyor…', en: 'Loading times…' })}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(slots ?? []).map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => onSelectSlot?.(slot.startTime)}
                  className={cn(
                    'flex h-11 min-h-11 items-center justify-center rounded-xl border px-3 text-base font-semibold',
                    selectedSlot === slot.startTime
                      ? 'border-[#0071E3] bg-[#0071E3] text-white'
                      : 'bg-white text-foreground'
                  )}
                >
                  {slot.startTime}
                </button>
              ))}
              {(slots ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t({ tr: 'Bu tarihte uygun saat yok.', en: 'No times available on this date.' })}
                </p>
              ) : null}
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={onSubmitReschedule} disabled={saving || !selectedSlot}>
              {t({ tr: 'Kaydet', en: 'Save' })}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCloseReschedule}>
              {t({ tr: 'Vazgeç', en: 'Cancel' })}
            </Button>
          </div>
        </div>
      ) : null}

      {reviewOpen ? (
        <div className="mt-4 space-y-3 rounded-xl border bg-slate-50/80 p-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onRatingChange?.(value)}
                className={cn(
                  'rounded-md p-1',
                  (rating ?? 0) >= value ? 'text-amber-500' : 'text-slate-300'
                )}
                aria-label={t({
                  tr: `${value} yıldız`,
                  en: `${value} star${value === 1 ? '' : 's'}`,
                })}
              >
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => onCommentChange?.(e.target.value)}
            placeholder={t({ tr: 'İsteğe bağlı yorum', en: 'Optional comment' })}
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSubmitReview} disabled={saving}>
              {t({ tr: 'Gönder', en: 'Submit' })}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCloseReview}>
              {t({ tr: 'Vazgeç', en: 'Cancel' })}
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
