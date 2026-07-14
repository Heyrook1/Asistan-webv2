/**
 * CORS allowlist helpers for /api/client (mobile + web).
 * Origins come from CLIENT_API_ALLOWED_ORIGINS / CORS_ALLOWED_ORIGINS plus localhost defaults.
 */

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:8081', 'http://127.0.0.1:8081']

export function parseOriginList(value: string | undefined | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

export function isDevNetworkOrigin(origin: string, nodeEnv = process.env.NODE_ENV): boolean {
  if (nodeEnv === 'production') return false
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(?::\d{1,5})?$/.test(
    origin
  )
}

export function buildAllowedOrigins(env: {
  clientApi?: string | null
  cors?: string | null
} = {}): Set<string> {
  return new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...parseOriginList(env.clientApi ?? process.env.CLIENT_API_ALLOWED_ORIGINS),
    ...parseOriginList(env.cors ?? process.env.CORS_ALLOWED_ORIGINS),
  ])
}

export function isAllowedOrigin(
  origin: string,
  allowed: Set<string> = buildAllowedOrigins(),
  nodeEnv = process.env.NODE_ENV
): boolean {
  return allowed.has(origin) || isDevNetworkOrigin(origin, nodeEnv)
}
