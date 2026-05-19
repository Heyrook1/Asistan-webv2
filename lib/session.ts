import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { Prisma, TeamRole } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_LABELS,
  type Permission,
  type SessionContext,
  can,
} from '@/lib/rbac'

export { PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS, can }
export type { Permission, SessionContext }

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[ığüşöç]/g, (c) => ({ ı: 'i', ğ: 'g', ü: 'u', ş: 's', ö: 'o', ç: 'c' }[c] || c))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Resolves the current Supabase session into our domain session. Cached per
 * request so multiple Server Components can share the result.
 *
 * Returns null if the visitor is not signed in.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser?.email) return null

  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ||
    (authUser.user_metadata?.name as string | undefined) ||
    authUser.email.split('@')[0]

  let user = await prisma.user.findFirst({
    where: { OR: [{ id: authUser.id }, { email: authUser.email }] },
  })

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email,
          fullName,
          avatarUrl: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        user = await prisma.user.findUnique({ where: { email: authUser.email } })
      }
      if (!user) throw error
    }
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: authUser.email,
        fullName: user.fullName || fullName,
        avatarUrl: (authUser.user_metadata?.avatar_url as string | undefined) ?? user.avatarUrl,
      },
    })
  }

  if (!user.isActive) return null

  const ownedBusiness = await prisma.business.findUnique({ where: { ownerUserId: user.id } })
  const membership = await prisma.teamMember.findFirst({
    where: {
      OR: [{ userId: user.id }, { email: user.email }],
      isActive: true,
      business: { isActive: true },
    },
    include: { business: true },
    orderBy: { createdAt: 'asc' },
  })

  let business = ownedBusiness ?? membership?.business ?? null

  // Bootstrap a Business only for brand-new owner signups, not invited team members.
  if (!business) {
    const baseSlug = slugify(fullName || 'klinik') || 'klinik'
    let slug = baseSlug
    let suffix = 1
    while (await prisma.business.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }
    business = await prisma.business.create({
      data: {
        name: `${fullName} Kliniği`,
        slug,
        ownerUserId: user.id,
        email: authUser.email,
      },
    })
    await prisma.teamMember.create({
      data: {
        businessId: business.id,
        userId: user.id,
        fullName,
        email: authUser.email,
        role: TeamRole.ISLETME_SAHIBI,
        permissions: [...ROLE_DEFAULT_PERMISSIONS.ISLETME_SAHIBI],
      },
    })
  } else {
    if (membership && !membership.userId) {
      await prisma.teamMember.update({
        where: { id: membership.id },
        data: { userId: user.id },
      })
    }
    await prisma.teamMember.updateMany({
      where: { businessId: business.id, userId: user.id },
      data: { lastSeenAt: new Date() },
    })
  }

  const currentMembership = await prisma.teamMember.findFirst({
    where: {
      businessId: business.id,
      isActive: true,
      OR: [{ userId: user.id }, { email: user.email }],
    },
  })

  const isOwner = business.ownerUserId === user.id
  if (!isOwner && !currentMembership) return null

  const role = (currentMembership?.role ?? (isOwner ? TeamRole.ISLETME_SAHIBI : TeamRole.PERSONEL)) as TeamRole
  const explicit = (currentMembership?.permissions ?? []) as Permission[]
  const permissions = Array.from(
    new Set<Permission>([...(ROLE_DEFAULT_PERMISSIONS[role] ?? []), ...explicit])
  )

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    businessId: business.id,
    businessName: business.name,
    role,
    permissions,
    isOwner,
  }
})

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  return session
}

export async function requirePermission(permission: Permission): Promise<SessionContext> {
  const session = await requireSession()
  if (!session.permissions.includes(permission)) redirect('/dashboard')
  return session
}
