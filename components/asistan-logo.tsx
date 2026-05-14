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
  const textColor = variant === 'dark' ? '#0B1828' : '#FFFFFF'
  const mintColor = '#1BD1B5'
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <svg 
        viewBox="0 0 60 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 flex-shrink-0"
      >
        {/* Speed lines */}
        <rect x="2" y="24" width="12" height="4" rx="2" fill={mintColor} />
        <rect x="6" y="32" width="10" height="4" rx="2" fill={mintColor} />
        <rect x="4" y="40" width="8" height="4" rx="2" fill={mintColor} />
        
        {/* Head circle */}
        <circle cx="38" cy="10" r="7" fill={mintColor} />
        
        {/* Body - A shape with gradient */}
        <defs>
          <linearGradient id="bodyGradient" x1="20" y1="20" x2="55" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1BD1B5" />
            <stop offset="1" stopColor="#207FF5" />
          </linearGradient>
        </defs>
        
        {/* Left leg of A */}
        <path 
          d="M22 55C22 55 32 25 38 18C40 20 42 22 44 25L34 55C32 55 28 55 22 55Z" 
          fill="url(#bodyGradient)"
        />
        
        {/* Right leg of A */}
        <path 
          d="M44 25C48 32 54 45 56 55C52 55 48 55 44 55L44 25Z" 
          fill="url(#bodyGradient)"
        />
        
        {/* Crossbar of A */}
        <path 
          d="M28 42L48 42L46 48L30 48L28 42Z" 
          fill="url(#bodyGradient)"
        />
      </svg>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className="text-2xl font-bold tracking-tight leading-none"
            style={{ color: textColor }}
          >
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

export function AsistanIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Speed lines */}
      <rect x="2" y="24" width="12" height="4" rx="2" fill="#1BD1B5" />
      <rect x="6" y="32" width="10" height="4" rx="2" fill="#1BD1B5" />
      <rect x="4" y="40" width="8" height="4" rx="2" fill="#1BD1B5" />
      
      {/* Head circle */}
      <circle cx="38" cy="10" r="7" fill="#1BD1B5" />
      
      {/* Body - A shape with gradient */}
      <defs>
        <linearGradient id="iconBodyGradient" x1="20" y1="20" x2="55" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1BD1B5" />
          <stop offset="1" stopColor="#207FF5" />
        </linearGradient>
      </defs>
      
      {/* Left leg of A */}
      <path 
        d="M22 55C22 55 32 25 38 18C40 20 42 22 44 25L34 55C32 55 28 55 22 55Z" 
        fill="url(#iconBodyGradient)"
      />
      
      {/* Right leg of A */}
      <path 
        d="M44 25C48 32 54 45 56 55C52 55 48 55 44 55L44 25Z" 
        fill="url(#iconBodyGradient)"
      />
      
      {/* Crossbar of A */}
      <path 
        d="M28 42L48 42L46 48L30 48L28 42Z" 
        fill="url(#iconBodyGradient)"
      />
    </svg>
  )
}
