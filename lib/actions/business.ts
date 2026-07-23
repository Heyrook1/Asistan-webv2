'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
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
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#0071E3'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  timezone: z.string().default('Europe/Istanbul'),
  autoConfirmClientAppointments: z.boolean().optional(),
  depositEnabled: z.boolean().optional(),
  depositAmount: z.preprocess(
    (v) => (v === '' || v == null ? null : v),
    z.coerce.number().min(0).max(1_000_000).nullable().optional()
  ),
  noShowFeeEnabled: z.boolean().optional(),
  noShowFeeAmount: z.preprocess(
    (v) => (v === '' || v == null ? null : v),
    z.coerce.number().min(0).max(1_000_000).nullable().optional()
  ),
  noShowFeeNote: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().max(1000).nullable().optional()
  ),
  invoiceEnabled: z.boolean().optional(),
  taxVkn: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().max(32).nullable().optional()
  ),
  taxOffice: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().max(120).nullable().optional()
  ),
  invoiceTitle: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().max(200).nullable().optional()
  ),
  invoiceAddress: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().max(400).nullable().optional()
  ),
  whatsappAgentEnabled: z.boolean().optional(),
})

export async function updateBusinessSettings(input: unknown): Promise<ActionResult> {
  const parsed = businessSchema.partial().safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  if (!session.isOwner) return err('Sadece işletme sahibi bu ayarları değiştirebilir')
  await prisma.business.update({ where: { id: session.businessId }, data: parsed.data })
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'settings.business.update',
    entityType: 'Business',
    entityId: session.businessId,
    severity: 'WARN',
    summary: 'İşletme ayarları güncellendi',
    metadata: { fields: Object.keys(parsed.data) },
  })
  revalidatePath('/dashboard/ayarlar')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/faturalar')
  revalidatePath('/book')
  return ok(undefined)
}
