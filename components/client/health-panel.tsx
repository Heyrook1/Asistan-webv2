'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Fingerprint, HeartPulse, Loader2, RefreshCw, ShieldAlert } from 'lucide-react'

import { HealthTimeline } from '@/components/health-timeline/health-timeline'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
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
  honesty: { titleTr: string; disclaimerTr: string }
}

async function getAccessToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

function PassportSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label={label}>
      <div className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200/70">
        <div className="flex items-start gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-xl bg-slate-200/80" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/80" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200/80" />
        <div className="h-14 animate-pulse rounded-[1.15rem] bg-slate-100" />
        <div className="h-14 animate-pulse rounded-[1.15rem] bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200/80" />
        <div className="h-24 animate-pulse rounded-[1.15rem] bg-slate-100" />
      </div>
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
          tr: 'Asistan pasaportu yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.',
          en: 'Could not load your Asistan passport. Check your connection and try again.',
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

  if (booting) {
    return (
      <main className="space-y-5">
        <header>
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200/80" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded bg-slate-200/80" />
          <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
        </header>
        <PassportSkeleton label={t({ tr: 'Pasaport yükleniyor', en: 'Loading passport' })} />
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="space-y-5">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]">
            {patientChromeName(language)}
          </p>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">
            {t({ tr: 'Asistan pasaportu', en: 'Asistan passport' })}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t({
              tr: 'Klinikler arası ziyaret ve üyelik özeti — giriş sonrası açılır. Klinik notları ve tahliller burada yoktur.',
              en: 'A cross-clinic summary of your visits and memberships — available after signing in. Clinical notes and test results are not shown here.',
            })}
          </p>
        </header>

        <section
          className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200/70"
          aria-label={t({ tr: 'Nasıl çalışır', en: 'How it works' })}
        >
          <h2 className="text-sm font-bold text-slate-900">
            {t({ tr: 'Nasıl çalışır?', en: 'How does it work?' })}
          </h2>
          <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-slate-600">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0071E3]/10 text-[11px] font-bold text-[#0071E3]">
                1
              </span>
              <span>
                {t({
                  tr: 'Klinik bulun ve randevu alın — hesap zorunlu değil; misafir randevu da olur.',
                  en: 'Find a clinic and book — no account needed; guest bookings work too.',
                })}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0071E3]/10 text-[11px] font-bold text-[#0071E3]">
                2
              </span>
              <span>
                {t({
                  tr: 'Aynı e-posta ile giriş yapın — misafir randevular hesabınıza bağlanır.',
                  en: 'Sign in with the same email — guest bookings are linked to your account.',
                })}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0071E3]/10 text-[11px] font-bold text-[#0071E3]">
                3
              </span>
              <span>
                {t({
                  tr: 'Pasaportta klinik üyelikleri ve ziyaret zaman çizelgeniz görünür.',
                  en: 'Your passport shows clinic memberships and your visit timeline.',
                })}
              </span>
            </li>
          </ol>
        </section>

        <div className="space-y-3">
          <Button
            asChild
            className="h-11 min-h-11 w-full rounded-full bg-[#0071E3] font-bold text-white hover:bg-[#0077ed]"
          >
            <Link href="/client/clinics">
              {t({ tr: 'Klinik bul — şimdi randevu al', en: 'Find a clinic — book now' })}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 min-h-11 w-full rounded-full">
            <Link href="/client/profile">
              {t({ tr: 'Giriş yap — pasaportumu aç', en: 'Sign in — open my passport' })}
            </Link>
          </Button>
        </div>

        <div className="rounded-[1.15rem] bg-slate-50 px-4 py-3 text-[12px] leading-relaxed text-slate-500 ring-1 ring-slate-200/80">
          {t({
            tr: 'FHIR / tıbbi pasaport veya hastane EMR değildir. Yalnızca Asistan üzerindeki ziyaret özeti.',
            en: 'This is not a FHIR / medical passport or a hospital EMR. It is only a summary of visits made through Asistan.',
          })}
        </div>
      </main>
    )
  }

  // The passport API only ships Turkish honesty copy (`titleTr` / `disclaimerTr`).
  // Rather than print Turkish inside an English page, fall back to local copy in
  // EN. Serving both languages from the API would let this use the payload again.
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
      <header>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#0071E3]/12 text-[#0071E3]">
            <HeartPulse className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]">
              {patientChromeName('tr')}
            </p>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">{disclaimer}</p>
      </header>

      {loadError ? (
        <div
          role="alert"
          className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {t({ tr: 'Pasaport yüklenemedi', en: 'Passport could not be loaded' })}
              </p>
              <p className="mt-1 text-red-800/90">{loadError}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-11 min-h-11 border-red-200 bg-white"
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
          <section
            className="rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200/70"
            aria-label={t({ tr: 'Kimlik özeti', en: 'Identity summary' })}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Fingerprint className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{passport?.fullName}</p>
                {passport?.gpiDisplay ? (
                  <p className="mt-1 font-mono text-[13px] tracking-wide text-[#0071E3]">
                    {passport.gpiDisplay}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    {t({
                      tr: 'GPI henüz bağlanmadı — profilde telefon veya e-posta ekleyin.',
                      en: 'GPI is not linked yet — add a phone number or email in your profile.',
                    })}
                  </p>
                )}
                <p className="mt-2 text-[11px] leading-4 text-slate-400">
                  {t({
                    tr: 'Opak kimlik kodu · sıralı tıbbi numara değildir',
                    en: 'Opaque identity code · not a sequential medical number',
                  })}
                </p>
              </div>
            </div>
          </section>

          <section aria-label={t({ tr: 'Klinik üyelikleri', en: 'Clinic memberships' })}>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              {t({ tr: 'Kliniklerim', en: 'My clinics' })}
            </h2>
            {!passport?.clinics?.length ? (
              <div
                role="status"
                className="rounded-[1.15rem] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center"
              >
                <Building2 className="mx-auto size-7 text-slate-400" aria-hidden />
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {t({ tr: 'Henüz bağlı klinik yok', en: 'No linked clinics yet' })}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {t({
                    tr: 'Klinik bulun ve randevu alın; üyelikleriniz burada listelenir.',
                    en: 'Find a clinic and book an appointment; your memberships will be listed here.',
                  })}
                </p>
                <Button asChild className="mt-3 h-11 min-h-11 bg-[#0071E3] text-white hover:bg-[#0077ed]">
                  <Link href="/client/clinics">{t({ tr: 'Klinik bul', en: 'Find a clinic' })}</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {passport.clinics.map((c) => (
                  <li key={c.businessId}>
                    <Link
                      href={c.slug ? `/book/${c.slug}` : '/client/clinics'}
                      className="flex items-center gap-3 rounded-[1.15rem] bg-white px-4 py-3 ring-1 ring-slate-200/70 transition hover:ring-[#0071E3]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                    >
                      <Building2 className="size-4 shrink-0 text-[#0071E3]" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {[c.city, c.patientNumber ? `No: ${c.patientNumber}` : null]
                            .filter(Boolean)
                            .join(' · ') || t({ tr: 'Üyelik', en: 'Membership' })}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label={t({ tr: 'Ziyaret zaman çizelgesi', en: 'Visit timeline' })}>
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              {t({ tr: 'Ziyaretler', en: 'Visits' })}
            </h2>
            <HealthTimeline
              items={passport?.timeline ?? []}
              variant="patient"
              locale={language}
              emptyTitle={t({ tr: 'Henüz ziyaret kaydı yok', en: 'No visits recorded yet' })}
              emptyDescription={t({
                tr: 'İlk randevunuzu alın; klinikler arası ziyaret geçmişiniz burada birikir.',
                en: 'Book your first appointment; your cross-clinic visit history will build up here.',
              })}
              emptyActionHref="/client/clinics"
              emptyActionLabel={t({ tr: 'Klinik bul', en: 'Find a clinic' })}
            />
          </section>
        </>
      ) : null}

      <div className="rounded-[1.15rem] bg-white px-4 py-3 text-xs leading-5 text-slate-500 ring-1 ring-slate-200/70">
        {t({
          tr: 'Yönetim, iptal ve yeniden planlama için ',
          en: 'To manage, cancel or reschedule, use the ',
        })}
        <Link href="/client/bookings" className="font-semibold text-[#0071E3]">
          {t({ tr: 'Randevular', en: 'Appointments' })}
        </Link>
        {t({ tr: ' sekmesini kullanın.', en: ' tab.' })}
      </div>
    </main>
  )
}
