import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import { z } from 'zod'

import { can } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { resolveOrCreatePerson } from '@/lib/identity/resolve'
import { getSession } from '@/lib/session'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bodySchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().nullable(),
  identityNumber: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
})

/** Staff: resolve or create ecosystem Person (does not create clinic Patient). */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return apiError('Unauthorized', 401)
  }

  // Creating/linking global identity requires patient write capability (not view-only).
  if (!can(session, 'patient.create') && !can(session, 'patient.edit')) {
    return apiError('Forbidden', 403)
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(`identity-resolve:${session.userId}:${ip}`, 20, '1 m')
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return apiValidationError('Invalid body', parsed.error.issues, 400)
  }

  const result = await prisma.$transaction((tx) => resolveOrCreatePerson(tx, parsed.data))
  return NextResponse.json({
    ok: true,
    personId: result.personId,
    gpiDisplay: result.gpiDisplay,
    created: result.created,
  })
}
