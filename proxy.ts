import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const CLIENT_API_PREFIX = '/api/client'
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:8081', 'http://127.0.0.1:8081']

function parseOriginList(value: string | undefined) {
  if (!value) return []
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

const ALLOWED_ORIGINS = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...parseOriginList(process.env.CLIENT_API_ALLOWED_ORIGINS),
  ...parseOriginList(process.env.CORS_ALLOWED_ORIGINS),
])

function isDevNetworkOrigin(origin: string) {
  if (process.env.NODE_ENV === 'production') return false
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(?::\d{1,5})?$/.test(
    origin
  )
}

function isAllowedOrigin(origin: string) {
  return ALLOWED_ORIGINS.has(origin) || isDevNetworkOrigin(origin)
}

function isClientApiPath(pathname: string) {
  return pathname === CLIENT_API_PREFIX || pathname.startsWith(`${CLIENT_API_PREFIX}/`)
}

function appendVaryHeader(response: NextResponse, value: string) {
  const existing = response.headers.get('Vary')
  if (!existing) {
    response.headers.set('Vary', value)
    return
  }

  const values = existing
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)

  if (!values.includes(value.toLowerCase())) {
    response.headers.set('Vary', `${existing}, ${value}`)
  }
}

function applyCorsHeaders(
  response: NextResponse,
  origin: string,
  requestHeaders: string | null,
  privateNetworkRequested: boolean
) {
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', requestHeaders ?? 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')

  if (privateNetworkRequested) {
    response.headers.set('Access-Control-Allow-Private-Network', 'true')
  }

  appendVaryHeader(response, 'Origin')
  appendVaryHeader(response, 'Access-Control-Request-Headers')

  return response
}

// Next.js proxy entrypoint. This is not a development HTTP proxy.
// It must stay at the project root so Next can run Supabase session refresh
// before matched requests; implementation details live under lib/supabase.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /dashboard route
  if (pathname.startsWith('/dashboard')) {
    const config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
      key:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        process.env.SUPABASE_PUBLISHABLE_KEY
    }

    if (config.url && config.key) {
      let tempResponse = NextResponse.next({ request })
      const supabase = createServerClient(
        config.url,
        config.key,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
              )
              tempResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                tempResponse.cookies.set(name, value, options),
              )
            },
          },
        }
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email_confirmed_at) {
        const lang = request.cookies.get('asistan-lang')?.value || 'tr'
        const redirectUrl = lang === 'tr' ? '/tr/giris' : '/en/login'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
  }

  // Localized auth route redirects and rewrites
  if (pathname === '/giris') {
    return NextResponse.redirect(new URL('/tr/giris', request.url))
  }
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/en/login', request.url))
  }
  if (pathname === '/kayit') {
    return NextResponse.redirect(new URL('/tr/kayit', request.url))
  }
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/en/register', request.url))
  }

  if (pathname === '/tr/login') {
    return NextResponse.redirect(new URL('/tr/giris', request.url))
  }
  if (pathname === '/en/giris') {
    return NextResponse.redirect(new URL('/en/login', request.url))
  }
  if (pathname === '/tr/register') {
    return NextResponse.redirect(new URL('/tr/kayit', request.url))
  }
  if (pathname === '/en/kayit') {
    return NextResponse.redirect(new URL('/en/register', request.url))
  }

  if (pathname === '/tr/giris') {
    return NextResponse.rewrite(new URL('/tr/auth/login', request.url))
  }
  if (pathname === '/en/login') {
    return NextResponse.rewrite(new URL('/en/auth/login', request.url))
  }
  if (pathname === '/tr/kayit') {
    return NextResponse.rewrite(new URL('/tr/auth/register', request.url))
  }
  if (pathname === '/en/register') {
    return NextResponse.rewrite(new URL('/en/auth/register', request.url))
  }

  if (!isClientApiPath(pathname)) {
    return await updateSession(request)
  }

  const origin = request.headers.get('origin')
  const requestHeaders = request.headers.get('access-control-request-headers')
  const privateNetworkRequested =
    request.headers.get('access-control-request-private-network') === 'true'

  if (!origin || !isAllowedOrigin(origin)) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 403 })
    }
    return await updateSession(request)
  }

  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 })
    return applyCorsHeaders(preflightResponse, origin, requestHeaders, privateNetworkRequested)
  }

  const response = await updateSession(request)
  return applyCorsHeaders(response, origin, requestHeaders, privateNetworkRequested)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
