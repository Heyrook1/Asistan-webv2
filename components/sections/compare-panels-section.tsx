'use client'

import { Check, X } from 'lucide-react'
import { SectionHeading } from '@/components/sections/section-heading'
import { ClinicDashboardMock } from '@/components/sections/landing-device-mocks'
import { useLanguage } from '@/hooks/useLanguage'

export function ComparePanelsSection() {
  const { t, language } = useLanguage()

  const withoutItems = [
    t({ tr: 'Excel ve WhatsApp parçalanır', en: 'Excel and WhatsApp fragment the day' }),
    t({ tr: 'Çift rezervasyon riski', en: 'Double-booking risk' }),
    t({ tr: 'Hasta geçmişi dağınık', en: 'Scattered patient history' }),
    t({ tr: 'Rapor “aklımızda”', en: 'Reports live in people’s heads' }),
  ]

  const withItems = [
    t({ tr: 'Tek operasyon paneli', en: 'One operations panel' }),
    t({ tr: 'Gerçek müsaitlik', en: 'Real availability' }),
    t({ tr: 'Hasta kaydı klinik üyelikte', en: 'Patient record as clinic membership' }),
    t({ tr: 'Ölçülen gün özeti', en: 'Measured day summary' }),
  ]

  return (
    <section
      id="compare"
      className="scroll-mt-28 bg-white px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="compare-heading"
    >
      <div className="mx-auto max-w-[1180px]">
        <SectionHeading
          titleId="compare-heading"
          eyebrow={t({ tr: 'Sorun → Çözüm', en: 'Problem → Solution' })}
          title={t({
            tr: 'Aynı gün. Farklı düzen.',
            en: 'Same day. Different order.',
          })}
        />
        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="flex flex-col rounded-[1.35rem] border border-rose-200/80 bg-[linear-gradient(165deg,#F8F4F2_0%,#F3F0EE_55%,#EEE8E4_100%)] p-6">
            <h3 className="text-lg font-bold text-slate-600">
              {t({ tr: 'Asistan olmadan', en: 'Without Asistan' })}
            </h3>
            <ul className="mt-4 flex-1 space-y-3">
              {withoutItems.map((item, i) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-sm text-[#5D6068]"
                  style={{ marginLeft: `${(i % 3) * 6}px` }}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                    <X className="size-3" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Sağlıksız / dağınık veri kollajı — sağ panelle kontrast */}
            <div
              className="relative mt-6 h-[168px] overflow-hidden rounded-xl border border-dashed border-rose-300/70 bg-[repeating-linear-gradient(-12deg,transparent,transparent_7px,rgba(190,80,70,0.04)_7px,rgba(190,80,70,0.04)_8px)]"
              aria-hidden
            >
              {/* Excel parçası */}
              <div className="absolute left-2 top-3 w-[58%] -rotate-6 rounded-md border border-emerald-800/20 bg-[#E8F5E9] p-2 shadow-sm">
                <p className="font-mono text-[9px] font-bold text-emerald-900/70">randevu.xlsx</p>
                <div className="mt-1 grid grid-cols-3 gap-px bg-emerald-900/10 text-[8px] text-emerald-950/80">
                  <span className="bg-white/80 px-1 py-0.5">Ayşe</span>
                  <span className="bg-white/80 px-1 py-0.5">14:00</span>
                  <span className="bg-rose-200 px-1 py-0.5 line-through">???</span>
                  <span className="bg-white/80 px-1 py-0.5">Mehmet</span>
                  <span className="bg-amber-100 px-1 py-0.5">14:00</span>
                  <span className="bg-white/80 px-1 py-0.5">Dr.?</span>
                </div>
              </div>

              {/* WhatsApp balonu */}
              <div className="absolute right-1 top-2 w-[48%] rotate-[8deg] rounded-2xl rounded-tr-sm border border-[#25D366]/35 bg-[#DCF8C6] px-2.5 py-2 shadow-sm">
                <p className="text-[9px] font-semibold text-[#075E54]">WhatsApp</p>
                <p className="mt-0.5 text-[9px] leading-snug text-[#1D1D1F]/80">
                  {t({
                    tr: '“Yarın 14’e yaz, Excel’de yok”',
                    en: '“Book 2pm tomorrow — not in Excel”',
                  })}
                </p>
              </div>

              {/* Çift rezervasyon uyarısı */}
              <div className="absolute bottom-10 left-[18%] z-10 w-[52%] rotate-[-3deg] rounded-md border border-rose-400/50 bg-rose-50 px-2 py-1.5 shadow-[0_8px_20px_-12px_rgba(190,50,40,0.55)]">
                <p className="text-[9px] font-bold uppercase tracking-wide text-rose-600">
                  {t({ tr: 'Çakışma', en: 'Conflict' })}
                </p>
                <p className="text-[10px] font-medium text-rose-900/90">
                  {t({ tr: '14:00 · iki hasta aynı slot', en: '2pm · two patients, one slot' })}
                </p>
              </div>

              {/* Yapışkan not */}
              <div className="absolute bottom-3 right-2 w-[38%] rotate-[12deg] bg-[#FFF3A0] px-2 py-1.5 shadow-md">
                <p className="text-[9px] font-semibold italic text-amber-950/70">
                  {t({ tr: 'Rapor? “aklımızda”', en: 'Report? “in our heads”' })}
                </p>
              </div>

              {/* Kopuk satırlar */}
              <div className="absolute left-3 bottom-4 flex -rotate-2 flex-col gap-1 opacity-70">
                <span className="h-1.5 w-16 rounded-sm bg-slate-400/50" />
                <span className="ml-3 h-1.5 w-10 rounded-sm bg-slate-400/40" />
                <span className="ml-1 h-1.5 w-14 rounded-sm bg-rose-300/60" />
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] font-semibold text-rose-500/90">
              {t({ tr: 'Dağınık araçlar · sağlıksız veri', en: 'Scattered tools · unhealthy data' })}
            </p>
          </article>

          <article className="overflow-hidden rounded-[1.35rem] border border-[#0071E3]/25 bg-[#EEF6FF]/50 p-6 ring-1 ring-[#0071E3]/10">
            <h3 className="text-lg font-bold text-[#0071E3]">
              {t({ tr: 'Asistan Health ile', en: 'With Asistan Health' })}
            </h3>
            <ul className="mt-4 space-y-3">
              {withItems.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm font-medium text-[#1D1D1F]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-3" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <ClinicDashboardMock
                lang={language === 'en' ? 'en' : 'tr'}
                compact
                className="shadow-[0_24px_48px_-28px_rgba(0,113,227,0.4)]"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
