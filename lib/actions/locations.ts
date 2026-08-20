'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
import { requireSession } from '@/lib/session'
import { canManageClinicSettings } from '@/lib/settings/tabs'
import { ok, err, type ActionResult } from './result'
import { LOCATION_SETUP_HREF } from '@/lib/locations/constants'

export { LOCATION_SETUP_HREF }

const optionalString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().trim().max(400).optional()
)

const createSchema = z.object({
  name: z.string().trim().min(2, 'Şube adı en az 2 karakter olmalı').max(120),
  address: optionalString,
  city: optionalString,
  phone: optionalString,
})

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
})

function assertCanManageLocations(session: Parameters<typeof canManageClinicSettings>[0]) {
  if (!canManageClinicSettings(session)) {
    return 'Sadece işletme yöneticisi şube ekleyebilir veya düzenleyebilir'
  }
  return null
}

export async function createLocation(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const ownerError = assertCanManageLocations(session)
  if (ownerError) return err(ownerError)

  const created = await prisma.location.create({
    data: {
      businessId: session.businessId,
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      phone: parsed.data.phone ?? null,
      isActive: true,
      sortOrder: 0,
    },
    select: { id: true },
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'location.create',
    entityType: 'Location',
    entityId: created.id,
    severity: 'INFO',
    summary: `Şube oluşturuldu: ${parsed.data.name}`,
  })

  revalidatePath('/dashboard/ayarlar')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/book')
  return ok({ id: created.id })
}

export async function updateLocation(rawInput: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const ownerError = assertCanManageLocations(session)
  if (ownerError) return err(ownerError)

  const owned = await prisma.location.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    select: { id: true },
  })
  if (!owned) return err('Şube bulunamadı')

  await prisma.location.updateMany({
    where: { id: parsed.data.id, businessId: session.businessId },
    data: {
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      city: parsed.data.city ?? null,
      phone: parsed.data.phone ?? null,
      ...(parsed.data.isActive === undefined ? {} : { isActive: parsed.data.isActive }),
    },
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'location.update',
    entityType: 'Location',
    entityId: parsed.data.id,
    severity: 'INFO',
    summary: `Şube güncellendi: ${parsed.data.name}`,
  })

  revalidatePath('/dashboard/ayarlar')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/book')
  return ok(undefined)
}
