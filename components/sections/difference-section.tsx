'use client'

import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'

export function DifferenceSection() {
  const { t } = useLanguage()

  const rows = [
    {
      traditional: t({ tr: 'Yalnızca randevu', en: 'Appointment only' }),
      asistan: t({
        tr: 'Sağlık operasyon platformu',
        en: 'Healthcare operations platform',
      }),
    },
    {
      traditional: t({ tr: 'Klinik içi silo', en: 'Clinic-only silo' }),
      asistan: t({
        tr: 'Klinik OS + hasta kanalı',
        en: 'Clinic OS + patient channel',
      }),
    },
    {
      traditional: t({ tr: 'Statik formlar', en: 'Static forms' }),
      asistan: t({ tr: 'Gerçek müsaitlik motoru', en: 'Real availability engine' }),
    },
    {
      traditional: t({
        tr: 'Özellik listesi satışı',
        en: 'Feature-checklist sales',
      }),
      asistan: t({
        tr: 'Sonuç odaklı, aşama dürüst yol haritası',
        en: 'Outcome-led, stage-honest roadmap',
      }),
    },
  ]

  return (
    <section
      id="difference"
      className="bg-[#F6F7F9] scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="difference-heading"
    >
      <div className="mx-auto max-w-[900px]">
        <SectionHeading
          titleId="difference-heading"
          eyebrow={t({ tr: 'Neden farklı?', en: 'Why different?' })}
          title={t({
            tr: 'Geleneksel randevu yazılımı değil.',
            en: 'Not traditional appointment software.',
          })}
        />

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <p className="px-4 py-3">{t({ tr: 'Geleneksel yazılım', en: 'Traditional software' })}</p>
            <p className="px-4 py-3 text-[#0071E3]">Asistan Health</p>
          </div>
          <ul>
            {rows.map((row) => (
              <li
                key={row.traditional}
                className="grid grid-cols-2 border-b border-slate-100 last:border-0"
              >
                <p className="px-4 py-4 text-sm text-[#5D6068]">{row.traditional}</p>
                <p className="border-l border-slate-100 bg-[#EEF6FF]/40 px-4 py-4 text-sm font-semibold text-[#1D1D1F]">
                  {row.asistan}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
