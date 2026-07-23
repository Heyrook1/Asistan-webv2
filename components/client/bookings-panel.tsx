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
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Onay bekliyor',
  CONFIRMED: 'Onaylandı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  NO_SHOW: 'Gelinmedi',
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

function nextStepCopy(status: AppointmentStatus) {
  switch (status) {
    case 'SCHEDULED':
      return 'Klinik onayı bekleniyor. Onaylanınca bildirim alırsınız.'
    case 'CONFIRMED':
      return 'Randevunuz onaylandı. Zamanı gelince hatırlatma gönderilir.'
    case 'COMPLETED':
      return 'Ziyaret tamamlandı. Deneyiminizi puanlayabilirsiniz.'
    case 'CANCELLED':
      return 'Bu randevu iptal edildi. Yeni bir saat seçebilirsiniz.'
    case 'NO_SHOW':
      return 'Bu randevu gelinmedi olarak işaretlendi.'
  }
}

async function getAccessToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function clientFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
    throw new Error((body as { error?: string }).error ?? 'İstek başarısız')
  }
  return body as T
}

export function ClientBookingsPanel() {
  const searchParams = useSearchParams()
  const focusId = searchParams.get('id')

  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const [showPast, setShowPast] = useState(false)

  const load = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setLoading(true)
    try {
      const data = await clientFetch<{ appointments: AppointmentRow[] }>('/api/client/appointments')
      setRows(data.appointments)
      setAuthRequired(false)
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        setAuthRequired(true)
        setRows([])
      } else if (!opts?.quiet) {
        toast.error(error instanceof Error ? error.message : 'Randevular yüklenemedi')
      }
    } finally {
      if (!opts?.quiet) setLoading(false)
    }
  }, [])

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
    () => rows.filter((row) => isActive(row.status)),
    [rows]
  )
  const past = useMemo(
    () => rows.filter((row) => !isActive(row.status)),
    [rows]
  )

  async function cancelAppointment(id: string) {
    setSavingId(id)
    try {
      await clientFetch(`/api/client/appointments/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      toast.success('Randevu iptal edildi')
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İptal başarısız')
    } finally {
      setSavingId(null)
    }
  }

  async function openReschedule(row: AppointmentRow) {
    setRescheduleId(row.id)
    setRescheduleDate(row.date)
    setSelectedSlot(null)
    setSlots([])
    setSlotsLoading(true)
    try {
      if (!row.doctorId) {
        toast.error('Bu randevu için hekim bilgisi eksik')
        return
      }
      const params = new URLSearchParams({
        doctorId: row.doctorId,
        serviceId: row.serviceId,
        businessId: row.businessId,
        date: row.date,
      })
      if (row.locationId) params.set('locationId', row.locationId)
      const data = await fetch(`/api/client/availability?${params}`).then((r) => r.json())
      setSlots((data.slots as Slot[]) ?? [])
    } catch {
      toast.error('Uygun saatler yüklenemedi')
    } finally {
      setSlotsLoading(false)
    }
  }

  async function loadSlotsForDate(row: AppointmentRow, date: string) {
    if (!row.doctorId) return
    setRescheduleDate(date)
    setSelectedSlot(null)
    setSlotsLoading(true)
    try {
      const params = new URLSearchParams({
        doctorId: row.doctorId,
        serviceId: row.serviceId,
        businessId: row.businessId,
        date,
      })
      if (row.locationId) params.set('locationId', row.locationId)
      const data = await fetch(`/api/client/availability?${params}`).then((r) => r.json())
      setSlots((data.slots as Slot[]) ?? [])
    } catch {
      toast.error('Uygun saatler yüklenemedi')
    } finally {
      setSlotsLoading(false)
    }
  }

  async function submitReschedule(id: string) {
    if (!rescheduleDate || !selectedSlot) {
      toast.error('Tarih ve saat seçin')
      return
    }
    setSavingId(id)
    try {
      await clientFetch(`/api/client/appointments/${id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ date: rescheduleDate, startTime: selectedSlot }),
      })
      toast.success('Randevu yeniden planlandı')
      setRescheduleId(null)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yeniden planlama başarısız')
    } finally {
      setSavingId(null)
    }
  }

  async function submitReview(id: string) {
    setSavingId(id)
    try {
      await clientFetch('/api/client/reviews', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: id, rating, comment: comment.trim() || undefined }),
      })
      toast.success('Yorumunuz kaydedildi')
      setReviewId(null)
      setComment('')
      setRating(5)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yorum kaydedilemedi')
    } finally {
      setSavingId(null)
    }
  }

  if (authRequired) {
    return (
      <main className="space-y-5">
        <header className="space-y-1">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight text-slate-900">
            Randevularım
          </h1>
          <p className="text-[13px] text-slate-500">
            Kayıtlı randevularınızı görmek, iptal veya yeniden planlamak için giriş yapın.
          </p>
        </header>
        <div className="rounded-[1.25rem] bg-white p-5 ring-1 ring-slate-200/70">
          <p className="text-sm text-slate-600">
            Misafir olarak klinik sayfasından randevu alabilirsiniz. Takip için{' '}
            <span className="font-semibold text-slate-900">Asistan Rezervasyon</span> hesabı gerekir.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
              <Link href="/client/profile">Giriş / kayıt</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link href="/client/clinics">Hesapsız klinik bul</Link>
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
            Randevularım
          </h1>
          <p className="text-[13px] text-slate-500">
            Onay, iptal, yeniden planlama ve değerlendirme burada.
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
          <Link href="/client/clinics">Yeni randevu</Link>
        </Button>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Randevular yükleniyor…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[1.25rem] bg-white p-6 ring-1 ring-slate-200/70">
          <p className="text-sm font-semibold text-slate-900">Henüz randevunuz yok</p>
          <p className="mt-1 text-sm text-slate-500">
            Klinik keşfedin veya bildiğiniz klinik linkinden 3 adımda talep oluşturun.
          </p>
          <div className="mt-4">
            <Button asChild className="h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
              <Link href="/client/clinics">Klinik ara</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Yaklaşan ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Yaklaşan randevu yok.</p>
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
                  onCancel={() => void cancelAppointment(row.id)}
                  onOpenReschedule={() => void openReschedule(row)}
                  onDateChange={(date) => void loadSlotsForDate(row, date)}
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
                Geçmiş ({past.length})
              </h2>
              {past.length > 3 ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#0071E3] hover:underline"
                  onClick={() => setShowPast((value) => !value)}
                >
                  {showPast ? 'Daralt' : 'Tümünü göster'}
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
                Boylamsal ziyaret görünümü için{' '}
                <span className="font-semibold text-[#0071E3]">Sağlık zaman çizelgesi</span>
              </Link>
            ) : null}
          </section>
        </>
      )}
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
          {STATUS_LABELS[row.status]}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">{nextStepCopy(row.status)}</p>

      {isActive(row.status) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={onOpenReschedule}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Yeniden planla
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={onCancel}
            className="gap-1.5 text-rose-700 hover:text-rose-800"
          >
            <XCircle className="h-3.5 w-3.5" />
            İptal et
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
                if (!response.ok) throw new Error('Takvim dosyası alınamadı')
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const anchor = document.createElement('a')
                anchor.href = url
                anchor.download = `asistan-randevu-${row.id.slice(0, 8)}.ics`
                anchor.click()
                URL.revokeObjectURL(url)
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Takvim dosyası alınamadı')
              }
            }}
          >
            Takvime ekle
          </Button>
        </div>
      ) : null}

      {row.status === 'COMPLETED' && !row.hasReview ? (
        <div className="mt-4">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onOpenReview} disabled={saving}>
            <Star className="h-3.5 w-3.5" />
            Değerlendir
          </Button>
        </div>
      ) : null}

      {row.clinic.slug ? (
        <div className="mt-3">
          <Button asChild size="sm" variant="ghost" className="h-9 px-0 text-[#0071E3]">
            <Link
              href={`/book/${row.clinic.slug}${row.doctorId ? `?doctorId=${encodeURIComponent(row.doctorId)}` : ''}${row.serviceId ? `${row.doctorId ? '&' : '?'}serviceId=${encodeURIComponent(row.serviceId)}` : ''}`}
            >
              Bu klinikten yeni randevu
            </Link>
          </Button>
        </div>
      ) : null}

      {row.status === 'COMPLETED' && row.hasReview ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Değerlendirme gönderildi
        </p>
      ) : null}

      {rescheduleOpen ? (
        <div className="mt-4 space-y-3 rounded-xl border bg-slate-50/80 p-3">
          <Input
            type="date"
            value={rescheduleDate}
            onChange={(e) => onDateChange?.(e.target.value)}
          />
          {slotsLoading ? (
            <p className="text-xs text-muted-foreground">Saatler yükleniyor…</p>
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
                <p className="text-xs text-muted-foreground">Bu tarihte uygun saat yok.</p>
              ) : null}
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={onSubmitReschedule} disabled={saving || !selectedSlot}>
              Kaydet
            </Button>
            <Button size="sm" variant="ghost" onClick={onCloseReschedule}>
              Vazgeç
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
                aria-label={`${value} yıldız`}
              >
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => onCommentChange?.(e.target.value)}
            placeholder="İsteğe bağlı yorum"
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSubmitReview} disabled={saving}>
              Gönder
            </Button>
            <Button size="sm" variant="ghost" onClick={onCloseReview}>
              Vazgeç
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
