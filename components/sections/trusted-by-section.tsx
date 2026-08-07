'use client'

import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'

const SEGMENTS = [
  { tr: 'Diş', en: 'Dental' },
  { tr: 'Estetik', en: 'Aesthetic' },
  { tr: 'Fizyo', en: 'Physio' },
  { tr: 'Poliklinik', en: 'Polyclinic' },
] as const

export function TrustedBySection() {
  const { t, language } = useLanguage()

  return (
    <section
      id="trusted"
      className="border-y border-slate-200/80 bg-white scroll-mt-28 px-4 py-12 sm:px-6"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading
          titleId="trusted-heading"
          eyebrow={t({ tr: 'Kimler için', en: 'Built for' })}
          title={t({
            tr: 'KKTC’de poliklinik ve muayenehaneler için tasarlandı.',
            en: 'Designed for outpatient clinics in Northern Cyprus.',
          })}
          description={getClaim('kktc-first', language)}
        />
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {SEGMENTS.map((seg) => (
            <li
              key={seg.en}
              className="rounded-full border border-slate-200 bg-[#F6F7F9] px-4 py-2 text-sm font-semibold text-[#1D1D1F]"
            >
              {seg[language]}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-center text-sm text-[#5D6068]">
          {t({
            tr: 'Erken erişim klinik ağı büyüyor — sahte logo yok.',
            en: 'Early-access clinic network is growing — no fake logos.',
          })}
        </p>
      </div>
    </section>
  )
}
