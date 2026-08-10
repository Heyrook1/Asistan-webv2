import Image from 'next/image'

interface AsistanLogoProps {
  className?: string
  /** Kept for backwards compatibility. */
  showText?: boolean
  /** Kept for backwards compatibility. */
  showTagline?: boolean
  /** Kept for backwards compatibility — lockup uses the same asset on light/dark shells. */
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
  /**
   * `wordmark` = mark + “asistan” (marketing / auth).
   * `mark` = icon only (client + dashboard shells).
   */
  lockup?: 'wordmark' | 'mark'
}

const MARK_HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, number> = {
  sm: 28,
  md: 36,
  lg: 56,
}

/** Full lockup aspect ≈ 978×239 */
const WORDMARK_HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, { w: number; h: number }> = {
  sm: { w: 128, h: 31 },
  md: { w: 168, h: 41 },
  lg: { w: 236, h: 58 },
}

const MARK_SRC = '/images/asistan-icon.png'
const WORDMARK_SRC = '/images/asistan-full-logo.png'

export function AsistanLogo({
  className = '',
  size = 'md',
  priority = false,
  lockup = 'wordmark',
}: AsistanLogoProps) {
  if (lockup === 'mark') {
    const side = MARK_HEIGHTS[size]
    return (
      <Image
        src={MARK_SRC}
        alt="Asistan"
        width={side}
        height={side}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={`block h-auto w-auto select-none object-contain ${className}`}
        style={{ width: side, height: side }}
      />
    )
  }

  const { w, h } = WORDMARK_HEIGHTS[size]
  return (
    <Image
      src={WORDMARK_SRC}
      alt="Asistan"
      width={w}
      height={h}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`block h-auto w-auto select-none object-contain object-left ${className}`}
      style={{ width: w, height: h }}
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
      className={`block h-auto w-auto select-none object-contain ${className}`}
    />
  )
}

export { AsistanIcon as AsistanMark }
