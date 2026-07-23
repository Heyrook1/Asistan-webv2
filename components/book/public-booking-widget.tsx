'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Phone, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import type { PublicClinicBookingPayload } from '@/lib/public-booking/types'

type Slot = { startTime: string; endTime: string }
type Step = 1 | 2 | 3

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatPrice(price: number | null, currency: string) {
  if (price == null) return null
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function dayChipLabel(iso: string, lang: 'tr' | 'en' | 'ru') {
  const d = new Date(`${iso}T12:00:00`)
  const locale = lang === 'en' ? 'en-GB' : lang === 'ru' ? 'ru-RU' : 'tr-TR'
  if (iso === todayIso()) return lang === 'en' ? 'Today' : lang === 'ru' ? 'Сегодня' : 'Bugün'
  if (iso === addDaysIso(todayIso(), 1)) return lang === 'en' ? 'Tomorrow' : lang === 'ru' ? 'Завтра' : 'Yarın'
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatBookingWhen(date: string, time: string | null, lang: 'tr' | 'en' | 'ru') {
  if (!time) return date
  const d = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`)
  if (Number.isNaN(d.getTime())) return `${date} ${time}`
  const locale = lang === 'en' ? 'en-GB' : lang === 'ru' ? 'ru-RU' : 'tr-TR'
  return d.toLocaleString(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const DAY_CHIP_COUNT = 14

export function PublicBookingWidget({
  clinic,
  embed = false,
  initialServiceId = null,
  initialDoctorId = null,
  initialLocationId = null,
  initialDate = null,
  lang = 'tr',
}: {
  clinic: PublicClinicBookingPayload
  embed?: boolean
  initialServiceId?: string | null
  initialDoctorId?: string | null
  initialLocationId?: string | null
  initialDate?: string | null
  lang?: 'tr' | 'en' | 'ru'
}) {
  const stepLabels =
    lang === 'ru'
      ? (['Услуга', 'Когда?', 'Контакты'] as const)
      : lang === 'en'
        ? (['What for?', 'When?', 'Contact'] as const)
        : (['Ne için?', 'Ne zaman?', 'İletişim'] as const)

  const validInitialService =
    initialServiceId && clinic.services.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : clinic.services[0]?.id ?? null

  const [step, setStep] = useState<Step>(1)
  const [serviceId, setServiceId] = useState<string | null>(validInitialService)
  const [doctorId, setDoctorId] = useState<string | null>(initialDoctorId)
  const [locationId, setLocationId] = useState<string | null>(
    initialLocationId && clinic.locations.some((l) => l.id === initialLocationId)
      ? initialLocationId
      : clinic.locations[0]?.id ?? null,
  )
  const [date, setDate] = useState(
    initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) && initialDate >= todayIso()
      ? initialDate
      : todayIso(),
  )
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [slotsRetryToken, setSlotsRetryToken] = useState(0)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<{
    message: string
    appointmentId: string
    status: string
    intakeUrl?: string | null
    intakeFormName?: string | null
    summary?: {
      serviceName: string | null
      doctorName: string | null
      whenLabel: string
    }
    deposit?: {
      amount: number
      currency: string
      checkoutUrl: string | null
      instructions: string
    } | null
  } | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const idempotencyKeyRef = useRef(newIdempotencyKey())

  const dayChips = useMemo(
    () => Array.from({ length: DAY_CHIP_COUNT }, (_, i) => addDaysIso(todayIso(), i)),
    [],
  )

  // Product chrome always uses Asistan Rezervasyon blue — clinic.primaryColor
  // was painting teal CTAs next to the blue product label (renk uyuşmazlığı).
  const accent = '#0071E3'

  const doctorsForService = useMemo(() => {
    if (!serviceId) return clinic.doctors
    const assigned = clinic.doctors.filter((d) => d.serviceIds.includes(serviceId))
    const anyLinks = clinic.doctors.some((d) => d.serviceIds.length > 0)
    return anyLinks ? assigned : clinic.doctors
  }, [clinic.doctors, serviceId])

  const selectedService = clinic.services.find((s) => s.id === serviceId) ?? null
  const selectedDoctor = clinic.doctors.find((d) => d.id === doctorId) ?? null
  const showDoctorPicker = doctorsForService.length > 1

  useEffect(() => {
    if (doctorId && doctorsForService.some((d) => d.id === doctorId)) return
    const preferred =
      initialDoctorId && doctorsForService.some((d) => d.id === initialDoctorId)
        ? initialDoctorId
        : doctorsForService[0]?.id ?? null
    setDoctorId(preferred)
    setStartTime(null)
  }, [doctorId, doctorsForService, initialDoctorId])

  useEffect(() => {
    if (!serviceId || !doctorId || !date) {
      setSlots([])
      return
    }

    let cancelled = false
    setSlotsLoading(true)
    setSlotsError(null)
    const params = new URLSearchParams({
      businessId: clinic.id,
      doctorId,
      serviceId,
      date,
    })
    if (locationId) params.set('locationId', locationId)

    fetch(`/api/client/availability?${params.toString()}`)
      .then(async (res) => {
        const json = (await res.json()) as { slots?: Slot[]; error?: string }
        if (!res.ok) throw new Error(json.error || 'Müsait saat alınamadı')
        if (!cancelled) {
          setSlots(json.slots ?? [])
          setStartTime(null)
          setSlotsError(null)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSlots([])
          const msg = error instanceof Error ? error.message : 'Müsait saat alınamadı'
          setSlotsError(msg)
          toast.error(msg)
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [clinic.id, date, doctorId, locationId, serviceId, slotsRetryToken])

  function validateName(value: string) {
    const trimmed = value.trim()
    if (trimmed.length < 2) {
      setNameError(lang === 'en' ? 'Enter your full name' : 'Ad soyad gerekli')
      return false
    }
    setNameError(null)
    return true
  }

  function validatePhone(value: string) {
    const digits = value.replace(/\D/g, '')
    if (digits.length < 7) {
      setPhoneError(
        lang === 'en'
          ? 'Enter a valid phone (e.g. +90 5XX XXX XX XX)'
          : 'Geçerli telefon girin (+90 5XX XXX XX XX)',
      )
      return false
    }
    setPhoneError(null)
    return true
  }

  function submit() {
    if (!serviceId || !doctorId || !startTime) {
      const msg = 'Hizmet, doktor ve saat seçin'
      setSubmitError(msg)
      toast.error(msg)
      return
    }
    const nameOk = validateName(fullName)
    const phoneOk = validatePhone(phone)
    if (!nameOk || !phoneOk) return
    setSubmitError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/public/bookings', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'Idempotency-Key': idempotencyKeyRef.current,
          },
          body: JSON.stringify({
            businessId: clinic.id,
            doctorId,
            serviceId,
            locationId,
            date,
            startTime,
            fullName,
            phone,
            email: email.trim() || null,
            note: note.trim() || null,
          }),
        })
        const json = (await res.json()) as {
          ok?: boolean
          error?: string
          message?: string
          appointmentId?: string
          status?: string
          intakeUrl?: string | null
          intakeFormName?: string | null
          idempotentReplay?: boolean
          deposit?: {
            amount: number
            currency: string
            checkoutUrl: string | null
            instructions: string
          } | null
        }
        if (!res.ok || !json.ok || !json.appointmentId) {
          const msg = json.error || 'Randevu oluşturulamadı'
          setSubmitError(msg)
          toast.error(msg)
          idempotencyKeyRef.current = newIdempotencyKey()
          return
        }
        setSubmitError(null)
        setDone({
          message: json.message || 'Randevu alındı',
          appointmentId: json.appointmentId,
          status: json.status || 'SCHEDULED',
          intakeUrl: json.intakeUrl,
          intakeFormName: json.intakeFormName,
          summary: {
            serviceName: selectedService?.name ?? null,
            doctorName: selectedDoctor?.fullName ?? null,
            whenLabel: formatBookingWhen(date, startTime, lang),
          },
          deposit: json.deposit ?? null,
        })
      } catch {
        const msg = 'Ağ hatası — bağlantınızı kontrol edip tekrar deneyin'
        setSubmitError(msg)
        toast.error(msg)
        idempotencyKeyRef.current = newIdempotencyKey()
      }
    })
  }

  if (done) {
    return (
      <div className={embed ? 'p-3 sm:p-4' : 'mx-auto w-full max-w-xl px-4 py-8 sm:px-6'}>
        {!embed ? (
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Asistan Rezervasyon</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{clinic.name}</h1>
          </header>
        ) : null}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-3 py-4 text-center">
            <CheckCircle2 className="mx-auto size-12" style={{ color: accent }} />
            <h2 className="text-xl font-bold text-slate-900">
              {done.status === 'CONFIRMED'
                ? lang === 'en'
                  ? 'Appointment confirmed'
                  : 'Randevunuz onaylandı'
                : lang === 'en'
                  ? 'Request received'
                  : 'Talebiniz alındı'}
            </h2>
            <p className="text-sm text-slate-600">{done.message}</p>
            {done.summary ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700">
                {done.summary.serviceName ? (
                  <p>
                    <span className="font-semibold text-slate-900">
                      {lang === 'en' ? 'Service' : 'Hizmet'}:{' '}
                    </span>
                    {done.summary.serviceName}
                  </p>
                ) : null}
                {done.summary.doctorName ? (
                  <p className="mt-1">
                    <span className="font-semibold text-slate-900">
                      {lang === 'en' ? 'Doctor' : 'Doktor'}:{' '}
                    </span>
                    {done.summary.doctorName}
                  </p>
                ) : null}
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">
                    {lang === 'en' ? 'When' : 'Zaman'}:{' '}
                  </span>
                  {done.summary.whenLabel}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Ref: {done.appointmentId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Ref: {done.appointmentId.slice(0, 8)}</p>
            )}
            {done.deposit ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-left text-sm text-amber-950">
                <p className="font-semibold">
                  Depozito:{' '}
                  {formatPrice(done.deposit.amount, done.deposit.currency) ??
                    `${done.deposit.amount} ${done.deposit.currency}`}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-amber-900/90">
                  {done.deposit.instructions}
                </p>
                {done.deposit.checkoutUrl ? (
                  <Button asChild className="mt-3 h-11 w-full text-white" style={{ backgroundColor: accent }}>
                    <a href={done.deposit.checkoutUrl}>Depozitoyu öde</a>
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <Button asChild className="h-11 text-white" style={{ backgroundColor: accent }}>
                <a href="/client/clinics">Başka klinik bul</a>
              </Button>
              <Button asChild variant="outline" className="h-11">
                <a href={lang === 'en' ? '/en/login' : '/tr/giris'}>
                  {lang === 'en' ? 'Sign in to manage' : 'Giriş yap / kaydet'}
                </a>
              </Button>
            </div>
            <InstallPrompt
              className="mb-0 mt-2 text-left"
              delayMs={600}
              dismissKey="asistan-pwa-install-dismissed-post-book-v1"
              title={{
                tr: 'Randevularınız için uygulamayı yükleyin',
                en: 'Install the app for your bookings',
              }}
            />
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Confirmation stays on this page. Clinics may also send SMS/WhatsApp. Sign in if you want to manage bookings in your account.'
                : 'Onay bu sayfada kalır; klinik SMS/WhatsApp gönderebilir. Randevuları hesabınızdan yönetmek için giriş yapın.'}
            </p>
            {done.intakeUrl ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                <p className="text-sm font-semibold text-slate-900">
                  {done.intakeFormName || 'Ön kayıt formu'}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Muayene öncesi formu doldurarak klinik hazırlığını kolaylaştırın.
                </p>
                <Button asChild className="mt-3 w-full text-white" style={{ backgroundColor: accent }}>
                  <a href={done.intakeUrl}>Formu doldur</a>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className={embed ? 'p-3 sm:p-4' : 'mx-auto w-full max-w-xl px-4 py-8 sm:px-6'}>
        {!embed ? (
          <header className="mb-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0071E3]">Asistan Rezervasyon</p>
            <div className="flex items-start gap-3">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt="" className="size-12 rounded-2xl object-cover ring-1 ring-slate-900/5" />
              ) : (
                <div
                  className="flex size-12 items-center justify-center rounded-2xl text-lg font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {clinic.name.slice(0, 1)}
                </div>
              )}
              <div>
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">{clinic.name}</h1>
                <p className="text-sm text-slate-500">
                  {[clinic.city, clinic.address].filter(Boolean).join(' · ') || 'Online randevu'}
                </p>
              </div>
            </div>
          </header>
        ) : (
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2.5 rounded-full" style={{ backgroundColor: accent }} />
            <p className="text-sm font-semibold text-slate-900">{clinic.name}</p>
          </div>
        )}

      <div className="rounded-[1.5rem] bg-white/95 p-4 pb-24 ring-1 ring-slate-900/5 sm:p-6 sm:pb-6">
        <div className="mb-4" aria-label="Randevu adımları">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${((step - 1) / 2) * 100}%`, backgroundColor: accent }}
            />
          </div>
          <div className="flex items-center gap-2">
            {stepLabels.map((label, index) => {
              const n = (index + 1) as Step
              const active = step === n
              const complete = step > n
              const clickable = complete
              return (
                <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && setStep(n)}
                    className={`inline-flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                      complete
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : active
                          ? 'text-white'
                          : 'bg-slate-100 text-slate-400'
                    } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                    style={active ? { backgroundColor: accent } : undefined}
                    aria-current={active ? 'step' : undefined}
                    aria-label={`${n}. ${label}`}
                  >
                    {n}
                  </button>
                  <span className={`truncate text-xs font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Hizmet seçin</p>
            {clinic.services.length === 0 ? (
              <div
                role="status"
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center"
              >
                <Stethoscope className="mx-auto size-8 text-slate-400" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-slate-900">Online hizmet yok</p>
                <p className="mt-1 text-sm text-slate-600">
                  Bu klinik henüz randevu alınabilir hizmet yayınlamamış. Doğrudan klinik ile iletişime geçin.
                </p>
                {clinic.phone ? (
                  <Button asChild className="mt-4 h-11 min-h-11 w-full text-white sm:w-auto" style={{ backgroundColor: accent }}>
                    <a href={`tel:${clinic.phone.replace(/\s+/g, '')}`}>
                      <Phone className="mr-2 size-4" aria-hidden="true" />
                      Kliniği ara ({clinic.phone})
                    </a>
                  </Button>
                ) : clinic.address || clinic.city ? (
                  <p className="mt-3 text-xs text-slate-500">
                    {[clinic.address, clinic.city].filter(Boolean).join(', ')}
                  </p>
                ) : null}
              </div>
            ) : (
              clinic.services.map((service) => {
                const active = service.id === serviceId
                const price = formatPrice(service.price, clinic.currency)
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setServiceId(service.id)
                      setStartTime(null)
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      active ? 'border-transparent ring-2' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={active ? { boxShadow: `0 0 0 2px ${accent}` } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{service.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Clock3 className="size-3.5" />
                          {service.durationMin} dk
                        </p>
                      </div>
                      {price ? <span className="text-sm font-semibold text-slate-800">{price}</span> : null}
                    </div>
                  </button>
                )
              })
            )}

            {clinic.services.length > 0 && showDoctorPicker ? (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold text-slate-900">Doktor</p>
                {doctorsForService.length === 0 ? (
                  <div
                    role="status"
                    className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center"
                  >
                    <p className="text-sm font-semibold text-slate-900">Bu hizmet için doktor yok</p>
                    <p className="mt-1 text-sm text-slate-600">Başka bir hizmet seçin veya kliniği arayın.</p>
                    {clinic.phone ? (
                      <Button asChild variant="outline" className="mt-3 h-11 min-h-11">
                        <a href={`tel:${clinic.phone.replace(/\s+/g, '')}`}>
                          <Phone className="mr-2 size-4" aria-hidden="true" />
                          Kliniği ara
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  doctorsForService.map((doctor) => {
                    const active = doctor.id === doctorId
                    return (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => setDoctorId(doctor.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                          active ? 'border-transparent ring-2' : 'border-slate-200'
                        }`}
                        style={active ? { boxShadow: `0 0 0 2px ${accent}` } : undefined}
                      >
                        <Stethoscope className="size-4 shrink-0 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-900">{doctor.fullName}</p>
                          {doctor.specialty ? <p className="text-xs text-slate-500">{doctor.specialty}</p> : null}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            ) : clinic.services.length > 0 && selectedDoctor ? (
              <p className="text-xs text-slate-500">Doktor: {selectedDoctor.fullName}</p>
            ) : null}

            {clinic.services.length > 0 && clinic.locations.length > 1 ? (
              <div className="pt-1">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Şube</label>
                <select
                  aria-label="Şube"
                  className="h-11 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base"
                  value={locationId ?? ''}
                  onChange={(e) => setLocationId(e.target.value || null)}
                >
                  {clinic.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {clinic.services.length > 0 ? (
              <div className="hidden justify-end pt-2 sm:flex">
                <Button
                  type="button"
                  disabled={!serviceId || !doctorId}
                  className="h-11 min-h-11 min-w-[7.5rem] text-white"
                  style={{ backgroundColor: accent }}
                  onClick={() => setStep(2)}
                >
                  Devam
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-900">Tarih ve saat</p>
            <p className="text-xs text-slate-500">
              {selectedService?.name}
              {selectedDoctor ? ` · ${selectedDoctor.fullName}` : ''}
            </p>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">Gün seçin</p>
              <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                role="listbox"
                aria-label={lang === 'en' ? 'Pick a day' : 'Gün seçin'}
              >
                {dayChips.map((iso) => {
                  const active = date === iso
                  return (
                    <button
                      key={iso}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setDate(iso)}
                      className={`inline-flex h-11 min-h-11 shrink-0 items-center justify-center rounded-xl border px-3 text-sm font-semibold ${
                        active ? 'text-white' : 'border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                      style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                    >
                      {dayChipLabel(iso, lang)}
                    </button>
                  )
                })}
              </div>
              <label className="mb-1.5 mt-3 block text-xs font-medium text-slate-500" htmlFor="book-date">
                {lang === 'en' ? 'Or pick a date' : 'Veya takvimden seçin'}
              </label>
              <Input
                id="book-date"
                type="date"
                min={todayIso()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 min-h-11 text-base md:text-sm"
              />
            </div>

            {slotsLoading ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true" aria-label="Saatler yükleniyor">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-11 min-h-11 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : slotsError ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-5 text-center"
              >
                <p className="text-sm font-semibold text-red-900">{slotsError}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-11 min-h-11"
                  onClick={() => setSlotsRetryToken((n) => n + 1)}
                >
                  Tekrar dene
                </Button>
              </div>
            ) : slots.length === 0 ? (
              <div
                role="status"
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {lang === 'en' ? 'No open slots this day' : 'Bu gün için açık slot yok'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {lang === 'en' ? 'Try tomorrow or call the clinic.' : 'Yarını deneyin veya kliniği arayın.'}
                </p>
                <div className="mt-3 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    className="h-11 min-h-11 text-white"
                    style={{ backgroundColor: accent }}
                    onClick={() => setDate(addDaysIso(date, 1))}
                  >
                    {lang === 'en' ? 'Try tomorrow' : 'Yarını dene'}
                  </Button>
                  {clinic.phone ? (
                    <Button asChild variant="outline" className="h-11 min-h-11">
                      <a href={`tel:${clinic.phone.replace(/\s+/g, '')}`}>
                        <Phone className="mr-2 size-4" aria-hidden="true" />
                        {lang === 'en' ? 'Call clinic' : 'Kliniği ara'}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="listbox" aria-label="Uygun saatler">
                {slots.map((slot) => {
                  const active = startTime === slot.startTime
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setStartTime(slot.startTime)}
                      className={`flex h-11 min-h-11 items-center justify-center rounded-xl border px-2 text-base font-semibold ${
                        active ? 'text-white' : 'border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                      style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
                    >
                      {slot.startTime}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="hidden justify-between pt-1 sm:flex">
              <Button type="button" variant="ghost" className="h-11 min-h-11" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 size-4" />
                Geri
              </Button>
              <Button
                type="button"
                disabled={!startTime}
                className="h-11 min-h-11 min-w-[7.5rem] text-white"
                style={{ backgroundColor: accent }}
                onClick={() => setStep(3)}
              >
                Devam
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">İletişim ve onay</p>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {selectedService?.name}
              {selectedDoctor ? ` · ${selectedDoctor.fullName}` : ''} ·{' '}
              {formatBookingWhen(date, startTime, lang)}
            </p>
            {(clinic.deposit.enabled && clinic.deposit.amount) || clinic.noShowFee.enabled ? (
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
                {clinic.deposit.enabled && clinic.deposit.amount ? (
                  <p>
                    <span className="font-semibold text-slate-800">Depozito: </span>
                    {formatPrice(clinic.deposit.amount, clinic.currency) ??
                      `${clinic.deposit.amount} ${clinic.currency}`}{' '}
                    (randevu sonrası)
                  </p>
                ) : null}
                {clinic.noShowFee.enabled ? (
                  <p>
                    <span className="font-semibold text-slate-800">Gelinmedi ücreti: </span>
                    {clinic.noShowFee.amount != null
                      ? formatPrice(clinic.noShowFee.amount, clinic.currency) ??
                        `${clinic.noShowFee.amount} ${clinic.currency}`
                      : 'Klinik politikası'}
                    {clinic.noShowFee.note ? ` — ${clinic.noShowFee.note}` : ''}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500" htmlFor="book-full-name">
                Ad soyad *
              </label>
              <Input
                id="book-full-name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                onBlur={() => {
                  if (fullName.trim()) validateName(fullName)
                }}
                autoComplete="name"
                placeholder={lang === 'en' ? 'Ayşe Yılmaz' : 'Ayşe Yılmaz'}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? 'book-full-name-error' : undefined}
                className="h-11 min-h-11 text-base md:text-sm"
              />
              {nameError ? (
                <p id="book-full-name-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {nameError}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500" htmlFor="book-phone">
                Telefon *
              </label>
              <Input
                id="book-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (phoneError) setPhoneError(null)
                }}
                onBlur={() => {
                  if (phone.trim()) validatePhone(phone)
                }}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+90 5XX XXX XX XX"
                aria-invalid={phoneError ? true : undefined}
                aria-describedby={phoneError ? 'book-phone-error' : 'book-phone-hint'}
                className="h-11 min-h-11 text-base md:text-sm"
              />
              {phoneError ? (
                <p id="book-phone-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {phoneError}
                </p>
              ) : (
                <p id="book-phone-hint" className="mt-1 text-xs text-slate-500">
                  {lang === 'en'
                    ? 'We may send confirmation by SMS / WhatsApp.'
                    : 'Onay SMS / WhatsApp ile gelebilir.'}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500" htmlFor="book-email">
                E-posta
              </label>
              <Input
                id="book-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11 min-h-11 text-base md:text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500" htmlFor="book-note">
                Not
              </label>
              <Textarea
                id="book-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-base md:text-sm"
              />
            </div>
            <p className="text-xs text-slate-500">
              {clinic.autoConfirmClientAppointments
                ? 'Randevu gönderildiğinde otomatik onaylanır.'
                : 'Klinik onayı sonrası randevunuz kesinleşir.'}
            </p>
            {submitError ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"
              >
                <p>{submitError}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 h-11 min-h-11"
                  disabled={pending}
                  onClick={submit}
                >
                  Tekrar dene
                </Button>
              </div>
            ) : null}
            <div className="hidden justify-between pt-1 sm:flex">
              <Button
                type="button"
                variant="ghost"
                className="h-11 min-h-11"
                onClick={() => {
                  setSubmitError(null)
                  setStep(2)
                }}
              >
                <ChevronLeft className="mr-1 size-4" />
                Geri
              </Button>
              <Button
                type="button"
                disabled={pending || fullName.trim().length < 2 || phone.trim().length < 7}
                className="h-11 min-h-11 text-white"
                style={{ backgroundColor: accent }}
                onClick={submit}
              >
                {pending ? 'Gönderiliyor…' : 'Randevu talep et'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA — Jane-style persistent primary (skip embed iframes) */}
      {!embed && clinic.services.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 min-h-11 shrink-0"
                onClick={() => {
                  setSubmitError(null)
                  setStep((s) => (s === 3 ? 2 : 1) as Step)
                }}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Geri</span>
              </Button>
            ) : null}
            <div className="min-w-0 flex-1">
              {step === 1 ? (
                <Button
                  type="button"
                  disabled={!serviceId || !doctorId}
                  className="h-11 min-h-11 w-full text-white"
                  style={{ backgroundColor: accent }}
                  onClick={() => setStep(2)}
                >
                  Devam
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              ) : step === 2 ? (
                <Button
                  type="button"
                  disabled={!startTime}
                  className="h-11 min-h-11 w-full text-white"
                  style={{ backgroundColor: accent }}
                  onClick={() => setStep(3)}
                >
                  {startTime ? `Devam · ${startTime}` : 'Saat seçin'}
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={pending || fullName.trim().length < 2 || phone.trim().length < 7}
                  className="h-11 min-h-11 w-full text-white"
                  style={{ backgroundColor: accent }}
                  onClick={submit}
                >
                  {pending ? 'Gönderiliyor…' : 'Randevu talep et'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {!embed ? (
        <p className="mt-6 text-center text-xs text-slate-500">
          Powered by <span className="font-semibold text-slate-700">Asistan</span>
        </p>
      ) : null}
    </div>
  )
}
