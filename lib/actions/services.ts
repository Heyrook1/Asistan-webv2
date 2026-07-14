'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Hizmet adı en az 2 karakter').max(120),
  description: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(2000).optional()),
  category: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(80).optional()),
  durationMin: z.coerce.number().int().min(5, 'En az 5 dk').max(720),
  price: z.coerce.number().min(0).max(1_000_000),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Geçersiz renk').default('#0071E3'),
  isActive: z.boolean().optional().default(true),
})

export async function createService(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('service.manage')
  const created = await prisma.service.create({
    data: {
      businessId: session.businessId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      durationMin: parsed.data.durationMin,
      price: new Prisma.Decimal(parsed.data.price),
      currency: parsed.data.currency,
      color: parsed.data.color,
      isActive: parsed.data.isActive ?? true,
    },
  })
  revalidatePath('/dashboard/hizmetler')
  revalidatePath('/dashboard')
  return ok({ id: created.id })
}

const updateSchema = serviceSchema.partial().extend({ id: z.string().uuid() })

export async function updateService(rawInput: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('service.manage')
  const { id, ...patch } = parsed.data
  const owned = await prisma.service.findFirst({ where: { id, businessId: session.businessId } })
  if (!owned) return err('Hizmet bulunamadı')
  await prisma.service.update({
    where: { id },
    data: {
      ...patch,
      price: patch.price !== undefined ? new Prisma.Decimal(patch.price) : undefined,
    },
  })
  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}

export async function toggleServiceActive(rawInput: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid(), isActive: z.boolean() })
  const parsed = schema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('service.manage')
  await prisma.service.updateMany({
    where: { id: parsed.data.id, businessId: session.businessId },
    data: { isActive: parsed.data.isActive },
  })
  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}

export async function deleteService(rawInput: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('service.manage')
  // If appointments exist, just disable instead of failing.
  const used = await prisma.appointment.count({
    where: { serviceId: parsed.data.id, businessId: session.businessId },
  })
  if (used > 0) {
    await prisma.service.updateMany({
      where: { id: parsed.data.id, businessId: session.businessId },
      data: { isActive: false },
    })
    revalidatePath('/dashboard/hizmetler')
    return ok(undefined)
  }
  await prisma.service.deleteMany({
    where: { id: parsed.data.id, businessId: session.businessId },
  })
  revalidatePath('/dashboard/hizmetler')
  return ok(undefined)
}
