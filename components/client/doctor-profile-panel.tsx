'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
} from 'lucide-react'

import { EmptyState, ErrorState, PatientCard, SectionHeader } from '@/components/client/ui'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

type DoctorService = {
  id: string
  name: string
  description: string | null
  durationMin: number
  price: number | null
  currency: string | null
}

type DoctorDetail = {
  id: string
  fullName: string
  specialty: string | null
  bio: string | null
  story: string
  clinic: {
    id: string
    name: string
    slug: string | null
    address: string | null
    city: string | null
  }
  services: DoctorService[]
  slots: Array<{ startTime: string; endTime: string }>
  reviews: { averageRating: number | null; reviewCount: number } | null
  verification: { level: 'verified' | 'partial' | 'unverified' | string; label: string }
  analytics: {
    completedAppointments: number
    uniquePatients: number
    activeServiceCount: number
    nextAvailableAt: string | null
    experienceSinceYear: number
  }
}

function formatPrice(price: number | null, currency: string | null) {
  if (price == null) return null
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺'
  return `${symbol}${price.toLocaleString()}`
}

export function DoctorProfilePanel({ doctorId }: { doctorId: string }) {
  const { t } = useLanguage()
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFailed(false)
    void (async () => {
      try {
        const res = await fetch(`/api/client/doctors/${doctorId}`)
        if (!res.ok) throw new Error(String(res.status))
        const body = (await res.json()) as { doctor: DoctorDetail }
        if (!cancelled) setDoctor(body.doctor)
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [doctorId])

  if (loading) {
    return (
      <div className="space-y-4 px-1 py-2" aria-busy="true">
        <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/70" />
      </div>
    )
  }

  if (failed || !doctor) {
    return (
      <div className="px-1 py-6">
        <ErrorState
          title={t({ tr: 'Doktor bilgisi yüklenemedi', en: 'We couldn’t load this doctor' })}
          description={t({
            tr: 'Bağlantınızı kontrol edip yeniden deneyin.',
            en: 'Check your connection and try again.',
          })}
          retryLabel={t({ tr: 'Yeniden dene', en: 'Try again' })}
          onRetry={() => location.reload()}
        />
      </div>
    )
  }

  const bookingHref = doctor.clinic.slug
    ? `/book/${doctor.clinic.slug}`
    : `/client/clinics/${doctor.clinic.id}`
  const price0 = doctor.services[0]
  const verified = doctor.verification.level === 'verified'
  const partial = doctor.verification.level === 'partial'

  return (
    <div className="space-y-5 px-0.5 pb-28">
      {/* Identity + trust */}
      <PatientCard>
        <div className="flex items-start gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--rz-blue-soft)] text-[var(--rz-blue)]">
            <Stethoscope className="size-7" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="rz-title truncate text-slate-900">{doctor.fullName}</h1>
            <p className="rz-secondary">{doctor.specialty ?? t({ tr: 'Genel sağlık', en: 'General health' })}</p>
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                verified
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : partial
                    ? 'bg-amber-50 text-amber-800 ring-amber-200'
                    : 'bg-slate-100 text-slate-600 ring-slate-200',
              )}
            >
              {verified ? <BadgeCheck className="size-3.5" aria-hidden /> : <ShieldCheck className="size-3.5" aria-hidden />}
              {doctor.verification.label}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate">
            {[doctor.clinic.name, doctor.clinic.city].filter(Boolean).join(' · ')}
          </span>
        </div>

        {doctor.reviews && doctor.reviews.reviewCount > 0 && doctor.reviews.averageRating != null ? (
          <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            {doctor.reviews.averageRating.toFixed(1)}
            <span className="text-slate-400">
              ({doctor.reviews.reviewCount} {t({ tr: 'değerlendirme', en: 'reviews' })})
            </span>
          </div>
        ) : null}
      </PatientCard>

      {/* Next availability */}
      <PatientCard>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-[var(--rz-blue)]" aria-hidden />
          <span className="rz-card-title text-slate-900">
            {t({ tr: 'En yakın müsaitlik', en: 'Next availability' })}
          </span>
        </div>
        {doctor.slots.length === 0 ? (
          <p className="rz-secondary mt-2">
            {t({
              tr: 'Bugün için uygun saat yok. Randevu ekranından diğer günlere bakın.',
              en: 'No open times today. Check other days on the booking screen.',
            })}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {doctor.slots.slice(0, 6).map((slot) => (
              <Link
                key={slot.startTime}
                href={bookingHref}
                className="inline-flex min-h-[40px] items-center rounded-full bg-[var(--rz-blue-soft)] px-3.5 text-sm font-semibold text-[var(--rz-blue)] transition hover:bg-[var(--rz-blue)] hover:text-white"
              >
                {slot.startTime}
              </Link>
            ))}
          </div>
        )}
      </PatientCard>

      {/* Services */}
      {doctor.services.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={t({ tr: 'Hizmetler', en: 'Services' })} />
          <div className="space-y-2.5">
            {doctor.services.map((service) => {
              const priceLabel = formatPrice(service.price, service.currency)
              return (
                <PatientCard key={service.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="rz-card-title truncate text-slate-900">{service.name}</p>
                      {service.description ? (
                        <p className="rz-secondary mt-0.5 line-clamp-2">{service.description}</p>
                      ) : null}
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="size-3.5" aria-hidden />
                        {service.durationMin} {t({ tr: 'dk', en: 'min' })}
                      </p>
                    </div>
                    {priceLabel ? (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-800">
                        {priceLabel}
                      </span>
                    ) : null}
                  </div>
                </PatientCard>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Story */}
      {doctor.story ? (
        <section className="space-y-2">
          <SectionHeader title={t({ tr: 'Hakkında', en: 'About' })} />
          <PatientCard>
            <p className="rz-body text-slate-700">{doctor.story}</p>
          </PatientCard>
        </section>
      ) : (
        <EmptyState
          title={t({ tr: 'Tanıtım bilgisi eklenmemiş', en: 'No bio added yet' })}
          description={t({
            tr: 'Klinik doktor tanıtımını eklediğinde burada görünür.',
            en: 'This appears once the clinic adds a doctor bio.',
          })}
        />
      )}

      {/* Sticky booking CTA */}
      <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 px-4">
        <div className="mx-auto max-w-[480px]">
          <Link
            href={bookingHref}
            className="rz-press flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--rz-blue)] text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(0,113,227,0.35)]"
          >
            {price0 ? t({ tr: 'Randevu al', en: 'Book appointment' }) : t({ tr: 'Müsaitliği gör', en: 'See availability' })}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}
