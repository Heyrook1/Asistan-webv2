import { getLoginPath, getRegisterPath, normalizeAuthLanguage } from '@/lib/auth-routes'
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function authLanguageFromRequest(request: NextRequest) {
  return normalizeAuthLanguage(request.cookies.get('asistan-lang')?.value)
}

/** Redirect while keeping ?query (e.g. reason=package-expired). */
function redirectWithSearch(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url)
}

import { buildAllowedOrigins, isAllowedOrigin as originIsAllowed } from '@/lib/cors'

const CLIENT_API_PREFIX = '/api/client'
const ALLOWED_ORIGINS = buildAllowedOrigins()

function isAllowedOrigin(origin: string) {
  return originIsAllowed(origin, ALLOWED_ORIGINS)
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
        const redirectUrl = getLoginPath(authLanguageFromRequest(request))
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
  }

  // Localized auth route redirects and rewrites
  if (pathname === '/auth/login') {
    return redirectWithSearch(request, getLoginPath(authLanguageFromRequest(request)))
  }
  if (pathname === '/auth/sign-up') {
    return redirectWithSearch(request, getRegisterPath(authLanguageFromRequest(request)))
  }
  if (pathname === '/giris') {
    return redirectWithSearch(request, '/tr/giris')
  }
  if (pathname === '/login') {
    return redirectWithSearch(request, getLoginPath(authLanguageFromRequest(request)))
  }
  if (pathname === '/kayit') {
    return redirectWithSearch(request, '/tr/kayit')
  }
  if (pathname === '/register') {
    return redirectWithSearch(request, getRegisterPath(authLanguageFromRequest(request)))
  }

  if (pathname === '/tr/login') {
    return redirectWithSearch(request, '/tr/giris')
  }
  if (pathname === '/en/giris') {
    return redirectWithSearch(request, '/en/login')
  }
  if (pathname === '/tr/register') {
    return redirectWithSearch(request, '/tr/kayit')
  }
  if (pathname === '/en/kayit') {
    return redirectWithSearch(request, '/en/register')
  }

  if (pathname === '/tr/giris') {
    return NextResponse.rewrite(new URL('/tr/auth/login' + request.nextUrl.search, request.url))
  }
  if (pathname === '/en/login') {
    return NextResponse.rewrite(new URL('/en/auth/login' + request.nextUrl.search, request.url))
  }
  if (pathname === '/tr/kayit') {
    return NextResponse.rewrite(new URL('/tr/auth/register' + request.nextUrl.search, request.url))
  }
  if (pathname === '/en/register') {
    return NextResponse.rewrite(new URL('/en/auth/register' + request.nextUrl.search, request.url))
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
