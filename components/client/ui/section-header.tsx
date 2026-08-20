import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Section heading with optional trailing action (link or arbitrary node). */
export function SectionHeader({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className,
}: {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="rz-section-title text-slate-900">{title}</h2>
        {description ? <p className="rz-secondary mt-0.5">{description}</p> : null}
      </div>
      {action ??
        (actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="shrink-0 text-sm font-semibold text-[var(--rz-blue)] transition hover:text-[var(--rz-blue-hover)]"
          >
            {actionLabel}
          </Link>
        ) : null)}
    </div>
  )
}
