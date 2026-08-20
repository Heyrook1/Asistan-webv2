import 'server-only'

/**
 * Klinik panel oturumu (Asistan Health).
 *
 * Supabase Auth → TeamMember / VendorAccount çözümler; RBAC izinleri,
 * demo paket süresi ve support-mode çerezi burada birleşir.
 * Sayfa/API koruması: `requireSession` / `requirePermission` / `requirePagePermission`.
 * Hasta (client) auth ayrıdır → `lib/client-marketplace/auth.ts`.
 */

import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Prisma, TeamRole } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sessionPrisma } from '@/lib/prisma-owner'
import { addDays, DEMO_PLAN_CODE, DEMO_TRIAL_DAYS } from '@/lib/vendor-membership'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { SUPPORT_BUSINESS_COOKIE, isSupportModeCookie } from '@/lib/support-mode'
import { parseSystemAdminEmails } from '@/lib/system-admin-emails'
import {
  PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_LABELS,
  type Permission,
  type SessionContext,
  can,
  canAny,
  canAccessTeam,
  canViewFinance,
  FINANCE_VIEW_PERMISSION,
  TEAM_ACCESS_PERMISSIONS,
  isPrivilegedClinicAdmin,
} from '@/lib/rbac'

export {
  PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  ROLE_LABELS,
  can,
  canAny,
  canAccessTeam,
  canViewFinance,
  FINANCE_VIEW_PERMISSION,
  TEAM_ACCESS_PERMISSIONS,
  isPrivilegedClinicAdmin,
  parseSystemAdminEmails,
}
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

function getVendorAccountDelegate(
  client: typeof prisma = sessionPrisma()
): VendorAccountDelegate | null {
  const delegate = (client as { vendorAccount?: VendorAccountDelegate }).vendorAccount
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
  const db = sessionPrisma()
  let slug = input.baseSlug
  let suffix = 1

  for (let attempt = 0; attempt < 5; attempt += 1) {
    while (await db.business.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${input.baseSlug}-${suffix}`
    }

    try {
      return await db.business.create({
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

      const owned = await db.business.findUnique({ where: { ownerUserId: input.ownerUserId } })
      if (owned) return owned

      suffix += 1
      slug = `${input.baseSlug}-${suffix}-${Date.now().toString(36)}`
    }
  }

  return db.business.create({
    data: {
      name: `${input.fullName} Kliniği`,
      slug: `${input.baseSlug}-${Date.now().toString(36)}`,
      ownerUserId: input.ownerUserId,
      email: input.email,
    },
  })
}

async function createSelfSignupDemoVendorAccount(businessId: string) {
  const db = sessionPrisma()
  const vendorAccount = getVendorAccountDelegate(db)
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

  const db = sessionPrisma()
  const vendorAccount = getVendorAccountDelegate(db)
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
    await db.$transaction([
      vendorAccount.update({
        where: { id: account.id },
        data: { status: 'SUSPENDED' },
      }),
      db.business.update({
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

  // Owner/migrate client when runtime is asistan_app — User INSERT is denied by auth.uid RLS.
  const db = sessionPrisma()

  let user = await db.user.findFirst({
    where: { OR: [{ id: authUser.id }, { email: authUser.email }] },
  })

  if (!user) {
    try {
      user = await db.user.create({
        data: {
          id: authUser.id,
          email: authUser.email,
          fullName,
          avatarUrl: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        user = await db.user.findUnique({ where: { email: authUser.email } })
      }
      if (!user) throw error
    }
  } else {
    const nextFullName = user.fullName || fullName
    const nextAvatar = (authUser.user_metadata?.avatar_url as string | undefined) ?? user.avatarUrl
    const shouldUpdateUser =
      user.email !== authUser.email || user.fullName !== nextFullName || user.avatarUrl !== nextAvatar

    if (shouldUpdateUser) {
      user = await db.user.update({
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
    db.business.findUnique({ where: { ownerUserId: user.id } }),
    db.teamMember.findFirst({
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
    await db.teamMember.upsert({
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
      await db.teamMember.update({
        where: { id: membership.id },
        data: { userId: user.id },
      })
    }
  }

  const isOwner = business.ownerUserId === user.id
  const currentMembership = isOwner
    ? null
    : await db.teamMember.findFirst({
        where: {
          businessId: business.id,
          isActive: true,
          OR: [{ userId: user.id }, { email: user.email }],
        },
      })

  if (!isOwner && !currentMembership) return { session: null, blockedReason: null }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
  if (currentMembership && (!currentMembership.lastSeenAt || currentMembership.lastSeenAt < fiveMinAgo)) {
    await db.teamMember.update({
      where: { id: currentMembership.id },
      data: { lastSeenAt: new Date() },
    })
  }

  const role = (currentMembership?.role ?? (isOwner ? TeamRole.ISLETME_SAHIBI : TeamRole.PERSONEL)) as TeamRole
  let resolvedBusiness = business
  let resolvedIsOwner = isOwner
  let supportMode: SessionContext['supportMode'] = null

  if (role === TeamRole.SUPER_ADMIN && isFeatureEnabled('supportMode')) {
    try {
      const jar = await cookies()
      const supportId = jar.get(SUPPORT_BUSINESS_COOKIE)?.value
      if (isSupportModeCookie(supportId)) {
        const target = await db.business.findUnique({ where: { id: supportId! } })
        if (target) {
          resolvedBusiness = target
          resolvedIsOwner = false
          supportMode = { businessId: target.id, businessName: target.name }
        }
      }
    } catch {
      // cookies() unavailable in some contexts — ignore support override
    }
  }

  const blockedReason = supportMode
    ? null
    : await ensureVendorAccessState({
        businessId: resolvedBusiness.id,
        businessIsActive: resolvedBusiness.isActive,
        role,
      })
  if (blockedReason) return { session: null, blockedReason }

  const explicit = (currentMembership?.permissions ?? []) as Permission[]
  // ISLETME_SAHIBI / owner / super-admin always get the live capability matrix.
  // Stale TeamMember.permissions JSON must not strip newly added keys (e.g. team.view).
  const permissions =
    resolvedIsOwner || role === TeamRole.SUPER_ADMIN || role === TeamRole.ISLETME_SAHIBI
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
      businessId: resolvedBusiness.id,
      businessName: resolvedBusiness.name,
      role,
      permissions,
      isOwner: resolvedIsOwner,
      staffMemberId: currentMembership?.id ?? null,
      supportMode,
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
  if (!can(session, permission)) {
    throw new Error('Bu işlem için yetkiniz yok')
  }
  return session
}

function forbiddenRedirect(need: string) {
  redirect(`/dashboard/yetkisiz?need=${encodeURIComponent(need)}`)
}

export async function requirePagePermission(permission: Permission): Promise<SessionContext> {
  const session = await requireSession()
  if (!can(session, permission)) {
    forbiddenRedirect(permission)
  }
  return session
}

export async function requirePageAnyPermission(
  ...permissions: Permission[]
): Promise<SessionContext> {
  const session = await requireSession()
  if (!canAny(session, permissions)) {
    forbiddenRedirect(permissions.join(','))
  }
  return session
}

function getSystemAdminEmails() {
  return parseSystemAdminEmails(process.env.SYSTEM_ADMIN_EMAILS)
}

export function isSystemAdmin(session: SessionContext | null) {
  if (!session) return false
  const allowlist = getSystemAdminEmails()
  if (allowlist.size > 0) {
    return allowlist.has(session.email.toLowerCase())
  }
  // Fail closed in production: with no explicit allowlist configured, do NOT trust the
  // tenant-assignable SUPER_ADMIN role as proof of platform admin. Only dev/test may fall back.
  if (process.env.NODE_ENV === 'production') {
    return false
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
