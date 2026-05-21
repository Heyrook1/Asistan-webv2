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

async function createBootstrapBusiness(input: {
  baseSlug: string
  fullName: string
  ownerUserId: string
  email: string
}) {
  let slug = input.baseSlug
  let suffix = 1

  for (let attempt = 0; attempt < 5; attempt += 1) {
    while (await prisma.business.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${input.baseSlug}-${suffix}`
    }

    try {
      return await prisma.business.create({
        data: {
          name: `${input.fullName} Kliniği`,
          slug,
          ownerUserId: input.ownerUserId,
          email: input.email,
        },
      })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
        throw error
      }

      const owned = await prisma.business.findUnique({ where: { ownerUserId: input.ownerUserId } })
      if (owned) return owned

      suffix += 1
      slug = `${input.baseSlug}-${suffix}-${Date.now().toString(36)}`
    }
  }

  return prisma.business.create({
    data: {
      name: `${input.fullName} Kliniği`,
      slug: `${input.baseSlug}-${Date.now().toString(36)}`,
      ownerUserId: input.ownerUserId,
      email: input.email,
    },
  })
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
    business = await createBootstrapBusiness({
      baseSlug,
      fullName,
      ownerUserId: user.id,
      email: authUser.email,
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

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
  if (currentMembership && (!currentMembership.lastSeenAt || currentMembership.lastSeenAt < fiveMinAgo)) {
    await prisma.teamMember.update({
      where: { id: currentMembership.id },
      data: { lastSeenAt: new Date() },
    })
  }

  const role = (currentMembership?.role ?? (isOwner ? TeamRole.ISLETME_SAHIBI : TeamRole.PERSONEL)) as TeamRole
  const explicit = (currentMembership?.permissions ?? []) as Permission[]
  const permissions =
    isOwner || role === TeamRole.SUPER_ADMIN
      ? [...PERMISSIONS]
      : explicit.length > 0
        ? explicit
        : [...(ROLE_DEFAULT_PERMISSIONS[role] ?? [])]

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    businessId: business.id,
    businessName: business.name,
    role,
    permissions,
    isOwner,
    staffMemberId: currentMembership?.id ?? null,
  }
})

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  return session
}

export async function requirePermission(permission: Permission): Promise<SessionContext> {
  const session = await requireSession()
  if (session.isOwner || session.role === TeamRole.SUPER_ADMIN) return session
  if (!session.permissions.includes(permission)) {
    throw new Error('Bu işlem için yetkiniz yok')
  }
  return session
}

export async function requirePagePermission(permission: Permission): Promise<SessionContext> {
  const session = await requireSession()
  if (session.isOwner || session.role === TeamRole.SUPER_ADMIN) return session
  if (!session.permissions.includes(permission)) redirect('/dashboard')
  return session
}

export async function requirePageAnyPermission(
  ...permissions: Permission[]
): Promise<SessionContext> {
  const session = await requireSession()
  if (session.isOwner || session.role === TeamRole.SUPER_ADMIN) return session
  if (!permissions.some((p) => session.permissions.includes(p))) redirect('/dashboard')
  return session
}
