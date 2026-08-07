'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { NotificationType, TeamRole } from '@prisma/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { tenantTransaction } from '@/lib/security/tenant-db-context'
import { writeAuditLog } from '@/lib/audit'
import { requirePermission, requireSession, can, ROLE_DEFAULT_PERMISSIONS, PERMISSIONS, ROLE_LABELS } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'
import { ok, err, type ActionResult } from './result'
import { createNotification } from '@/lib/notifications/service'
import { getVendorPlanName, getVendorPlanUserLimit } from '@/lib/vendor-membership'

const memberSchema = z.object({
  fullName: z.string().trim().min(2, 'Ad soyad en az 2 karakter').max(120),
  email: z.string().trim().email('Gecersiz e-posta'),
  phone: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().min(7).max(40).optional()
  ),
  role: z.enum(['SUPER_ADMIN', 'ISLETME_SAHIBI', 'DOKTOR', 'SEKRETER', 'PERSONEL']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Gecersiz renk').default('#16A9E8'),
  permissions: z.array(z.enum([...PERMISSIONS])).optional(),
  sendInvite: z.boolean().optional().default(true),
  password: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().min(6, 'Şifre en az 6 karakter olmalı').max(128).optional()
  ),
})

async function getSiteOrigin() {
  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin

  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return null
  const protocol = h.get('x-forwarded-proto') ?? 'http'
  return `${protocol}://${host}`
}

function isAuthUserNotFound(error: Error) {
  const authError = error as Error & { status?: number; code?: string }
  const message = error.message.toLowerCase()
  return authError.status === 404 || authError.code === 'user_not_found' || message.includes('user not found')
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient()
  if (!admin) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')

  const normalizedEmail = email.toLowerCase()
  const adminWithEmailLookup = admin.auth.admin as typeof admin.auth.admin & {
    getUserByEmail?: (email: string) => Promise<{ data: { user: SupabaseUser | null }; error: Error | null }>
  }

  if (typeof adminWithEmailLookup.getUserByEmail === 'function') {
    const { data, error } = await adminWithEmailLookup.getUserByEmail(normalizedEmail)
    if (error && isAuthUserNotFound(error)) return null
    if (error) throw error
    return data.user
  }

  const url = new URL('/auth/v1/admin/users', env.supabaseUrl)
  url.searchParams.set('email', normalizedEmail)

  const response = await fetch(url, {
    headers: {
      apikey: env.supabaseServiceRoleKey!,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Supabase auth email lookup failed: HTTP ${response.status}`)
  }

  const payload = (await response.json()) as { user?: SupabaseUser | null; users?: SupabaseUser[] }
  return payload.user ?? payload.users?.find((user) => user.email?.toLowerCase() === normalizedEmail) ?? null
}

function authUserMetadata(input: {
  fullName: string
  role: TeamRole
  businessId: string
}) {
  return {
    full_name: input.fullName,
    role: 'provider',
    team_role: input.role,
    business_id: input.businessId,
  }
}

async function inviteAuthUser(input: {
  email: string
  fullName: string
  role: TeamRole
  businessId: string
  password?: string
}) {
  const admin = createAdminClient()
  if (!admin) return null

  const existing = await findAuthUserByEmail(input.email)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      user_metadata: {
        ...existing.user_metadata,
        ...authUserMetadata(input),
      },
      password: input.password,
      email_confirm: input.password ? true : undefined,
    })
    return { id: existing.id, invitationSent: false }
  }

  if (input.password) {
    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: authUserMetadata(input),
    })
    if (error) throw error
    if (!data.user?.id) throw new Error('Supabase did not return a created user')

    return { id: data.user.id, invitationSent: false }
  }

  const origin = await getSiteOrigin()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: origin ? `${origin}/auth/setup-password` : undefined,
    data: authUserMetadata(input),
  })
  if (error) throw error
  if (!data.user?.id) throw new Error('Supabase did not return an invited user')

  return { id: data.user.id, invitationSent: true }
}

export async function createTeamMember(input: unknown): Promise<ActionResult<{ id: string; invitationSent: boolean }>> {
  const parsed = memberSchema.safeParse(input)
  if (!parsed.success) return err('Form hatali', parsed.error.issues)
  const session = await requirePermission('team.create')
  // SUPER_ADMIN is a platform-level role and can never be assigned via tenant team actions.
  if (parsed.data.role === 'SUPER_ADMIN') {
    return err('SUPER_ADMIN platform rolu ekip yonetimi uzerinden atanamaz.')
  }
  if (!session.isOwner && parsed.data.role === 'ISLETME_SAHIBI') {
    return err('Bu rol yalnizca isletme sahibi tarafindan atanabilir.')
  }

  const role = parsed.data.role as TeamRole
  const permissions =
    parsed.data.permissions && parsed.data.permissions.length
      ? parsed.data.permissions
      : ROLE_DEFAULT_PERMISSIONS[role]

  try {
    const email = parsed.data.email.toLowerCase()
    const existingMember = await prisma.teamMember.findUnique({
      where: { businessId_email: { businessId: session.businessId, email } },
      select: { id: true },
    })
    if (existingMember) {
      return err('Bu e-posta ile kayitli bir ekip uyesi zaten var.')
    }

    try {
      const [vendorAccount, activeMemberCount] = await Promise.all([
        prisma.vendorAccount.findUnique({
          where: { businessId: session.businessId },
          select: { plan: true, isDemo: true },
        }),
        prisma.teamMember.count({
          where: { businessId: session.businessId, isActive: true },
        }),
      ])

      const userLimit = getVendorPlanUserLimit({
        plan: vendorAccount?.plan,
        isDemo: vendorAccount?.isDemo,
      })

      if (userLimit !== null && activeMemberCount >= userLimit) {
        if (vendorAccount?.isDemo || userLimit === 1) {
          return err('Bu hesap en fazla 1 aktif kullaniciya izin verir. Yeni kullanici icin paket yukseltin.')
        }
        return err(
          `${getVendorPlanName(vendorAccount?.plan)} paketi en fazla ${userLimit} aktif kullaniciya izin verir.`
        )
      }
    } catch (limitError) {
      const message = limitError instanceof Error ? limitError.message : String(limitError)
      if (!message.includes('P2021') && !message.includes('does not exist')) {
        throw limitError
      }
    }

    let authUser: { id: string; invitationSent: boolean } | null = null
    if (parsed.data.password || parsed.data.sendInvite) {
      try {
        authUser = await inviteAuthUser({
          email,
          fullName: parsed.data.fullName,
          role,
          businessId: session.businessId,
          password: parsed.data.password,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : ''
        if (parsed.data.password && message.includes('invalid api key')) {
          return err(
            'Yönetici tarafından şifre belirlemek için geçerli Supabase admin anahtarı gerekir. SUPABASE_SECRET_KEY veya SUPABASE_SERVICE_ROLE_KEY değerini düzeltin.'
          )
        }
        if (!message.includes('invalid api key')) throw error
      }
    }

    const created = await tenantTransaction(session.businessId, async (tx) => {
      let user = await tx.user.findUnique({ where: { email } })
      if (!user) {
        user = await tx.user.create({
          data: {
            id: authUser?.id,
            email,
            fullName: parsed.data.fullName,
            phone: parsed.data.phone ?? null,
          },
        })
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            fullName: parsed.data.fullName,
            phone: parsed.data.phone ?? user.phone,
            isActive: true,
          },
        })
      }

      return tx.teamMember.upsert({
        where: {
          businessId_email: {
            businessId: session.businessId,
            email,
          },
        },
        update: {
          userId: user.id,
          fullName: parsed.data.fullName,
          email,
          phone: parsed.data.phone ?? null,
          role,
          permissions,
          color: parsed.data.color,
          isActive: true,
          deletedAt: null,
        },
        create: {
          businessId: session.businessId,
          userId: user.id,
          fullName: parsed.data.fullName,
          email,
          phone: parsed.data.phone ?? null,
          role,
          permissions,
          color: parsed.data.color,
        },
      })
    })

    const business = await prisma.business.findUnique({
      where: { id: session.businessId },
      select: { ownerUserId: true },
    })
    await createNotification({
      businessId: session.businessId,
      recipientUserIds: [business?.ownerUserId],
      roles: ['ISLETME_SAHIBI'],
      excludeUserId: session.userId,
      actorUserId: session.userId,
      type: NotificationType.TEAM,
      subtype: 'team_member_added',
      title: 'Yeni ekip üyesi eklendi',
      message: `${parsed.data.fullName} (${ROLE_LABELS[role]}) ekibe katıldı.`,
      entityType: 'team_member',
      entityId: created.id,
      link: '/dashboard/takim',
      metadata: {
        teamMemberId: created.id,
        fullName: parsed.data.fullName,
        email,
        role,
        invitationSent: authUser?.invitationSent ?? false,
        addedBy: session.fullName,
      },
    })

    revalidatePath('/dashboard/takim')
    revalidatePath('/dashboard/bildirimler')
    return ok({ id: created.id, invitationSent: authUser?.invitationSent ?? false })
  } catch (e) {
    if (e instanceof Error && e.message === 'SUPABASE_SERVICE_ROLE_KEY is not configured') {
      return err('Ekip uyesi girisi olusturmak icin SUPABASE_SERVICE_ROLE_KEY ayarlanmali.')
    }
    return err(e instanceof Error ? e.message : 'Ekip uyesi olusturulamadi.')
  }
}

const updateSchema = memberSchema.omit({ password: true, sendInvite: true }).partial().extend({ id: z.string().uuid() })

export async function updateTeamMember(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) return err('Form hatali', parsed.error.issues)
  const session = await requireSession()
  const { id, ...patch } = parsed.data
  const owned = await prisma.teamMember.findFirst({ where: { id, businessId: session.businessId } })
  if (!owned) return err('Uye bulunamadi')
  if (patch.role && patch.role !== owned.role && !can(session, 'team.role.edit')) {
    return err('Rol duzenleme yetkiniz yok')
  }
  if (patch.permissions && !can(session, 'team.permission.edit')) {
    return err('Yetki duzenleme yetkiniz yok')
  }
  const profileChanged = patch.fullName !== undefined || patch.email !== undefined || patch.phone !== undefined || patch.color !== undefined
  if (profileChanged && !can(session, 'team.manage')) {
    return err('Ekip uyesi duzenleme yetkiniz yok')
  }
  // SUPER_ADMIN is a platform-level role and can never be assigned via tenant team actions.
  if (patch.role === 'SUPER_ADMIN') {
    return err('SUPER_ADMIN platform rolu ekip yonetimi uzerinden atanamaz.')
  }
  if (!session.isOwner && patch.role === 'ISLETME_SAHIBI') {
    return err('Bu rol yalnizca isletme sahibi tarafindan atanabilir.')
  }
  await prisma.teamMember.update({
    where: { id },
    data: {
      ...patch,
      role: patch.role as TeamRole | undefined,
      permissions: patch.permissions ?? undefined,
    },
  })

  const roleChanged = patch.role && patch.role !== owned.role
  const permissionsChanged =
    patch.permissions &&
    JSON.stringify([...patch.permissions].sort()) !==
      JSON.stringify([...(owned.permissions as string[])].sort())

  if ((roleChanged || permissionsChanged) && owned.userId) {
    await createNotification({
      businessId: session.businessId,
      recipientUserId: owned.userId,
      actorUserId: session.userId,
      type: NotificationType.TEAM,
      subtype: 'permission_changed',
      title: 'Yetkileriniz güncellendi',
      message: roleChanged
        ? `Rolünüz ${ROLE_LABELS[patch.role as TeamRole]} olarak güncellendi.`
        : 'Hesabınıza tanımlı yetkiler güncellendi.',
      entityType: 'team_member',
      entityId: id,
      link: '/dashboard/takim',
      metadata: {
        teamMemberId: id,
        previousRole: owned.role,
        newRole: patch.role ?? owned.role,
        changedBy: session.fullName,
      },
    })
  }

  revalidatePath('/dashboard/takim')
  revalidatePath('/dashboard/bildirimler')
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'team.member.update',
    entityType: 'TeamMember',
    entityId: id,
    severity: 'WARN',
    summary: 'Takım üyesi güncellendi',
    metadata: {
      previousRole: owned.role,
      newRole: patch.role ?? owned.role,
    },
  })
  return ok(undefined)
}

const rolePermissionsSchema = z.object({
  role: z.enum(['DOKTOR', 'SEKRETER', 'PERSONEL']),
  permissions: z.array(z.enum([...PERMISSIONS])),
})

export async function updateRolePermissions(input: unknown): Promise<ActionResult<{ updated: number }>> {
  const parsed = rolePermissionsSchema.safeParse(input)
  if (!parsed.success) return err('Gecersiz girdi', parsed.error.issues)
  const session = await requirePermission('team.permission.edit')
  const result = await prisma.teamMember.updateMany({
    where: {
      businessId: session.businessId,
      role: parsed.data.role as TeamRole,
    },
    data: { permissions: parsed.data.permissions },
  })
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'team.permission.update',
    entityType: 'TeamRole',
    entityId: parsed.data.role,
    severity: 'CRITICAL',
    summary: `${parsed.data.role} rol yetkileri güncellendi`,
    metadata: {
      role: parsed.data.role,
      permissions: parsed.data.permissions,
      updatedCount: result.count,
    },
  })
  revalidatePath('/dashboard/takim')
  return ok({ updated: result.count })
}

const toggleSchema = z.object({ id: z.string().uuid(), isActive: z.boolean() })

export async function setTeamMemberActive(input: unknown): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input)
  if (!parsed.success) return err('Gecersiz girdi', parsed.error.issues)
  const session = await requirePermission('team.manage')

  if (parsed.data.isActive) {
    const target = await prisma.teamMember.findFirst({
      where: { id: parsed.data.id, businessId: session.businessId },
      select: { id: true, isActive: true },
    })
    if (!target) return err('Uye bulunamadi')

    try {
      const [vendorAccount, activeMemberCount] = await Promise.all([
        prisma.vendorAccount.findUnique({
          where: { businessId: session.businessId },
          select: { plan: true, isDemo: true },
        }),
        prisma.teamMember.count({
          where: { businessId: session.businessId, isActive: true },
        }),
      ])

      const userLimit = getVendorPlanUserLimit({
        plan: vendorAccount?.plan,
        isDemo: vendorAccount?.isDemo,
      })
      const projectedActiveCount = activeMemberCount + (target.isActive ? 0 : 1)

      if (userLimit !== null && projectedActiveCount > userLimit) {
        if (vendorAccount?.isDemo || userLimit === 1) {
          return err('Bu hesap en fazla 1 aktif kullaniciya izin verir.')
        }
        return err(
          `${getVendorPlanName(vendorAccount?.plan)} paketi en fazla ${userLimit} aktif kullaniciya izin verir.`
        )
      }
    } catch (limitError) {
      const message = limitError instanceof Error ? limitError.message : String(limitError)
      if (!message.includes('P2021') && !message.includes('does not exist')) {
        throw limitError
      }
    }
  }

  await prisma.teamMember.updateMany({
    where: { id: parsed.data.id, businessId: session.businessId },
    data: { isActive: parsed.data.isActive },
  })
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'team.access.change',
    entityType: 'TeamMember',
    entityId: parsed.data.id,
    severity: 'CRITICAL',
    summary: parsed.data.isActive ? 'Takım üyesi erişimi açıldı' : 'Takım üyesi erişimi durduruldu',
    metadata: { isActive: parsed.data.isActive },
  })
  revalidatePath('/dashboard/takim')
  return ok(undefined)
}

const resetPasswordSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı').max(128),
})

export async function resetTeamMemberPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) return err('Gecersiz girdi', parsed.error.issues)
  const session = await requirePermission('team.manage')
  const target = await prisma.teamMember.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    include: { user: true },
  })
  if (!target) return err('Uye bulunamadi')
  if (target.userId === session.userId) return err('Kendi sifrenizi buradan sifirlayamazsiniz')

  const admin = createAdminClient()
  if (!admin) {
    return err(
      'Şifre sıfırlama için Supabase admin anahtarı gerekir. SUPABASE_SECRET_KEY veya SUPABASE_SERVICE_ROLE_KEY ayarlanmalı.'
    )
  }

  try {
    const existingAuthUser = await findAuthUserByEmail(target.email.toLowerCase())
    let authUserId = existingAuthUser?.id ?? null

    if (!authUserId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: target.email.toLowerCase(),
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: authUserMetadata({
          fullName: target.fullName,
          role: target.role,
          businessId: target.businessId,
        }),
      })
      if (error) throw error
      authUserId = data.user?.id ?? null
    } else {
      const { error } = await admin.auth.admin.updateUserById(authUserId, {
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          ...(target.user ? { full_name: target.user.fullName } : {}),
          ...authUserMetadata({
            fullName: target.fullName,
            role: target.role,
            businessId: target.businessId,
          }),
        },
      })
      if (error) throw error
    }

    if (!authUserId) return err('Supabase kullanicisi olusturulamadi')

    await tenantTransaction(session.businessId, async (tx) => {
      let user = await tx.user.findUnique({ where: { email: target.email.toLowerCase() } })
      if (!user) {
        user = await tx.user.create({
          data: {
            id: authUserId,
            email: target.email.toLowerCase(),
            fullName: target.fullName,
            phone: target.phone,
          },
        })
      } else if (user.id !== authUserId) {
        user = await tx.user.update({
          where: { id: user.id },
          data: { fullName: target.fullName, phone: target.phone ?? user.phone, isActive: true },
        })
      }

      await tx.teamMember.update({
        where: { id: target.id },
        data: { userId: user.id },
      })
    })

    revalidatePath('/dashboard/takim')
    return ok(undefined)
  } catch (e) {
    if (e instanceof Error && e.message.toLowerCase().includes('invalid api key')) {
      return err('Supabase admin anahtari gecersiz. SUPABASE_SECRET_KEY veya SUPABASE_SERVICE_ROLE_KEY degerini duzeltin.')
    }
    return err(e instanceof Error ? e.message : 'Şifre sıfırlanamadı.')
  }
}

export async function deleteTeamMember(input: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Gecersiz girdi', parsed.error.issues)
  const session = await requirePermission('team.manage')
  const target = await prisma.teamMember.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
  })
  if (!target) return err('Uye bulunamadi')
  if (target.userId && target.userId === session.userId) return err('Kendinizi silemezsiniz')
  await prisma.teamMember.updateMany({
    where: { id: parsed.data.id, businessId: session.businessId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  })
  revalidatePath('/dashboard/takim')
  return ok(undefined)
}
