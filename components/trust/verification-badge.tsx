import { BadgeCheck, Clock3, ShieldAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DoctorVerification } from '@/lib/trust/public'

const STYLES = {
  verified: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
  partial: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
  unverified: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
} as const

const ICONS = {
  verified: BadgeCheck,
  partial: Clock3,
  unverified: ShieldAlert,
} as const

export function VerificationBadge({
  verification,
  locale = 'tr',
  className,
}: {
  verification: Pick<DoctorVerification, 'level' | 'label' | 'labelEn'>
  locale?: 'tr' | 'en'
  className?: string
}) {
  const Icon = ICONS[verification.level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold',
        STYLES[verification.level],
        className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {locale === 'en' ? verification.labelEn : verification.label}
    </span>
  )
}
