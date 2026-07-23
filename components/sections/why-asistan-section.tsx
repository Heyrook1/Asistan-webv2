'use client'

import Link from 'next/link'
import { Fingerprint, MapPinned, ShieldOff } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'

/**
 * Matrix differentiator strip — Person + KKTC + honest boundary.
 * Placed immediately after hero (before MobileAppShowcase).
 */
export function WhyAsistanSection() {
  const { t, language } = useLanguage()
  const passport = getClaim('asistan-passport', language)

  const beats = [
    {
      icon: Fingerprint,
      title: t({
        tr: 'Person kimliği',
        en: 'Person identity',
      }),
      body: t({
        tr: 'Hasta kliniklerde Person ile bağlanır; her klinik kendi üyelik kartını görür. Aynı kişi, dağınık defter yok.',
        en: 'Patients link across clinics via Person; each clinic keeps its membership chart. One person, no scattered notebooks.',
      }),
    },
    {
      icon: MapPinned,
      title: t({
        tr: 'KKTC poliklinik odağı',
        en: 'Northern Cyprus outpatient focus',
      }),
      body: t({
        tr: 'Diş, fizyo, estetik ve küçük çok-hekim merkezler için operasyon paneli — hastane HIS değil.',
        en: 'Ops panel for dental, physio, aesthetics, and small multi-clinician centres — not hospital HIS.',
      }),
    },
    {
      icon: ShieldOff,
      title: t({
        tr: 'Dürüst sınır',
        en: 'Honest boundary',
      }),
      body: t({
        tr: 'Hastane HIS, resmi e-reçete ağı veya telehealth iddiası yok. Kanıt yoksa iddia yok.',
        en: 'No hospital HIS, official e-prescription network, or telehealth claims. No proof, no claim.',
      }),
    },
  ]

  return (
    <section
      className="border-y border-slate-200/80 bg-white px-4 py-14 sm:px-6 lg:py-16"
      aria-labelledby="why-asistan-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#0071E3] uppercase">
            {t({ tr: 'Neden Asistan', en: 'Why Asistan' })}
          </p>
          <h2
            id="why-asistan-heading"
            className="mt-2 font-display text-2xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-3xl"
          >
            {t({
              tr: 'Rakip takvim değil — kimlik ağı + yerel dürüstlük',
              en: 'Not another calendar — identity network + local honesty',
            })}
          </h2>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {beats.map((beat) => (
            <li key={beat.title} className="rounded-2xl border border-slate-200/80 bg-[#F6F7F9]/60 p-5 text-left">
              <beat.icon className="size-6 text-[#0071E3]" aria-hidden />
              <h3 className="mt-3 text-base font-bold text-[#1D1D1F]">{beat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5D6068]">{beat.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-[#0071E3]/25 bg-[#0071E3]/5 px-5 py-4">
            <p className="text-sm font-bold text-[#1D1D1F]">{passport}</p>
            <p className="mt-1 text-sm text-[#5D6068]">
              {t({
                tr: 'Ziyaret özeti; klinik not paylaşılmaz. FHIR / tıbbi pasaport değil.',
                en: 'Visit summary; clinic notes are not shared. Not a FHIR / medical passport.',
              })}
            </p>
            <Link
              href="/client"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#0071E3] underline-offset-4 hover:underline"
            >
              {t({ tr: 'Hasta olarak keşfet', en: 'Explore as patient' })}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#5D6068]">
          <Link href="/guven" className="font-semibold text-[#0071E3] underline-offset-4 hover:underline">
            {t({ tr: 'Güven Merkezi', en: 'Trust Center' })}
          </Link>
          {' · '}
          <Link href="/sonuclar" className="font-semibold text-[#0071E3] underline-offset-4 hover:underline">
            {t({ tr: 'Operasyon sonuçları', en: 'Outcomes' })}
          </Link>
        </p>
      </div>
    </section>
  )
}
