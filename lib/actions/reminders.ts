'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const priorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH'])

const dueAtSchema = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.coerce.date().optional()
)

const createSchema = z.object({
  title: z.string().trim().min(1, 'Başlık gerekli').max(200),
  note: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().max(2000).optional()
  ),
  dueAt: dueAtSchema,
  priority: priorityEnum.optional().default('NORMAL'),
})

export async function createReminder(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const created = await prisma.reminder.create({
    data: {
      businessId: session.businessId,
      userId: session.userId,
      title: parsed.data.title,
      note: parsed.data.note ?? null,
      dueAt: parsed.data.dueAt ?? null,
      priority: parsed.data.priority,
    },
  })
  revalidatePath('/dashboard')
  return ok({ id: created.id })
}

const toggleSchema = z.object({
  id: z.string().uuid(),
  isDone: z.boolean(),
})

export async function toggleReminder(rawInput: unknown): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const owned = await prisma.reminder.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId, userId: session.userId },
    select: { id: true },
  })
  if (!owned) return err('Hatırlatma bulunamadı')
  await prisma.reminder.update({
    where: { id: parsed.data.id },
    data: { isDone: parsed.data.isDone },
  })
  revalidatePath('/dashboard')
  return ok(undefined)
}

const updateSchema = createSchema.partial().extend({ id: z.string().uuid() })

export async function updateReminder(rawInput: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const { id, ...patch } = parsed.data
  const owned = await prisma.reminder.findFirst({
    where: { id, businessId: session.businessId, userId: session.userId },
    select: { id: true },
  })
  if (!owned) return err('Hatırlatma bulunamadı')
  await prisma.reminder.update({
    where: { id },
    data: {
      title: patch.title,
      note: patch.note ?? undefined,
      dueAt: patch.dueAt ?? undefined,
      priority: patch.priority,
    },
  })
  revalidatePath('/dashboard')
  return ok(undefined)
}

const deleteSchema = z.object({ id: z.string().uuid() })

export async function deleteReminder(rawInput: unknown): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const owned = await prisma.reminder.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId, userId: session.userId },
    select: { id: true },
  })
  if (!owned) return err('Hatırlatma bulunamadı')
  await prisma.reminder.delete({ where: { id: parsed.data.id } })
  revalidatePath('/dashboard')
  return ok(undefined)
}
