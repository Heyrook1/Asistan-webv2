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
  neutral: 'border-white/55 bg-white/62',
  accent: 'border-primary/30 bg-white/68 shadow-accent-glow',
}

const blurClass: Record<GlassCardBlur, string> = {
  md: 'backdrop-blur-md',
  xl: 'backdrop-blur-xl',
}

export function GlassCard({
  className,
  children,
  interactive = false,
  tone = 'neutral',
  blur = 'xl',
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        'relative overflow-hidden rounded-3xl border shadow-glass-soft',
        toneClass[tone],
        blurClass[blur],
        interactive &&
          'transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-glass',
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(170deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.15)_65%,transparent_100%)]" />
      <div className="relative">{children}</div>
    </div>
  )
}

