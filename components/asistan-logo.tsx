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

const LOGO_ASPECT = 1920 / 660

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
      className={`block h-auto w-auto max-w-full select-none ${className}`}
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

export { AsistanIcon as AsistanMark }
