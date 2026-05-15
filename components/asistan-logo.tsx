'use client'

interface AsistanLogoProps {
  className?: string
  showText?: boolean
  showTagline?: boolean
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 28, text: 'text-lg', gap: 'gap-2' },
  md: { mark: 36, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { mark: 48, text: 'text-3xl', gap: 'gap-3' },
}

export function AsistanLogo({
  className = '',
  showText = true,
  showTagline = false,
  variant = 'dark',
  size = 'md',
}: AsistanLogoProps) {
  const cfg = sizes[size]
  const textColor = variant === 'light' ? 'text-white' : 'text-[#0C1D36]'
  const taglineColor = variant === 'light' ? 'text-[#1BD1B5]' : 'text-[#16A9E8]'

  return (
    <div className={`inline-flex items-center flex-shrink-0 ${cfg.gap} ${className}`}>
      <AsistanMark size={cfg.mark} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`${cfg.text} font-extrabold tracking-tight leading-none ${textColor}`}
            style={{ fontFamily: "'Manrope', system-ui, sans-serif", letterSpacing: '-0.02em' }}
          >
            asistan
          </span>
          {showTagline && (
            <span
              className={`text-[9px] font-semibold tracking-[0.18em] uppercase mt-1.5 ${taglineColor}`}
            >
              İşini Yöneten Akıllı Asistan
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function AsistanIcon({ className = '', size = 40 }: { className?: string; size?: number }) {
  return <AsistanMark size={size} className={className} />
}

/* ─── Inline SVG mark: speed lines + A letterform with person silhouette ─── */
export function AsistanMark({
  size = 40,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const gradientId = `asistan-grad-${Math.random().toString(36).slice(2, 9)}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
      aria-label="Asistan"
    >
      <defs>
        <linearGradient id={gradientId} x1="20" y1="20" x2="100" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1BD1B5" />
          <stop offset="55%" stopColor="#16A9E8" />
          <stop offset="100%" stopColor="#0866C7" />
        </linearGradient>
      </defs>

      {/* Speed lines */}
      <g stroke="#0C1D36" strokeWidth="5" strokeLinecap="round">
        <line x1="8" y1="56" x2="32" y2="56" />
        <line x1="2" y1="72" x2="34" y2="72" />
        <line x1="14" y1="88" x2="30" y2="88" />
      </g>

      {/* Head dot (teal) */}
      <circle cx="68" cy="20" r="9" fill="#1BD1B5" />

      {/* "A" letterform with integrated person silhouette */}
      <path
        d="M68 34
           C 64 34, 60 36, 58 40
           L 36 110
           C 35 113, 37 116, 40 116
           L 50 116
           C 52 116, 54 115, 55 113
           L 60 100
           L 78 100
           C 77 96, 76 92, 74 88
           L 64 88
           L 70 70
           C 71 67, 72 65, 73 63
           C 76 71, 80 84, 84 95
           C 86 102, 88 109, 89 113
           C 90 115, 92 116, 94 116
           L 104 116
           C 107 116, 109 113, 108 110
           L 86 40
           C 84 36, 78 34, 73 34
           Z"
        fill={`url(#${gradientId})`}
      />

      {/* Inner body highlight (lighter shape suggesting person torso) */}
      <path
        d="M68 42
           C 70 42, 72 43, 73 45
           L 76 53
           C 73 53, 70 53, 68 53
           C 66 53, 64 53, 62 53
           L 65 45
           C 66 43, 67 42, 68 42
           Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />
    </svg>
  )
}
