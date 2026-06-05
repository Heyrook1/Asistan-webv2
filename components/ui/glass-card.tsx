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
        'relative overflow-hidden rounded-3xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        toneClass[tone],
        interactive && 'hover:-translate-y-1 hover:scale-[1.01] hover:brightness-[1.02]',
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(170deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.15)_65%,transparent_100%)]" />
      <div className="relative">{children}</div>
    </div>
  )
}

