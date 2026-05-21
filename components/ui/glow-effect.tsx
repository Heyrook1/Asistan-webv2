interface GlowEffectProps {
  className?: string
}

export function GlowEffect({ className = '' }: GlowEffectProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-[110px] ${className}`}
    />
  )
}
