type SecurityHeaderOptions = {
  pathname: string
  embedParam?: string | null
  isDevelopment?: boolean
  /**
   * Per-request CSP nonce (production only). When set, script-src drops
   * 'unsafe-inline' in favor of 'nonce-…' + 'strict-dynamic'. Next.js reads
   * the nonce from the request CSP header and tags its inline scripts.
   */
  nonce?: string | null
}

type HeaderResponse = {
  headers: Headers
}

export function isPublicBookingEmbed(pathname: string, embedParam?: string | null) {
  return (
    pathname.startsWith('/book/') &&
    (embedParam === '1' || embedParam === 'true')
  )
}

export function buildContentSecurityPolicy({
  pathname,
  embedParam,
  isDevelopment = process.env.NODE_ENV === 'development',
  nonce = null,
}: SecurityHeaderOptions) {
  const allowExternalEmbedding = isPublicBookingEmbed(pathname, embedParam)

  // Nonce-based script policy (production). 'strict-dynamic' lets nonce'd
  // framework scripts load their own chunks; 'self' is the CSP2 fallback.
  // Dev keeps 'unsafe-inline' + 'unsafe-eval' (React Refresh / HMR) — adding a
  // nonce would disable 'unsafe-inline' in CSP2+ browsers and break dev.
  const scriptSrc =
    !isDevelopment && nonce
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    scriptSrc,
    // style-src keeps 'unsafe-inline': React SSR emits style="" attributes
    // (Radix/framer-motion), which nonces cannot authorize (nonce covers only
    // <style> elements). Script injection is the XSS vector that matters;
    // this matches standard CSP guidance (nonce scripts, allow inline styles).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io",
    "media-src 'self' blob: https://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "form-action 'self'",
    "frame-src 'self'",
    allowExternalEmbedding ? 'frame-ancestors https:' : "frame-ancestors 'self'",
  ]

  if (!isDevelopment) directives.push('upgrade-insecure-requests')

  return directives.join('; ')
}

/**
 * Routes that are guaranteed dynamically rendered (force-dynamic / session),
 * so Next.js can tag its inline scripts with the per-request nonce.
 * Statically prerendered pages (marketing) must NOT get a nonce policy —
 * their cached HTML has no nonce attributes and would be blocked.
 */
export function isNonceEligiblePath(pathname: string) {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/book/') ||
    pathname.startsWith('/intake/')
  )
}

export function applyResponseSecurityHeaders<T extends HeaderResponse>(
  response: T,
  options: SecurityHeaderOptions
): T {
  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy(options))

  if (isPublicBookingEmbed(options.pathname, options.embedParam)) {
    // X-Frame-Options has no modern allow-list syntax. CSP frame-ancestors
    // permits secure clinic sites to embed this one intentional surface.
    response.headers.delete('X-Frame-Options')
  } else {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  }

  return response
}
