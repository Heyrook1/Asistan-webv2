'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const businessSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(2000).optional()),
  phone: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(40).optional()),
  email: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().email().optional()),
  address: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(400).optional()),
  city: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(80).optional()),
  logoUrl: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().url().max(2000).optional()),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#0B7F6F'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  timezone: z.string().default('Europe/Istanbul'),
})

export async function updateBusinessSettings(input: unknown): Promise<ActionResult> {
  const parsed = businessSchema.partial().safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  if (!session.isOwner) return err('Sadece işletme sahibi bu ayarları değiştirebilir')
  await prisma.business.update({ where: { id: session.businessId }, data: parsed.data })
  revalidatePath('/dashboard/ayarlar')
  revalidatePath('/dashboard')
  return ok(undefined)
}
