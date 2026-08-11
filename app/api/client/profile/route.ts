import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import { z } from 'zod'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { clientIdentityPrisma } from '@/lib/prisma-owner'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().min(7).max(40).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
})

export async function GET(request: NextRequest) {
  let auth
  try {
    auth = await requireClientAuth(request)
  } catch (error) {
    console.error('[api/client/profile] auth failed', error)
    return apiError('Profil oturumu hazırlanamadı', 503)
  }
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  const allowed = await checkRateLimit(
    `poll:client-profile:${auth.clientUser.id}`,
    RATE_LIMITS.poll.limit,
    RATE_LIMITS.poll.window
  )
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  try {
    // Same bootstrap client as requireClientAuth — asistan_app may lack ClientUser RLS.
    const db = clientIdentityPrisma()
    const profile = await db.clientUser.findFirst({
      where: { id: auth.clientUser.id, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        locationLat: true,
        locationLng: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      profile: profile
        ? {
            ...profile,
            locationLat: profile.locationLat != null ? Number(profile.locationLat) : null,
            locationLng: profile.locationLng != null ? Number(profile.locationLng) : null,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
          }
        : null,
    })
  } catch (error) {
    console.error('[api/client/profile] GET failed', error)
    return apiError('Profil yüklenemedi', 500)
  }
}

export async function PUT(request: NextRequest) {
  let auth
  try {
    auth = await requireClientAuth(request)
  } catch (error) {
    console.error('[api/client/profile] auth failed', error)
    return apiError('Profil oturumu hazırlanamadı', 503)
  }
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  const body = await request.json().catch(() => null)
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return apiValidationError('Gecersiz profil verisi', parsed.error.issues, 400)
  }

  const patch = parsed.data
  const db = clientIdentityPrisma()
  try {
    const updated = await db.clientUser.update({
      where: { id: auth.clientUser.id },
      data: {
        fullName: patch.fullName,
        phone: patch.phone ?? undefined,
        email: patch.email?.toLowerCase() ?? patch.email ?? undefined,
        address: patch.address ?? undefined,
        city: patch.city ?? undefined,
        locationLat: patch.locationLat ?? undefined,
        locationLng: patch.locationLng ?? undefined,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        locationLat: true,
        locationLng: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      profile: {
        ...updated,
        locationLat: updated.locationLat != null ? Number(updated.locationLat) : null,
        locationLng: updated.locationLng != null ? Number(updated.locationLng) : null,
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[api/client/profile] PUT failed', error)
    return apiError('Profil kaydedilemedi', 500)
  }
}
