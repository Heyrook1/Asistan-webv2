import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Centered mobile-first content column with dock clearance for the bottom nav. */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[520px] px-4 pb-[var(--rz-dock-clearance)] pt-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
