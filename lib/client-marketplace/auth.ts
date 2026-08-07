import 'server-only'

/**
 * Hasta / marketplace istemci kimliği (Asistan Rezervasyon).
 *
 * Bearer (Authorization) veya cookie ile Supabase kullanıcıyı doğrular;
 * `ClientUser` satırını upsert eder. Klinik `requireSession` ile karıştırma —
 * burada `businessId` tenant oturumu yok; klinik verisi ayrı scoped API’lerde.
 */

import { Prisma } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'

export type ClientAuthContext = {
  authUserId: string
  accessToken: string
  email: string | null
  fullName: string
  clientUser: {
    id: string
    fullName: string
    email: string | null
    phone: string | null
    city: string | null
  }
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization') ?? request.headers.get('Authorization')
  if (!header) return null
  const [type, token] = header.split(' ')
  if (!type || type.toLowerCase() !== 'bearer' || !token) return null
  return token.trim()
}

function normalizeEmail(email: string | null | undefined) {
  if (!email) return null
  const normalized = email.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

function pickDisplayName(authUser: {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}) {
  const fromMeta =
    (authUser.user_metadata?.full_name as string | undefined) ||
    (authUser.user_metadata?.name as string | undefined)
  if (fromMeta && fromMeta.trim().length > 0) return fromMeta.trim()
  if (authUser.email) return authUser.email.split('@')[0]
  return 'Misafir Kullanici'
}

async function upsertClientUser(input: {
  authUserId: string
  email: string | null
  fullName: string
}) {
  const byAuthId = await prisma.clientUser.findFirst({
    where: { authUserId: input.authUserId },
    select: { id: true, fullName: true, email: true, phone: true, city: true },
  })

  if (byAuthId) {
    const nextName = byAuthId.fullName || input.fullName
    const shouldUpdate = byAuthId.fullName !== nextName || byAuthId.email !== input.email
    if (shouldUpdate) {
      const updated = await prisma.clientUser.update({
        where: { id: byAuthId.id },
        data: {
          fullName: nextName,
          email: input.email,
        },
        select: { id: true, fullName: true, email: true, phone: true, city: true },
      })
      return updated
    }
    return byAuthId
  }

  if (input.email) {
    // Only adopt an *orphan* ClientUser (no authUserId yet, e.g. created via guest
    // booking). Never re-point a row that is already bound to a different auth user —
    // that would be an email-based account takeover.
    const byEmail = await prisma.clientUser.findFirst({
      where: { email: input.email, authUserId: null },
      select: { id: true, fullName: true, email: true, phone: true, city: true },
    })

    if (byEmail) {
      return prisma.clientUser.update({
        where: { id: byEmail.id },
        data: {
          authUserId: input.authUserId,
          fullName: byEmail.fullName || input.fullName,
        },
        select: { id: true, fullName: true, email: true, phone: true, city: true },
      })
    }
  }

  return prisma.clientUser.create({
    data: {
      authUserId: input.authUserId,
      fullName: input.fullName,
      email: input.email,
    },
    select: { id: true, fullName: true, email: true, phone: true, city: true },
  })
}

export async function requireClientAuth(request: NextRequest): Promise<ClientAuthContext | null> {
  const accessToken = getBearerToken(request)
  if (!accessToken) return null

  const admin = createAdminClient()
  if (!admin) return null

  const { data, error } = await admin.auth.getUser(accessToken)
  if (error || !data.user) return null

  const authUser = data.user
  // Require a confirmed identity before minting a client session (mirrors clinic staff
  // requirement in lib/session.ts). Prefer email confirmation; allow phone-only signups
  // that have a confirmed phone. Unconfirmed accounts are rejected.
  const confirmedAt = authUser.email_confirmed_at ?? authUser.phone_confirmed_at ?? null
  if (!confirmedAt) return null

  const email = normalizeEmail(authUser.email)
  const fullName = pickDisplayName({
    email: authUser.email,
    user_metadata: authUser.user_metadata as Record<string, unknown> | null,
  })

  try {
    const clientUser = await upsertClientUser({
      authUserId: authUser.id,
      email,
      fullName,
    })

    return {
      authUserId: authUser.id,
      accessToken,
      email,
      fullName,
      clientUser,
    }
  } catch (error) {
    // Unique collisions can happen in first-login races; recover by loading
    // the row again and continuing the request.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.clientUser.findFirst({
        where: {
          OR: [
            { authUserId: authUser.id },
            // email fallback only matches orphan rows (no takeover of bound accounts)
            ...(email ? [{ email, authUserId: null }] : []),
          ],
        },
        select: { id: true, fullName: true, email: true, phone: true, city: true },
      })
      if (existing) {
        return {
          authUserId: authUser.id,
          accessToken,
          email,
          fullName,
          clientUser: existing,
        }
      }
    }
    throw error
  }
}

