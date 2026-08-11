import Image from 'next/image'

interface AsistanLogoProps {
  className?: string
  /** Kept for backwards compatibility. */
  showText?: boolean
  /** Kept for backwards compatibility. */
  showTagline?: boolean
  /**
   * `light` = assets for dark shells (sidebar, navy).
   * `dark` = assets for light shells (white headers).
   */
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg' | 'sidebar'
  priority?: boolean
  /**
   * `wordmark` = mark + “asistan”.
   * `mark` = icon only.
   */
  lockup?: 'wordmark' | 'mark'
}

const MARK_HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, number> = {
  sm: 28,
  md: 36,
  lg: 44,
  sidebar: 40,
}

/** Full lockup aspect ≈ 978×239 */
const WORDMARK_HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, { w: number; h: number }> = {
  sm: { w: 128, h: 31 },
  md: { w: 168, h: 41 },
  lg: { w: 220, h: 54 },
  sidebar: { w: 168, h: 41 },
}

const MARK_SRC = '/images/asistan-icon.png'
const WORDMARK_ON_LIGHT = '/images/asistan-full-logo.png'
const WORDMARK_ON_DARK = '/images/asistan-full-logo-light.png'

export function AsistanLogo({
  className = '',
  size = 'md',
  priority = false,
  lockup = 'wordmark',
  variant = 'dark',
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
  const src = variant === 'light' ? WORDMARK_ON_DARK : WORDMARK_ON_LIGHT
  return (
    <Image
      src={src}
      alt="Asistan"
      width={w}
      height={h}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`block h-auto w-auto max-w-full select-none object-contain object-left ${className}`}
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
