'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'

export function LandingFaqSection() {
  const { t } = useLanguage()

  const items = [
    {
      q: t({ tr: 'Asistan Health nedir?', en: 'What is Asistan Health?' }),
      a: t({
        tr: 'Klinik operasyon paneli: randevu, hasta, ekip. Hastalar Asistan ile randevu bulur.',
        en: 'A clinic operations panel: scheduling, patients, team. Patients book through Asistan.',
      }),
    },
    {
      q: t({ tr: 'Kimler için?', en: 'Who is it for?' }),
      a: t({
        tr: 'KKTC diş, estetik, fizyo ve poliklinikler — hastane HIS değil.',
        en: 'Northern Cyprus dental, aesthetic, physio, and polyclinics — not hospital HIS.',
      }),
    },
    {
      q: t({
        tr: 'Hastalar nasıl randevu alır?',
        en: 'How do patients book?',
      }),
      a: t({
        tr: 'Asistan (/client) veya kliniğin public book linki ile — en fazla 3 ana adım.',
        en: 'Via Asistan (/client) or the clinic public book link — at most 3 primary steps.',
      }),
    },
    {
      q: t({ tr: 'Verilerimiz güvende mi?', en: 'Is our data safe?' }),
      a: t({
        tr: 'İşletme bazlı veri ayrımı, rol bazlı erişim, denetim günlüğü ve KVKK odaklı kontroller ürünün içinde.',
        en: 'Business-level isolation, role-based access, audit log, and KVKK-focused controls ship in product.',
      }),
    },
    {
      q: t({ tr: 'e-Reçete var mı?', en: 'Do you have e-prescription?' }),
      a: t({
        tr: 'Bugün yazdırılabilir klinik reçete taslağı var. Resmi ağ entegrasyonu yol haritasında (hedef) — “hazır” iddiası yok.',
        en: 'Today: printable clinic prescription drafts. Official network integration is on the roadmap (target) — no “ready” claim.',
      }),
    },
    {
      q: t({ tr: 'Nasıl başlarız?', en: 'How do we start?' }),
      a: t({
        tr: 'Demo rezerve edin veya kliniğinizde 14 gün ücretsiz deneyin. Fiyat özeti ana sayfada; ayrıntı /fiyatlandirma sayfasında.',
        en: 'Book a demo or try free for 14 days in your clinic. Pricing summary is on the homepage; detail on /fiyatlandirma.',
      }),
    },
  ]

  return (
    <section
      id="faq"
      className="bg-[var(--section-surface-neutral)] scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[720px]">
        <SectionHeading
          titleId="faq-heading"
          eyebrow={t({ tr: 'SSS', en: 'FAQ' })}
          title={t({
            tr: 'Kısa cevaplar. Dürüst sınırlar.',
            en: 'Short answers. Honest boundaries.',
          })}
        />

        <Accordion type="single" collapsible className="mt-10 rounded-2xl border border-slate-200 bg-white px-4">
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="min-h-11 text-left text-base font-semibold text-[#1D1D1F] hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#5D6068] leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
