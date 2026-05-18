'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { TeamRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requirePermission, ROLE_DEFAULT_PERMISSIONS, PERMISSIONS } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const memberSchema = z.object({
  fullName: z.string().trim().min(2, 'Ad soyad en az 2 karakter').max(120),
  email: z.string().trim().email('Geçersiz e-posta'),
  phone: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().min(7).max(40).optional()),
  role: z.enum(['SUPER_ADMIN', 'ISLETME_SAHIBI', 'DOKTOR', 'SEKRETER', 'PERSONEL']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Geçersiz renk').default('#16A9E8'),
  permissions: z.array(z.enum([...PERMISSIONS])).optional(),
})

export async function createTeamMember(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = memberSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('team.manage')
  const role = parsed.data.role as TeamRole
  const permissions =
    parsed.data.permissions && parsed.data.permissions.length
      ? parsed.data.permissions
      : ROLE_DEFAULT_PERMISSIONS[role]

  try {
    const created = await prisma.teamMember.create({
      data: {
        businessId: session.businessId,
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone ?? null,
        role,
        permissions,
        color: parsed.data.color,
      },
    })
    revalidatePath('/dashboard/takim')
    return ok({ id: created.id })
  } catch (e) {
    // Unique constraint (businessId, email)
    return err('Bu e-posta ile kayıtlı bir ekip üyesi zaten var.')
  }
}

const updateSchema = memberSchema.partial().extend({ id: z.string().uuid() })

export async function updateTeamMember(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('team.manage')
  const { id, ...patch } = parsed.data
  const owned = await prisma.teamMember.findFirst({ where: { id, businessId: session.businessId } })
  if (!owned) return err('Üye bulunamadı')
  await prisma.teamMember.update({
    where: { id },
    data: {
      ...patch,
      role: patch.role as TeamRole | undefined,
      permissions: patch.permissions ?? undefined,
    },
  })
  revalidatePath('/dashboard/takim')
  return ok(undefined)
}

const toggleSchema = z.object({ id: z.string().uuid(), isActive: z.boolean() })

export async function setTeamMemberActive(input: unknown): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('team.manage')
  await prisma.teamMember.updateMany({
    where: { id: parsed.data.id, businessId: session.businessId },
    data: { isActive: parsed.data.isActive },
  })
  revalidatePath('/dashboard/takim')
  return ok(undefined)
}

export async function deleteTeamMember(input: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('team.manage')
  // Don't allow deleting yourself (owner) — guard at UI but enforce here too.
  const target = await prisma.teamMember.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
  })
  if (!target) return err('Üye bulunamadı')
  if (target.userId && target.userId === session.userId) return err('Kendinizi silemezsiniz')
  await prisma.teamMember.delete({ where: { id: parsed.data.id } })
  revalidatePath('/dashboard/takim')
  return ok(undefined)
}
