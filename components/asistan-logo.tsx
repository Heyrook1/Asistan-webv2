import Image from 'next/image'

interface AsistanLogoProps {
  className?: string
  /** Kept for backwards compatibility. */
  showText?: boolean
  /** Kept for backwards compatibility. */
  showTagline?: boolean
  /** Kept for backwards compatibility — mark is the same on light/dark shells. */
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
}

const HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, number> = {
  sm: 28,
  md: 36,
  lg: 56,
}

/** App mark (A + motion) — 1:1 squircle. */
const MARK_SRC = '/images/asistan-icon.png'

export function AsistanLogo({
  className = '',
  size = 'md',
  priority = false,
}: AsistanLogoProps) {
  const side = HEIGHTS[size]

  return (
    <Image
      src={MARK_SRC}
      alt="Asistan"
      width={side}
      height={side}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`block select-none object-contain ${className}`}
      style={{ width: side, height: side }}
    />
  )
}

export function AsistanIcon({
  className = '',
  size = 40,
  priority = false,
}: {
  className?: string
  size?: number
  priority?: boolean
}) {
  return (
    <Image
      src={MARK_SRC}
      alt="Asistan"
      width={size}
      height={size}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`block select-none object-contain ${className}`}
    />
  )
}

export { AsistanIcon as AsistanMark }
