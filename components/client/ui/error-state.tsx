import { AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Actionable error state — explains what happened + what the user can do.
 * Never surfaces raw technical/backend strings; callers pass human copy.
 */
export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
}: {
  title: string
  description?: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <p className="rz-card-title text-rose-900">{title}</p>
      {description ? (
        <p className="rz-secondary mt-1.5 max-w-[38ch] text-rose-800/80">{description}</p>
      ) : null}
      {retryLabel && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}
