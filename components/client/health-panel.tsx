'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Fingerprint,
  HeartPulse,
  Loader2,
  LockKeyhole,
  MapPin,
  Pill,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { HealthTimeline } from '@/components/health-timeline/health-timeline'
import { Button } from '@/components/ui/button'
import { getAccessToken } from '@/lib/client-marketplace/client-fetch'
import { patientChromeName } from '@/lib/brand/masterbrand'
import { useLanguage } from '@/contexts/LanguageContext'
import type { HealthTimelineItem } from '@/lib/health-timeline/types'

type PassportClinic = {
  businessId: string
  name: string
  slug: string | null
  city: string | null
  patientNumber: string | null
}

type PassportPayload = {
  gpiDisplay: string | null
  personLinked: boolean
  fullName: string
  clinics: PassportClinic[]
  timeline: HealthTimelineItem[]
  counts?: { activeMedications: number; allergies: number; documents: number }
  honesty: { titleTr: string; disclaimerTr: string }
}

function PassportSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label={label}>
      <div className="overflow-hidden rounded-[1.75rem] bg-slate-200 p-5">
        <div className="h-5 w-36 animate-pulse rounded-full bg-white/70" />
        <div className="mt-8 h-7 w-48 animate-pulse rounded bg-white/80" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/60" />
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
      <div className="h-32 animate-pulse rounded-[1.4rem] bg-white ring-1 ring-slate-200/70" />
      <div className="h-40 animate-pulse rounded-[1.4rem] bg-white ring-1 ring-slate-200/70" />
    </div>
  )
}

function IntroFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck
  title: string
  description: string
}) {
  return (
    <li className="flex gap-3 rounded-[1.15rem] bg-slate-50/90 p-3.5 ring-1 ring-slate-200/70">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0071E3] shadow-sm ring-1 ring-slate-200/70">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div>
        <p className="text-[13px] font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
      </div>
    </li>
  )
}

function SectionHeading({ title, meta, id }: { title: string; meta?: string; id?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 id={id} className="font-heading text-[17px] font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      {meta ? (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
          {meta}
        </span>
      ) : null}
    </div>
  )
}

export function ClientHealthPanel() {
  const { language, t } = useLanguage()
  const [booting, setBooting] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [passport, setPassport] = useState<PassportPayload | null>(null)

  const load = useCallback(async () => {
    const token = await getAccessToken()
    if (!token) {
      setAuthed(false)
      setPassport(null)
      setLoadError(null)
      return
    }
    setAuthed(true)
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/client/passport', {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        setAuthed(false)
        setPassport(null)
        return
      }
      if (!res.ok) throw new Error('LOAD_FAILED')
      const json = (await res.json()) as { ok?: boolean; data?: PassportPayload }
      if (!json.data) throw new Error('LOAD_FAILED')
      setPassport(json.data)
    } catch {
      setPassport(null)
      setLoadError(
        t({
          tr: 'Pasaportunuz şu anda yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.',
          en: 'Your passport could not be loaded right now. Check your connection and try again.',
        }),
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void (async () => {
      setBooting(true)
      try {
        await load()
      } finally {
        setBooting(false)
      }
    })()
  }, [load])

  const visitCount = useMemo(
    () => passport?.timeline.filter((item) => item.kind === 'visit').length ?? 0,
    [passport?.timeline],
  )

  if (booting) {
    return (
      <main className="space-y-5">
        <PassportSkeleton label={t({ tr: 'Pasaport yükleniyor', en: 'Loading passport' })} />
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="space-y-5">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#06192F_0%,#0A3766_58%,#0071E3_125%)] px-5 py-5 text-white shadow-[0_24px_55px_-32px_rgba(0,72,140,0.8)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-16 size-48 rounded-full bg-sky-300/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 size-52 rounded-full bg-blue-400/15 blur-3xl"
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] text-sky-100 ring-1 ring-white/15 backdrop-blur-sm">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t({ tr: 'Kişisel sağlık özeti', en: 'Personal health summary' })}
            </div>

            <h1 className="mt-4 max-w-[19rem] font-heading text-[1.8rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
              {t({
                tr: 'Sağlık yolculuğunuz, tek bir özette.',
                en: 'Your health journey, in one clear summary.',
              })}
            </h1>
            <p className="mt-2.5 max-w-[22rem] text-[12px] leading-5 text-slate-200">
              {t({
                tr: 'Klinik üyeliklerinizi ve Asistan üzerinden gerçekleşen ziyaretlerinizi güvenli biçimde takip edin.',
                en: 'Follow your clinic memberships and visits made through Asistan in one secure place.',
              })}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5" aria-label={t({ tr: 'Pasaport kapsamı', en: 'Passport coverage' })}>
              <div className="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15 backdrop-blur-sm">
                <Building2 className="size-4 text-sky-200" aria-hidden />
                <p className="mt-2 text-sm font-extrabold">{t({ tr: 'Klinikleriniz', en: 'Your clinics' })}</p>
                <p className="mt-0.5 text-[10px] text-white/70">{t({ tr: 'Tek görünümde', en: 'In one view' })}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15 backdrop-blur-sm">
                <CalendarDays className="size-4 text-sky-200" aria-hidden />
                <p className="mt-2 text-sm font-extrabold">{t({ tr: 'Ziyaretleriniz', en: 'Your visits' })}</p>
                <p className="mt-0.5 text-[10px] text-white/70">{t({ tr: 'Tarih sırasıyla', en: 'In date order' })}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.4rem] bg-white p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)] ring-1 ring-slate-200/70">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <LockKeyhole className="size-[18px]" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {t({ tr: 'Yalnızca size ait', en: 'Private to you' })}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {t({
                  tr: 'Pasaportunuz hesabınızla açılır. Klinik notları, tahliller ve dosyalar bu özete dahil edilmez.',
                  en: 'Your passport opens with your account. Clinical notes, test results and files are not included.',
                })}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button
              asChild
              className="h-12 min-h-12 w-full rounded-2xl bg-[#0071E3] px-3 text-xs font-extrabold text-white shadow-[0_12px_24px_-16px_rgba(0,113,227,0.85)] hover:bg-[#0063C8]"
            >
              <Link href="/client/profile">
                {t({ tr: 'Pasaportumu aç', en: 'Open my passport' })}
                <ArrowRight className="ml-1.5 size-3.5" aria-hidden />
              </Link>
            </Button>
            <Link
              href="/client/clinics"
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-slate-50 px-3 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
            >
              <Search className="size-3.5 text-[#0071E3]" aria-hidden />
              {t({ tr: 'Klinik bul', en: 'Find a clinic' })}
            </Link>
          </div>
        </section>

        <section aria-labelledby="passport-benefits-title">
          <SectionHeading
            id="passport-benefits-title"
            title={t({ tr: 'Pasaportunuz ne sağlar?', en: 'What does your passport provide?' })}
          />
          <ul className="space-y-2.5">
            <IntroFeature
              icon={Building2}
              title={t({ tr: 'Klinik üyelikleri', en: 'Clinic memberships' })}
              description={t({
                tr: 'Bağlı olduğunuz klinikleri ve hasta numaralarınızı bir arada görün.',
                en: 'See your linked clinics and patient numbers together.',
              })}
            />
            <IntroFeature
              icon={CalendarDays}
              title={t({ tr: 'Ziyaret zaman çizelgesi', en: 'Visit timeline' })}
              description={t({
                tr: 'Randevu geçmişinizi klinikler arasında tarih sırasıyla takip edin.',
                en: 'Follow your appointment history across clinics in date order.',
              })}
            />
            <IntroFeature
              icon={Fingerprint}
              title={t({ tr: 'Tekil bağlantı kodu', en: 'Unique link code' })}
              description={t({
                tr: 'Kayıtlarınız sıralı bir tıbbi numara yerine opak bir kimlikle eşleştirilir.',
                en: 'Your records are matched with an opaque identity rather than a sequential medical number.',
              })}
            />
          </ul>
        </section>

        <div className="rounded-[1.15rem] bg-slate-100/80 px-4 py-3 text-[11px] leading-5 text-slate-600 ring-1 ring-slate-200/80">
          <span className="font-bold text-slate-800">
            {t({ tr: 'Şeffaflık notu: ', en: 'Transparency note: ' })}
          </span>
          {t({
            tr: 'Asistan Pasaportu bir FHIR kaydı, hastane EMR sistemi veya resmi tıbbi pasaport değildir.',
            en: 'Asistan Passport is not a FHIR record, hospital EMR system or official medical passport.',
          })}
        </div>
      </main>
    )
  }

  const title =
    language === 'tr'
      ? (passport?.honesty.titleTr ?? 'Asistan pasaportu')
      : 'Asistan passport'
  const disclaimer =
    language === 'tr'
      ? (passport?.honesty.disclaimerTr ??
        'Klinikler arası ziyaret özeti. Klinik notları ve tahliller paylaşılmaz.')
      : 'A cross-clinic visit summary. Clinical notes and test results are not shared.'

  return (
    <main className="space-y-5">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#06192F_0%,#0A3766_58%,#0071E3_125%)] px-5 py-5 text-white shadow-[0_24px_55px_-32px_rgba(0,72,140,0.8)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 size-48 rounded-full bg-sky-300/20 blur-3xl"
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-200">
                <HeartPulse className="size-4" aria-hidden />
                {patientChromeName(language)}
              </div>
              <h1 className="mt-2 font-heading text-[1.6rem] font-extrabold tracking-[-0.035em] text-white">
                {title}
              </h1>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1.5 text-[10px] font-bold text-emerald-100 ring-1 ring-emerald-300/25">
              <Check className="size-3" strokeWidth={3} aria-hidden />
              {passport?.personLinked
                ? t({ tr: 'Bağlı', en: 'Linked' })
                : t({ tr: 'Bekliyor', en: 'Pending' })}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
              {t({ tr: 'Pasaport sahibi', en: 'Passport holder' })}
            </p>
            <p className="mt-1 truncate text-lg font-extrabold text-white">
              {passport?.fullName || t({ tr: 'Asistan kullanıcısı', en: 'Asistan user' })}
            </p>
            {passport?.gpiDisplay ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-black/15 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-sky-100 ring-1 ring-white/10">
                <Fingerprint className="size-3.5" aria-hidden />
                {passport.gpiDisplay}
              </div>
            ) : (
              <Link
                href="/client/profile"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-sky-100 underline decoration-white/30 underline-offset-4"
              >
                {t({ tr: 'Kimlik bağlantısını tamamla', en: 'Complete identity link' })}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">
                {t({ tr: 'Klinikler', en: 'Clinics' })}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-white">{passport?.clinics.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">
                {t({ tr: 'Ziyaret kaydı', en: 'Visit records' })}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-white">{visitCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="passport-health-summary-title">
        <SectionHeading
          id="passport-health-summary-title"
          title={t({ tr: 'Sağlık Özeti', en: 'Health summary' })}
        />
        <ul className="grid grid-cols-3 gap-2.5">
          <li>
            <Link
              href="/client/health/medications"
              className="flex min-h-[72px] flex-col justify-center rounded-[1.25rem] bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-[#0071E3]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <Pill className="size-3.5 text-[#0071E3]" aria-hidden />
                {t({ tr: 'İlaçlar', en: 'Medications' })}
              </span>
              <span className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">
                {passport?.counts?.activeMedications ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">{t({ tr: 'aktif', en: 'active' })}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/client/health/allergies"
              className="flex min-h-[72px] flex-col justify-center rounded-[1.25rem] bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-[#0071E3]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <ShieldAlert className="size-3.5 text-[#0071E3]" aria-hidden />
                {t({ tr: 'Alerjiler', en: 'Allergies' })}
              </span>
              <span className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">
                {passport?.counts?.allergies ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">{t({ tr: 'kayıt', en: 'records' })}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/client/health/documents"
              className="flex min-h-[72px] flex-col justify-center rounded-[1.25rem] bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-[#0071E3]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <FileText className="size-3.5 text-[#0071E3]" aria-hidden />
                {t({ tr: 'Belgeler', en: 'Documents' })}
              </span>
              <span className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">
                {passport?.counts?.documents ?? 0}
              </span>
              <span className="text-[10px] text-slate-500">{t({ tr: 'dosya', en: 'files' })}</span>
            </Link>
          </li>
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-2.5" aria-label={t({ tr: 'Hızlı işlemler', en: 'Quick actions' })}>
        <Link
          href="/client/bookings"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white text-xs font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-[#0071E3]/30 active:scale-[0.99]"
        >
          <CalendarDays className="size-4 text-[#0071E3]" aria-hidden />
          {t({ tr: 'Randevularım', en: 'My bookings' })}
        </Link>
        <Link
          href="/client/clinics"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white text-xs font-extrabold text-slate-800 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-[#0071E3]/30 active:scale-[0.99]"
        >
          <Search className="size-4 text-[#0071E3]" aria-hidden />
          {t({ tr: 'Klinik bul', en: 'Find a clinic' })}
        </Link>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 ring-1 ring-red-200">
              <ShieldAlert className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">
                {t({ tr: 'Pasaport yüklenemedi', en: 'Passport could not be loaded' })}
              </p>
              <p className="mt-1 text-xs leading-5 text-red-800/90">{loadError}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-11 min-h-11 rounded-xl border-red-200 bg-white"
                disabled={loading}
                onClick={() => void load()}
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="mr-2 size-4" aria-hidden />
                )}
                {t({ tr: 'Yeniden dene', en: 'Try again' })}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {loading && !passport ? (
        <PassportSkeleton label={t({ tr: 'Pasaport yenileniyor', en: 'Refreshing passport' })} />
      ) : !loadError ? (
        <>
          <section aria-labelledby="passport-clinics-title">
            <SectionHeading
              id="passport-clinics-title"
              title={t({ tr: 'Kliniklerim', en: 'My clinics' })}
              meta={t({
                tr: `${passport?.clinics.length ?? 0} bağlantı`,
                en: `${passport?.clinics.length ?? 0} linked`,
              })}
            />
            {!passport?.clinics?.length ? (
              <div
                role="status"
                className="rounded-[1.35rem] border border-dashed border-slate-300 bg-white px-5 py-6 text-center shadow-sm"
              >
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Building2 className="size-5" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-extrabold text-slate-900">
                  {t({ tr: 'Henüz bağlı klinik yok', en: 'No linked clinics yet' })}
                </p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-600">
                  {t({
                    tr: 'İlk randevunuzdan sonra klinik bağlantınız burada görünür.',
                    en: 'Your clinic connection will appear here after your first booking.',
                  })}
                </p>
                <Button asChild className="mt-4 h-11 min-h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0063C8]">
                  <Link href="/client/clinics">
                    {t({ tr: 'Klinik bul', en: 'Find a clinic' })}
                    <ArrowRight className="ml-2 size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {passport.clinics.map((clinic) => (
                  <li key={clinic.businessId}>
                    <Link
                      href={clinic.slug ? `/book/${clinic.slug}` : '/client/clinics'}
                      className="group flex min-h-[72px] items-center gap-3 rounded-[1.25rem] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-[#0071E3]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] bg-[#0071E3]/10 text-[#0071E3]">
                        <Building2 className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-slate-900">{clinic.name}</p>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-slate-600">
                          {clinic.city ? (
                            <>
                              <MapPin className="size-3 shrink-0" aria-hidden />
                              <span className="truncate">{clinic.city}</span>
                            </>
                          ) : (
                            t({ tr: 'Bağlı klinik', en: 'Linked clinic' })
                          )}
                          {clinic.patientNumber ? (
                            <span className="shrink-0 text-slate-400">· No {clinic.patientNumber}</span>
                          ) : null}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#0071E3]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="passport-timeline-title">
            <SectionHeading
              id="passport-timeline-title"
              title={t({ tr: 'Ziyaret geçmişi', en: 'Visit history' })}
              meta={visitCount > 0 ? t({ tr: `${visitCount} kayıt`, en: `${visitCount} records` }) : undefined}
            />
            <p className="-mt-1 mb-3 text-xs leading-5 text-slate-600">
              {t({
                tr: 'Asistan üzerinden gerçekleşen ziyaretleriniz en yeniden eskiye sıralanır.',
                en: 'Visits made through Asistan are ordered from newest to oldest.',
              })}
            </p>
            <HealthTimeline
              items={passport?.timeline ?? []}
              variant="patient"
              locale={language}
              emptyTitle={t({ tr: 'Henüz ziyaret kaydı yok', en: 'No visits recorded yet' })}
              emptyDescription={t({
                tr: 'İlk randevunuzu alın; ziyaret geçmişiniz burada oluşmaya başlar.',
                en: 'Book your first appointment; your visit history will begin here.',
              })}
              emptyActionHref="/client/clinics"
              emptyActionLabel={t({ tr: 'Klinik bul', en: 'Find a clinic' })}
            />
          </section>
        </>
      ) : null}

      <section className="rounded-[1.25rem] bg-[#EDF5FF] p-4 ring-1 ring-[#0071E3]/10">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0071E3] shadow-sm">
            <ShieldCheck className="size-[18px]" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-extrabold text-slate-900">
              {t({ tr: 'Veri kapsamı açık ve sınırlı', en: 'Clear and limited data scope' })}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-600">{disclaimer}</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-[1.15rem] bg-white px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-200/70">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-[#0071E3]" aria-hidden />
          <span>{t({ tr: 'Randevularınızı kolayca yönetin.', en: 'Manage your bookings easily.' })}</span>
        </div>
        <Link href="/client/bookings" className="shrink-0 font-extrabold text-[#0071E3]">
          {t({ tr: 'Aç', en: 'Open' })}
        </Link>
      </div>
    </main>
  )
}
