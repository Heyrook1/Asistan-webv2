import * as React from 'react'

import { cn } from '@/lib/utils'

type GlassCardTone = 'neutral' | 'accent'
type GlassCardBlur = 'md' | 'xl'

interface GlassCardProps extends React.ComponentProps<'div'> {
  interactive?: boolean
  tone?: GlassCardTone
  blur?: GlassCardBlur
}

const toneClass: Record<GlassCardTone, string> = {
  neutral: 'liquid-glass',
  accent: 'liquid-glass-accent',
}

export function GlassCard({
  className,
  children,
  interactive = false,
  tone = 'neutral',
  blur: _blur = 'xl',
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        'relative overflow-hidden rounded-2xl transition duration-[var(--motion-interaction-duration)] ease-[var(--motion-interaction-ease)]',
        toneClass[tone],
        interactive && 'hover:-translate-y-0.5 hover:[box-shadow:var(--surface-shadow-raised)]',
        className,
      )}
      {...props}
    >
      <div className="relative">{children}</div>
    </div>
  )
}
