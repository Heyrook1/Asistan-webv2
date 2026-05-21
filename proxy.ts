import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

// Next.js proxy entrypoint. This is not a development HTTP proxy.
// It must stay at the project root so Next can run Supabase session refresh
// before matched requests; implementation details live under lib/supabase.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
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
