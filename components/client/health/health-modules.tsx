'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, FileText, Pill, ShieldAlert, type LucideIcon } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { clientFetchData } from '@/lib/client-marketplace/client-fetch'
import type { HealthRecordsSummary } from '@/lib/client-marketplace/health-records/types'

type ModuleKey = 'medications' | 'allergies' | 'documents'

type HealthModule = {
  key: ModuleKey
  href: string
  icon: LucideIcon
  title: { tr: string; en: string }
  subtitle: { tr: string; en: string }
}

const MODULES: HealthModule[] = [
  {
    key: 'medications',
    href: '/client/health/medications',
    icon: Pill,
    title: { tr: 'İlaçlar', en: 'Medications' },
    subtitle: { tr: 'Kullandığınız ilaçlar', en: 'Your medications' },
  },
  {
    key: 'allergies',
    href: '/client/health/allergies',
    icon: ShieldAlert,
    title: { tr: 'Alerjiler', en: 'Allergies' },
    subtitle: { tr: 'Bilinen alerji ve hassasiyetler', en: 'Known allergies and sensitivities' },
  },
  {
    key: 'documents',
    href: '/client/health/documents',
    icon: FileText,
    title: { tr: 'Belgeler', en: 'Documents' },
    subtitle: { tr: 'Rapor ve sağlık dosyalarınız', en: 'Your reports and health files' },
  },
]

export function HealthModules() {
  const { t } = useLanguage()
  const [summary, setSummary] = useState<HealthRecordsSummary | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await clientFetchData<HealthRecordsSummary>('/api/client/health/summary')
        if (active) setSummary(data)
      } catch {
        // Signed out or offline — fall back to the static subtitles silently.
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const countLabel = (key: ModuleKey): string | null => {
    if (!summary) return null
    if (key === 'medications') {
      return t({ tr: `${summary.activeMedications} aktif`, en: `${summary.activeMedications} active` })
    }
    if (key === 'allergies') {
      return t({ tr: `${summary.allergies} kayıt`, en: `${summary.allergies} record${summary.allergies === 1 ? '' : 's'}` })
    }
    return t({ tr: `${summary.documents} belge`, en: `${summary.documents} file${summary.documents === 1 ? '' : 's'}` })
  }

  return (
    <section className="space-y-2">
      <p className="px-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {t({ tr: 'Sağlık kayıtlarım', en: 'My health records' })}
      </p>
      <ul className="space-y-2">
        {MODULES.map((module) => {
          const Icon = module.icon
          const count = countLabel(module.key)
          return (
            <li key={module.href}>
              <Link
                href={module.href}
                className="flex min-h-[64px] items-center gap-3 rounded-[var(--rz-radius-lg)] border border-[var(--rz-border)] bg-white px-3.5 py-3 transition hover:border-[var(--rz-blue)]/30 hover:bg-[var(--rz-blue-soft)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rz-blue)]/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--rz-blue-soft)] text-[var(--rz-blue)]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block rz-card-title text-slate-900">{t(module.title)}</span>
                  <span className="block rz-secondary truncate">{t(module.subtitle)}</span>
                </span>
                {count ? (
                  <span className="shrink-0 rounded-full bg-[var(--rz-blue-soft)] px-2.5 py-1 text-[12px] font-bold text-[var(--rz-blue)]">
                    {count}
                  </span>
                ) : null}
                <ChevronRight className="size-5 shrink-0 text-slate-300" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
