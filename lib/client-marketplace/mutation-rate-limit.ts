import 'server-only'

import type { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Auth'd client write endpoints — per-user + per-IP caps (abuse / double-submit).
 */
export async function rateLimitClientMutation(
  request: NextRequest,
  action: 'bookings' | 'cancel' | 'reschedule' | 'reviews' | 'profile' | 'notifications',
  clientUserId: string,
  limit = 20,
  window = '1 m'
): Promise<boolean> {
  const ip = clientIp(request)
  const userOk = await checkRateLimit(`client-mut:${action}:u:${clientUserId}`, limit, window)
  if (!userOk) return false
  // Shared NAT: looser IP bucket so households aren't blocked together.
  return checkRateLimit(`client-mut:${action}:ip:${ip}`, limit * 5, window)
}
