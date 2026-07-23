import Image from 'next/image'

interface AsistanLogoProps {
  className?: string
  /** Kept for backwards compatibility: the full image already contains the wordmark. */
  showText?: boolean
  /** Kept for backwards compatibility: tagline is no longer part of the bundled logo image. */
  showTagline?: boolean
  /** 'dark' = navy wordmark for light backgrounds, 'light' = white wordmark for dark backgrounds. */
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
}

const HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, number> = {
  sm: 24,
  md: 32,
  lg: 56,
}

const LOGO_ASPECT: Record<NonNullable<AsistanLogoProps['variant']>, number> = {
  dark: 1210 / 334,
  light: 2172 / 724,
}

const VARIANT_SRC: Record<NonNullable<AsistanLogoProps['variant']>, string> = {
  dark: '/images/asistan-full-logo.png',
  light: '/images/asistan-full-logo-light.png',
}

export function AsistanLogo({
  className = '',
  variant = 'dark',
  size = 'md',
  priority = false,
}: AsistanLogoProps) {
  const height = HEIGHTS[size]
  const width = Math.round(height * LOGO_ASPECT[variant])

  return (
    <Image
      src={VARIANT_SRC[variant]}
      alt="Asistan"
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`block max-w-full select-none object-contain object-left ${className}`}
      style={{ width: 'auto', height: 'auto', maxHeight: height }}
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
  // Native <img> for SVG marks — next/image does not optimize SVGs.
  return (
    <img
      src="/images/asistan-mark.svg"
      alt="Asistan"
      width={size}
      height={size}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`block select-none ${className}`}
    />
  )
}

export { AsistanIcon as AsistanMark }
