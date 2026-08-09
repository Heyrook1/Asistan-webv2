'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  Heart,
  Leaf,
  Search,
  Smile,
  SlidersHorizontal,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react'

import { ClinicCard } from '@/components/client/clinic-card'
import { useLanguage } from '@/hooks/useLanguage'
import { productName } from '@/lib/brand/masterbrand'
import type { ClientDiscoveryItem } from '@/lib/client-marketplace/types'
import { getClinicTrialPath } from '@/lib/entry-routes'
import { cn } from '@/lib/utils'

/** Branş chips use `specialty=` (alias-expanded in discovery) — not free-text query. */
const CATEGORIES = [
  { label: { tr: 'Genel', en: 'General' }, specialty: 'genel', icon: Stethoscope },
  { label: { tr: 'Dermatoloji', en: 'Derm' }, specialty: 'dermatoloji', icon: Leaf },
  { label: { tr: 'Kardiyoloji', en: 'Cardio' }, specialty: 'kardiyoloji', icon: Heart },
  { label: { tr: 'Diş', en: 'Dental' }, specialty: 'diş', icon: Smile },
  { label: { tr: 'Fizyo', en: 'Physio' }, specialty: 'fizyo', icon: Building2 },
  { label: { tr: 'Estetik', en: 'Aesthetic' }, specialty: 'estetik', icon: ShieldCheck },
] as const

function featuredByClinic(items: ClientDiscoveryItem[] | null | undefined) {
  const list = Array.isArray(items) ? items : []
  const map = new Map<string, ClientDiscoveryItem>()
  for (const item of list) {
    const existing = map.get(item.businessId)
    if (!existing || (item.ratingAverage ?? 0) > (existing.ratingAverage ?? 0)) {
      map.set(item.businessId, item)
    }
  }
  return [...map.values()]
}

export function RezervasyonHomeHub({
  featured = [],
}: {
  featured?: ClientDiscoveryItem[] | null
}) {
  const router = useRouter()
  const { t, language } = useLanguage()
  const clinics = featuredByClinic(featured).slice(0, 6)
  const brand = productName('booking', language)

  function goSearch(specialty?: string) {
    const params = new URLSearchParams()
    if (specialty?.trim()) params.set('specialty', specialty.trim())
    const qs = params.toString()
    router.push(qs ? `/client/clinics?${qs}` : '/client/clinics')
  }

  return (
    <main data-rz-home className="space-y-8 pb-2">
      {/* First viewport: one composition — brand + atmosphere + one CTA group */}
      <section className="rz-enter relative -mx-4 overflow-hidden md:-mx-5">
        <div className="relative min-h-[min(58vh,420px)] w-full">
          <Image
            src="/images/rezervasyon-clinic-hero.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 480px"
            className="rz-hero-image object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/92 via-[#0B1F33]/45 to-[#0B1F33]/25"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_10%,rgba(0,113,227,0.28),transparent_60%)]"
          />

          <div className="relative flex min-h-[min(58vh,420px)] flex-col justify-end px-5 pb-6 pt-[calc(4.5rem+env(safe-area-inset-top))]">
            <p className="rz-enter font-heading text-[1.65rem] font-extrabold tracking-tight text-white sm:text-[1.85rem]">
              {brand}
            </p>
            <h1 className="rz-enter rz-enter-delay-1 mt-3 max-w-[14ch] font-heading text-[1.55rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[1.7rem]">
              {t({
                tr: 'Randevunuzu sakin bir şekilde alın',
                en: 'Book your visit with calm clarity',
              })}
            </h1>
            <p className="rz-enter rz-enter-delay-2 mt-2 max-w-[32ch] text-[13.5px] leading-relaxed text-white/82">
              {t({
                tr: 'Yakınınızdaki klinikler, gerçek müsaitlikle.',
                en: 'Nearby clinics with live availability.',
              })}
            </p>

            <div className="rz-enter rz-enter-delay-2 mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => goSearch()}
                className="rz-press flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0071E3] text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(0,113,227,0.35)]"
              >
                {t({ tr: 'Randevu al', en: 'Book now' })}
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goSearch()}
                className="rz-press flex h-12 w-full items-center gap-2.5 rounded-full bg-white/12 px-4 text-left ring-1 ring-white/25 backdrop-blur-md"
                aria-label={t({
                  tr: 'Doktor, klinik veya hizmet ara',
                  en: 'Search doctor, clinic or service',
                })}
              >
                <Search className="size-4 shrink-0 text-white/80" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[13px] text-white/75">
                  {t({
                    tr: 'Doktor, klinik veya hizmet ara…',
                    en: 'Search doctor, clinic or service…',
                  })}
                </span>
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
                  aria-hidden
                >
                  <SlidersHorizontal className="size-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rz-enter space-y-3">
        <p className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {t({ tr: 'Branşlar', en: 'Specialties' })}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.specialty}
                type="button"
                onClick={() => goSearch(cat.specialty)}
                className="rz-press inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 ring-1 ring-slate-200/90"
              >
                <Icon className="size-3.5 text-[#0071E3]" strokeWidth={1.9} aria-hidden />
                {t(cat.label)}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rz-enter space-y-3">
        <div className="flex items-end justify-between gap-3 px-0.5">
          <div>
            <h2 className="font-heading text-[1.15rem] font-extrabold tracking-tight text-slate-900">
              {t({ tr: 'Önerilen klinikler', en: 'Recommended clinics' })}
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              {t({
                tr: 'Puan ve müsaitliğe göre seçilmiş.',
                en: 'Chosen by rating and availability.',
              })}
            </p>
          </div>
          <Link
            href="/client/clinics"
            className="inline-flex items-center gap-0.5 pb-0.5 text-[12px] font-bold text-[#0071E3]"
          >
            {t({ tr: 'Tümü', en: 'All' })}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {clinics.length === 0 ? (
          <div className="px-1 py-10 text-center">
            <Building2 className="mx-auto size-8 text-slate-300" aria-hidden />
            <p className="mt-3 text-sm font-bold text-slate-900">
              {t({ tr: 'Henüz klinik yok', en: 'No clinics yet' })}
            </p>
            <p className="mt-1.5 text-sm text-slate-500">
              {t({
                tr: 'Arama yaparak uzman veya branş bulun.',
                en: 'Search by specialist or specialty.',
              })}
            </p>
            <button
              type="button"
              onClick={() => goSearch()}
              className="rz-press mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#0071E3] px-5 text-sm font-bold text-white"
            >
              {t({ tr: 'Uzman ara', en: 'Search' })}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {clinics.map((item) => (
              <ClinicCard key={item.businessId} item={item} />
            ))}
          </div>
        )}
      </section>

      <p className="px-0.5 text-center text-[12px] leading-relaxed text-slate-500">
        {t({
          tr: 'Klinik misiniz? Operasyon paneli Asistan Health.',
          en: 'Clinic? Operations run on Asistan Health.',
        })}{' '}
        <Link
          href={getClinicTrialPath(language)}
          className={cn('font-semibold text-[#0071E3] underline-offset-2 hover:underline')}
        >
          {t({ tr: 'Denemeyi başlat', en: 'Start trial' })}
        </Link>
      </p>
    </main>
  )
}
