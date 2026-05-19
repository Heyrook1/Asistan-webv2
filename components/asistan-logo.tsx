import Image from 'next/image'

interface AsistanLogoProps {
  className?: string
  /** kept for backwards-compat — the full image already contains the wordmark */
  showText?: boolean
  /** kept for backwards-compat — tagline is no longer part of the bundled logo image */
  showTagline?: boolean
  /** 'dark' = navy wordmark for light backgrounds, 'light' = white wordmark for dark backgrounds */
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
}

// Heights chosen so the wordmark scales naturally with the surrounding chrome.
// The PNG aspect ratio is roughly 1920 × 660 (≈ 2.91:1).
const HEIGHTS: Record<NonNullable<AsistanLogoProps['size']>, number> = {
  sm: 24,
  md: 32,
  lg: 56,
}

const LOGO_ASPECT = 1920 / 660 // matches /public/images/asistan-full-logo*.png

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
  const width = Math.round(height * LOGO_ASPECT)

  return (
    <Image
      src={VARIANT_SRC[variant]}
      alt="Asistan"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={`block h-auto w-auto select-none ${className}`}
      style={{ height, width: 'auto', maxWidth: '100%' }}
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
      src="/images/asistan-mark.svg"
      alt="Asistan"
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={`block select-none ${className}`}
    />
  )
}

// Backwards-compat re-export — some files import { AsistanMark } directly.
export { AsistanIcon as AsistanMark }
