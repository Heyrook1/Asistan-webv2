import type { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Base patient surface — consistent radius, border, background and soft elevation. */
export function PatientCard({
  as,
  children,
  className,
  interactive = false,
}: {
  as?: ElementType
  children: ReactNode
  className?: string
  interactive?: boolean
}) {
  const Comp = as ?? 'div'
  return (
    <Comp
      className={cn(
        'rounded-2xl border border-[var(--rz-border)] bg-white p-4 shadow-[var(--rz-shadow-soft)]',
        interactive &&
          'rz-press transition hover:border-[var(--rz-border-strong)] hover:shadow-[var(--rz-shadow-card)]',
        className,
      )}
    >
      {children}
    </Comp>
  )
}
