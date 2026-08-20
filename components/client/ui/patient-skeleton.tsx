import { cn } from '@/lib/utils'

/** Shimmer block used to build route/section skeletons. */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-xl bg-slate-200/70', className)}
    />
  )
}

/** Standard patient list-card skeleton (avatar/icon + two lines + action). */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--rz-border)] bg-white p-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <SkeletonBlock className="size-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-3/4" />
        </div>
      </div>
      <SkeletonBlock className="mt-4 h-9 w-full" />
    </div>
  )
}

/** Repeated card skeletons for list loading states. */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={`card-skeleton-${index}`} />
      ))}
    </div>
  )
}
