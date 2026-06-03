import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { Prisma, TeamRole } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { addDays, DEMO_PLAN_CODE, DEMO_TRIAL_DAYS } from '@/lib/vendor-membership'
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

type SessionBlockReason = 'package_expired' | null
type SessionResolution = {
  session: SessionContext | null
  blockedReason: SessionBlockReason
}

type VendorAccountDelegate = {
  findUnique: typeof prisma.vendorAccount.findUnique
  create: typeof prisma.vendorAccount.create
  update: typeof prisma.vendorAccount.update
}

function getVendorAccountDelegate(): VendorAccountDelegate | null {
  const delegate = (prisma as { vendorAccount?: VendorAccountDelegate }).vendorAccount
  if (!delegate) {
    console.error('Prisma delegate "vendorAccount" is unavailable. Run prisma generate and restart the server.')
    return null
  }
  return delegate
}

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

async function createSelfSignupDemoVendorAccount(businessId: string) {
  const vendorAccount = getVendorAccountDelegate()
  if (!vendorAccount) return

  const exists = await vendorAccount.findUnique({
    where: { businessId },
    select: { id: true },
  })
  if (exists) return

  const accessStartAt = new Date()
  await vendorAccount.create({
    data: {
      businessId,
      source: 'SELF_SIGNUP',
      isDemo: true,
      status: 'TRIAL',
      plan: DEMO_PLAN_CODE,
      accessStartAt,
      accessEndAt: addDays(accessStartAt, DEMO_TRIAL_DAYS),
      packageDurationDays: DEMO_TRIAL_DAYS,
    },
  })
}

async function ensureVendorAccessState(input: {
  businessId: string
  businessIsActive: boolean
  role: TeamRole
}): Promise<SessionBlockReason> {
  if (input.role === TeamRole.SUPER_ADMIN) return null

  const vendorAccount = getVendorAccountDelegate()
  if (!vendorAccount) return input.businessIsActive ? null : 'package_expired'

  const account = await vendorAccount.findUnique({
    where: { businessId: input.businessId },
    select: {
      id: true,
      status: true,
      accessEndAt: true,
    },
  })

  if (!account) {
    return input.businessIsActive ? null : 'package_expired'
  }

  const now = new Date()
  const expired = !!account.accessEndAt && account.accessEndAt.getTime() <= now.getTime()

  if (expired && (account.status === 'TRIAL' || account.status === 'ACTIVE')) {
    await prisma.$transaction([
      vendorAccount.update({
        where: { id: account.id },
        data: { status: 'SUSPENDED' },
      }),
      prisma.business.update({
        where: { id: input.businessId },
        data: { isActive: false },
      }),
    ])
    return 'package_expired'
  }

  if (account.status === 'SUSPENDED' || account.status === 'CANCELLED' || !input.businessIsActive) {
    return 'package_expired'
  }

  return null
}

const resolveSession = cache(async (): Promise<SessionResolution> => {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser?.email) return { session: null, blockedReason: null }
  if (!authUser.email_confirmed_at) return { session: null, blockedReason: null }

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
    const nextFullName = user.fullName || fullName
    const nextAvatar = (authUser.user_metadata?.avatar_url as string | undefined) ?? user.avatarUrl
    const shouldUpdateUser =
      user.email !== authUser.email || user.fullName !== nextFullName || user.avatarUrl !== nextAvatar

    if (shouldUpdateUser) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: authUser.email,
          fullName: nextFullName,
          avatarUrl: nextAvatar,
        },
      })
    }
  }

  if (!user.isActive) return { session: null, blockedReason: null }

  const [ownedBusiness, membership] = await Promise.all([
    prisma.business.findUnique({ where: { ownerUserId: user.id } }),
    prisma.teamMember.findFirst({
      where: {
        OR: [{ userId: user.id }, { email: user.email }],
        isActive: true,
      },
      include: { business: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

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
    await prisma.teamMember.upsert({
      where: {
        businessId_email: {
          businessId: business.id,
          email: authUser.email,
        },
      },
      create: {
        businessId: business.id,
        userId: user.id,
        fullName,
        email: authUser.email,
        role: TeamRole.ISLETME_SAHIBI,
        permissions: [...ROLE_DEFAULT_PERMISSIONS.ISLETME_SAHIBI],
      },
      update: {
        userId: user.id,
        fullName,
        role: TeamRole.ISLETME_SAHIBI,
        permissions: [...ROLE_DEFAULT_PERMISSIONS.ISLETME_SAHIBI],
        isActive: true,
        deletedAt: null,
      },
    })
    await createSelfSignupDemoVendorAccount(business.id)
  } else {
    if (membership && !membership.userId) {
      await prisma.teamMember.update({
        where: { id: membership.id },
        data: { userId: user.id },
      })
    }
  }

  const isOwner = business.ownerUserId === user.id
  const currentMembership = isOwner
    ? null
    : await prisma.teamMember.findFirst({
        where: {
          businessId: business.id,
          isActive: true,
          OR: [{ userId: user.id }, { email: user.email }],
        },
      })

  if (!isOwner && !currentMembership) return { session: null, blockedReason: null }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
  if (currentMembership && (!currentMembership.lastSeenAt || currentMembership.lastSeenAt < fiveMinAgo)) {
    await prisma.teamMember.update({
      where: { id: currentMembership.id },
      data: { lastSeenAt: new Date() },
    })
  }

  const role = (currentMembership?.role ?? (isOwner ? TeamRole.ISLETME_SAHIBI : TeamRole.PERSONEL)) as TeamRole

  const blockedReason = await ensureVendorAccessState({
    businessId: business.id,
    businessIsActive: business.isActive,
    role,
  })
  if (blockedReason) return { session: null, blockedReason }

  const explicit = (currentMembership?.permissions ?? []) as Permission[]
  const permissions =
    isOwner || role === TeamRole.SUPER_ADMIN
      ? [...PERMISSIONS]
      : explicit.length > 0
        ? explicit
        : [...(ROLE_DEFAULT_PERMISSIONS[role] ?? [])]

  return {
    blockedReason: null,
    session: {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      businessId: business.id,
      businessName: business.name,
      role,
      permissions,
      isOwner,
      staffMemberId: currentMembership?.id ?? null,
    },
  }
})

/**
 * Resolves the current Supabase session into our domain session. Cached per
 * request so multiple Server Components can share the result.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const resolved = await resolveSession()
  return resolved.session
})

export const getSessionBlockReason = cache(async (): Promise<SessionBlockReason> => {
  const resolved = await resolveSession()
  return resolved.blockedReason
})

export async function requireSession(): Promise<SessionContext> {
  const resolved = await resolveSession()
  if (!resolved.session) {
    if (resolved.blockedReason === 'package_expired') {
      redirect('/auth/login?reason=package-expired')
    }
    redirect('/auth/login')
  }
  return resolved.session
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

function getSystemAdminEmails() {
  const raw = process.env.SYSTEM_ADMIN_EMAILS ?? ''
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function isSystemAdmin(session: SessionContext | null) {
  if (!session) return false
  const allowlist = getSystemAdminEmails()
  if (allowlist.size > 0) {
    return allowlist.has(session.email.toLowerCase())
  }
  return session.role === TeamRole.SUPER_ADMIN
}

export function isSuperAdmin(session: SessionContext | null) {
  return !!session && session.role === TeamRole.SUPER_ADMIN
}

export async function requireSystemAdminSession(): Promise<SessionContext> {
  const session = await requireSession()
  if (!isSystemAdmin(session)) redirect('/dashboard')
  return session
}

export async function requireSuperAdminSession(): Promise<SessionContext> {
  const session = await requireSession()
  if (!isSuperAdmin(session)) redirect('/dashboard')
  return session
}
