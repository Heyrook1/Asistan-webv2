'use client'

interface AsistanLogoProps {
  className?: string
  showText?: boolean
  showTagline?: boolean
  variant?: 'light' | 'dark'
}

export function AsistanLogo({
  className = '',
  showText = true,
  showTagline = false,
  variant = 'dark'
}: AsistanLogoProps) {
  const mintColor = '#1BD1B5'

  if (variant === 'light') {
    return (
      <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/asistan-icon.png"
          alt="Asistan"
          className="h-10 w-auto flex-shrink-0"
        />
        {showText && (
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight leading-none text-white">
              asistan
            </span>
            {showTagline && (
              <span
                className="text-[10px] font-medium tracking-wider uppercase mt-1"
                style={{ color: mintColor }}
              >
                İşini Yöneten Akıllı Asistan
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!showText) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/asistan-icon.png"
        alt="Asistan"
        className={`h-10 w-auto flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`flex flex-col flex-shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/asistan-full-logo.png"
        alt="Asistan"
        className="h-10 w-auto"
      />
      {showTagline && (
        <span
          className="text-[10px] font-medium tracking-wider uppercase mt-1"
          style={{ color: mintColor }}
        >
          İşini Yöneten Akıllı Asistan
        </span>
      )}
    </div>
  )
}

export function AsistanIcon({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/asistan-icon.png"
      alt="Asistan"
      className={`h-10 w-auto flex-shrink-0 ${className}`}
    />
  )
}
