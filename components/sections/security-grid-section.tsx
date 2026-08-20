'use client'

import Link from 'next/link'
import { Cloud, Fingerprint, LockKeyhole, ScrollText, Shield } from 'lucide-react'
import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'

export function SecurityGridSection() {
  const { t, language } = useLanguage()

  const items = [
    {
      icon: LockKeyhole,
      title: t({ tr: 'Şifreleme', en: 'Encryption' }),
      body: t({
        tr: 'Veri iletimi ve depolama katmanlarında koruma.',
        en: 'Protection across transit and storage layers.',
      }),
    },
    {
      icon: Cloud,
      title: t({ tr: 'Bulut altyapı', en: 'Cloud infrastructure' }),
      body: t({
        tr: 'Modern bulut mimarisi — sahte uptime iddiası yok.',
        en: 'Modern cloud architecture — no fake uptime claims.',
      }),
    },
    {
      icon: Shield,
      title: getClaim('kvkk-controls', language),
      body: t({
        tr: 'Gizlilik kontrolleri ürünün içinde.',
        en: 'Privacy controls built into the product.',
      }),
    },
    {
      icon: Fingerprint,
      title: getClaim('tenant-isolation', language),
      body: getClaim('rbac', language),
    },
    {
      icon: ScrollText,
      title: getClaim('audit-log', language),
      body: t({
        tr: 'Hassas aksiyonlar izlenebilir.',
        en: 'Sensitive actions are traceable.',
      }),
    },
  ]

  return (
    <section
      id="security"
      className="bg-[var(--section-surface-blue)] scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="security-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading
          titleId="security-heading"
          eyebrow={t({ tr: 'Güvenlik', en: 'Security' })}
          title={t({
            tr: 'Kanıtlanabilir kontroller. Rozet tiyatrosu değil.',
            en: 'Verifiable controls. Not badge theater.',
          })}
          description={t({
            tr: 'KVKK odaklı mimari — “uyumlu / sertifikalı” iddiası yok.',
            en: 'KVKK-focused architecture — no “compliant / certified” overclaim.',
          })}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-[#F6F7F9]/60 p-5"
            >
              <item.icon className="size-5 text-[#0071E3]" aria-hidden />
              <h3 className="mt-3 text-base font-bold text-[#1D1D1F]">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5D6068]">{item.body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center">
          <Link
            href="/guven"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0071E3] underline-offset-4 hover:underline"
          >
            {t({ tr: 'Güven Merkezini incele', en: 'Open Trust Center' })}
          </Link>
        </p>
      </div>
    </section>
  )
}
