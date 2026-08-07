/**
 * Auth callback / login return path allowlist.
 * Rejects open redirects (absolute URLs, protocol-relative, path escape).
 */

const ALLOWED_PREFIXES = [
  '/client',
  '/auth/reset-password',
  '/auth/setup-password',
  '/dashboard',
  '/book',
  '/tr',
  '/en',
] as const

export function sanitizeReturnPath(
  raw: string | null | undefined,
  fallback = '/',
): string {
  if (!raw) return fallback
  let path = raw.trim()
  if (!path.startsWith('/')) return fallback
  if (path.startsWith('//')) return fallback
  if (path.includes('://')) return fallback
  if (path.includes('\\')) return fallback
  // Strip CR/LF and null bytes
  if (/[\0\r\n]/.test(path)) return fallback

  // Normalize: keep query/hash only after first ?
  const qIndex = path.indexOf('?')
  const hIndex = path.indexOf('#')
  let pathname = path
  let suffix = ''
  if (qIndex >= 0) {
    pathname = path.slice(0, qIndex)
    suffix = path.slice(qIndex)
  } else if (hIndex >= 0) {
    pathname = path.slice(0, hIndex)
    suffix = path.slice(hIndex)
  }

  if (pathname.includes('..')) return fallback

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  if (!allowed && pathname !== '/') return fallback

  return `${pathname}${suffix}`
}
