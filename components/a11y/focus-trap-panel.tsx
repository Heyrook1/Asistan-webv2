'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/use-focus-trap'

type FocusTrapPanelProps = {
  children: React.ReactNode
  className?: string
  id?: string
  labelledBy?: string
  label?: string
  onEscape?: () => void
  role?: 'dialog' | 'menu'
}

export function FocusTrapPanel({
  children,
  className,
  id,
  labelledBy,
  label,
  onEscape,
  role = 'dialog',
}: FocusTrapPanelProps) {
  const ref = useFocusTrap({ onEscape })

  React.useEffect(() => {
    const panel = ref.current
    if (!panel) return
    const focusable = panel.querySelector<HTMLElement>(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }, [ref])

  return (
    <div
      ref={ref}
      id={id}
      role={role}
      aria-modal={role === 'dialog' ? true : undefined}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={cn(className)}
    >
      {children}
    </div>
  )
}
