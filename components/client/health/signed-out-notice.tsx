'use client'

import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { PatientCard } from '@/components/client/ui'

/** Shown when a health module is opened without an authenticated session. */
export function SignedOutNotice() {
  const { t } = useLanguage()
  return (
    <PatientCard className="bg-[var(--rz-surface-soft)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--rz-blue)] shadow-sm">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <p className="rz-card-title text-slate-900">
            {t({ tr: 'Sağlık kayıtlarınız yalnızca size ait', en: 'Your health records are private to you' })}
          </p>
          <p className="rz-secondary">
            {t({
              tr: 'Bu bölümü görmek için Asistan hesabınızla giriş yapın.',
              en: 'Sign in with your Asistan account to view this section.',
            })}
          </p>
          <Link
            href="/client/profile"
            className="mt-1 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--rz-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--rz-blue-hover)]"
          >
            {t({ tr: 'Giriş yap', en: 'Sign in' })}
          </Link>
        </div>
      </div>
    </PatientCard>
  )
}
