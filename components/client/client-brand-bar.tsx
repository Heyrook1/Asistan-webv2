'use client'

import Link from 'next/link'
import { Building2, CalendarDays } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLanguage } from '@/hooks/useLanguage'
import { ENTRY_CTA, getClinicTrialPath, PATIENT_BOOK_PATH } from '@/lib/entry-routes'

/** Bridges patient /client surface back to the shared Asistan brand + clinic product. */
export function ClientBrandBar() {
  const { t, language } = useLanguage()

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur md:px-4">
      <Link href="/" className="inline-flex min-w-0 items-center gap-2" aria-label="Asistan ana sayfa">
        <AsistanLogo variant="dark" size="sm" />
        <span className="hidden truncate text-xs font-medium text-muted-foreground sm:inline">
          {t({
            tr: 'Klinik paneli + hasta randevusu',
            en: 'Clinic panel + patient booking',
          })}
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={PATIENT_BOOK_PATH}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
          {t({ tr: 'Randevu', en: 'Book' })}
        </Link>
        <Link
          href={getClinicTrialPath(language)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-95"
        >
          <Building2 className="h-3.5 w-3.5" aria-hidden />
          {t({
            tr: ENTRY_CTA.clinicTrial.short.tr,
            en: ENTRY_CTA.clinicTrial.short.en,
          })}
        </Link>
      </div>
    </div>
  )
}
