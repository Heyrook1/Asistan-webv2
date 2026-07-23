/** @type {import('next').NextConfig} */

/**
 * Baseline CSP for next.config headers (fallback for non-proxied paths).
 * Dynamic surfaces (/dashboard, /book, /intake) get a per-request NONCE CSP from
 * proxy.ts → lib/security/response-headers.ts, which overrides this baseline —
 * there script-src drops 'unsafe-inline' in favor of 'nonce-…' + 'strict-dynamic'.
 * Keep directives aligned with buildContentSecurityPolicy() (production, non-embed).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io",
  "media-src 'self' blob: https://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "form-action 'self'",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ')

/** Public booking may be iframe-embedded by clinic HTTPS sites. */
const BOOKING_EMBED_CSP = CONTENT_SECURITY_POLICY.replace(
  "frame-ancestors 'self'",
  'frame-ancestors https:'
)

const baselineSecurityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: CONTENT_SECURITY_POLICY,
  },
]

const nextConfig = {
  // Do not pin LAN IPs here — breaks other developers and leaks network layout.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      'recharts',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: baselineSecurityHeaders,
      },
      {
        // Override CSP for booking so clinic sites can embed (?embed=1).
        // Proxy still sets frame-ancestors 'self' + X-Frame-Options on non-embed book pages.
        source: '/book/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: BOOKING_EMBED_CSP,
          },
        ],
      },
      {
        // X-Frame-Options backup for older browsers — exclude /book/* so embeds work.
        // Modern protection is CSP frame-ancestors (above + proxy).
        source: '/',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
      {
        source: '/((?!book/).*)',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
    ]
  },
  images: {
    // Image optimization enabled (config-level unoptimized flag must stay off).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default nextConfig
