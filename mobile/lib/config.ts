function normalizeBaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, '') || undefined
}

function getHostname(value: string | undefined) {
  if (!value) return undefined
  try {
    return new URL(value).hostname
  } catch {
    return undefined
  }
}

function isLoopbackHost(hostname: string | undefined) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function inferWebApiBaseUrl() {
  if (typeof window === 'undefined') return undefined
  const protocol = window.location.protocol || 'http:'
  const host = window.location.hostname || 'localhost'
  return `${protocol}//${host}:3000`
}

function resolveWebApiBaseUrl() {
  const webEnvBase = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL_WEB)
  const inferredBase = inferWebApiBaseUrl()

  if (!webEnvBase) return inferredBase
  if (!inferredBase) return webEnvBase

  const webEnvHost = getHostname(webEnvBase)
  const inferredHost = getHostname(inferredBase)

  if (isLoopbackHost(webEnvHost) && inferredHost && !isLoopbackHost(inferredHost)) {
    return inferredBase
  }

  return webEnvBase
}

const isWebRuntime = typeof window !== 'undefined'

export const API_BASE_URL =
  normalizeBaseUrl(isWebRuntime ? resolveWebApiBaseUrl() : undefined) ??
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL) ??
  inferWebApiBaseUrl() ??
  'http://localhost:3000'

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
