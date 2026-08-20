'use client'

import { useId } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

function AsistanMarkSvg({ className }: { className?: string }) {
  const gradId = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="20" y1="20" x2="100" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <g stroke="#06B6D4" strokeWidth="8" strokeLinecap="round">
        <line x1="16" y1="56" x2="38" y2="56" />
        <line x1="8" y1="72" x2="32" y2="72" />
        <line x1="20" y1="88" x2="36" y2="88" />
      </g>
      <circle cx="68" cy="20" r="10" fill="#06B6D4" />
      <path
        d="M68 34 C 64 34, 60 36, 58 40 L 36 110 C 35 113, 37 116, 40 116 L 52 116 C 54 116, 56 115, 57 113 L 61 100 L 78 100 C 77 96, 76 92, 74 88 L 65 88 L 71 70 C 72 67, 73 65, 74 63 C 77 71, 81 84, 85 95 C 87 102, 89 109, 90 113 C 91 115, 93 116, 95 116 L 106 116 C 109 116, 111 113, 110 110 L 86 40 C 84 36, 78 34, 73 34 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M68 42 C 70 42, 72 43, 73 45 L 76 53 C 73 53, 70 53, 68 53 C 66 53, 64 53, 62 53 L 65 45 C 66 43, 67 42, 68 42 Z"
        fill="#FFFFFF"
        fillOpacity="0.18"
      />
    </svg>
  )
}

/**
 * Clinic panel brand lockup for dark navy shells.
 * Inline SVG mark + wordmark type — no white/navy PNG plates.
 */
export function DashboardBrandLockup({
  href = '/dashboard',
  className,
  compact = false,
}: {
  href?: string
  className?: string
  /** Mobile topbar: tighter horizontal layout */
  compact?: boolean
}) {
  if (compact) {
    return (
      <Link
        href={href}
        aria-label="Asistan Health paneli"
        className={cn('inline-flex min-w-0 items-center gap-2.5', className)}
      >
        <AsistanMarkSvg className="h-7 w-7 shrink-0" />
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate text-[14px] font-semibold tracking-tight text-brand-ink">
            asistan
          </span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-brand-blue/70">
            Health
          </span>
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      aria-label="Asistan Health paneli"
      className={cn(
        'group inline-flex min-w-0 items-center gap-3 outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand-blue/50 focus-visible:ring-offset-0',
        className,
      )}
    >
      <AsistanMarkSvg className="h-10 w-10 shrink-0" />
      <span className="flex min-w-0 flex-col gap-1.5 leading-none">
        <span className="truncate text-[18px] font-semibold tracking-tight text-white">
          asistan
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-sky-200/55">
          Health
        </span>
      </span>
    </Link>
  )
}
