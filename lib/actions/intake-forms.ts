'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { tenantTransaction } from '@/lib/security/tenant-db-context'
import { requirePermission } from '@/lib/session'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { intakeFieldsSchema } from '@/lib/intake/schema'
import { regenerateIntakeInviteToken } from '@/lib/intake/invites'
import { entityIdSchema } from '@/lib/actions/validation'

const formSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(2000).optional()),
  fields: intakeFieldsSchema,
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
})

export async function createIntakeForm(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = formSchema.safeParse(raw)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('service.manage')

  const created = await tenantTransaction(session.businessId, async (tx) => {
    if (parsed.data.isDefault) {
      await tx.intakeForm.updateMany({
        where: { businessId: session.businessId, isDefault: true },
        data: { isDefault: false },
      })
    }
    return tx.intakeForm.create({
      data: {
        businessId: session.businessId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        fields: parsed.data.fields as Prisma.InputJsonValue,
        isActive: parsed.data.isActive ?? true,
        isDefault: parsed.data.isDefault ?? false,
      },
      select: { id: true },
    })
  })

  revalidatePath('/dashboard/anketler')
  revalidatePath('/dashboard/hizmetler')
  return ok({ id: created.id })
}

export async function updateIntakeForm(raw: unknown): Promise<ActionResult> {
  const parsed = formSchema.partial().extend({ id: z.string().uuid() }).safeParse(raw)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('service.manage')
  const { id, ...patch } = parsed.data

  const owned = await prisma.intakeForm.findFirst({
    where: { id, businessId: session.businessId, deletedAt: null },
    select: { id: true },
  })
  if (!owned) return err('Anket bulunamadı')

  await tenantTransaction(session.businessId, async (tx) => {
    if (patch.isDefault) {
      await tx.intakeForm.updateMany({
        where: { businessId: session.businessId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }
    await tx.intakeForm.updateMany({
      where: { id, businessId: session.businessId },
      data: {
        name: patch.name,
        description: patch.description === undefined ? undefined : patch.description ?? null,
        fields: patch.fields ? (patch.fields as Prisma.InputJsonValue) : undefined,
        isActive: patch.isActive,
        isDefault: patch.isDefault,
      },
    })
  })

  revalidatePath('/dashboard/anketler')
  revalidatePath(`/dashboard/anketler/${id}`)
  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}

export async function deleteIntakeForm(id: string): Promise<ActionResult> {
  const parsed = entityIdSchema.safeParse(id)
  if (!parsed.success) return err('Geçersiz kimlik', parsed.error.issues)
  const session = await requirePermission('service.manage')
  const owned = await prisma.intakeForm.findFirst({
    where: { id: parsed.data, businessId: session.businessId, deletedAt: null },
    select: { id: true },
  })
  if (!owned) return err('Anket bulunamadı')

  await prisma.intakeForm.updateMany({
    where: { id: parsed.data, businessId: session.businessId },
    data: { deletedAt: new Date(), isActive: false, isDefault: false },
  })
  await prisma.service.updateMany({
    where: { businessId: session.businessId, intakeFormId: parsed.data },
    data: { intakeFormId: null },
  })

  revalidatePath('/dashboard/anketler')
  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}

export async function assignIntakeFormToService(raw: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      serviceId: z.string().uuid(),
      intakeFormId: z.preprocess(
        (v) => (v === '' || v === null ? null : v),
        z.string().uuid().nullable()
      ),
    })
    .safeParse(raw)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('service.manage')

  const service = await prisma.service.findFirst({
    where: { id: parsed.data.serviceId, businessId: session.businessId },
    select: { id: true },
  })
  if (!service) return err('Hizmet bulunamadı')

  if (parsed.data.intakeFormId) {
    const form = await prisma.intakeForm.findFirst({
      where: { id: parsed.data.intakeFormId, businessId: session.businessId, deletedAt: null },
      select: { id: true },
    })
    if (!form) return err('Anket bulunamadı')
  }

  await prisma.service.updateMany({
    where: { id: parsed.data.serviceId, businessId: session.businessId },
    data: { intakeFormId: parsed.data.intakeFormId },
  })

  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}

export async function createOrRefreshIntakeLink(
  appointmentId: string
): Promise<ActionResult<{ intakeUrl: string; formName: string }>> {
  const parsed = entityIdSchema.safeParse(appointmentId)
  if (!parsed.success) return err('Geçersiz randevu kimliği', parsed.error.issues)
  const session = await requirePermission('appointment.manage')
  const result = await regenerateIntakeInviteToken({
    businessId: session.businessId,
    appointmentId: parsed.data,
  })
  if (!result) return err('Randevu bulunamadı')
  if ('error' in result) return err(result.error)
  if (!result.intakeUrl) return err('Bu hizmet için anket tanımlı değil')

  revalidatePath('/dashboard/hastalar')
  revalidatePath('/dashboard/ajanda')
  return ok({ intakeUrl: result.intakeUrl, formName: result.formName })
}
