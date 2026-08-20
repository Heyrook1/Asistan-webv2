import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Guiding empty state — always explains why it is empty and offers the next action.
 * Presentational only; pass already-translated strings from the calling component.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--rz-border)] bg-white/60 px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[var(--rz-blue-soft)] text-[var(--rz-blue)]">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <p className="rz-card-title text-slate-900">{title}</p>
      {description ? (
        <p className="rz-secondary mt-1.5 max-w-[36ch]">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--rz-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--rz-blue-hover)] active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--rz-blue)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--rz-blue-hover)] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
