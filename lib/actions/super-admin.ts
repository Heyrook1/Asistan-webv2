'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSuperAdminSession } from '@/lib/session'
import { err, ok, type ActionResult } from '@/lib/actions/result'

const userStatusSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean(),
})

export async function setPlatformUserActive(input: z.infer<typeof userStatusSchema>): Promise<ActionResult<{ userId: string }>> {
  const session = await requireSuperAdminSession()

  const parsed = userStatusSchema.safeParse(input)
  if (!parsed.success) return err('Kullanıcı bilgileri doğrulanamadı', parsed.error.issues)

  if (!parsed.data.isActive && parsed.data.userId === session.userId) {
    return err('Kendi hesabınızı pasife alamazsınız.')
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true },
  })
  if (!target) return err('Kullanıcı bulunamadı.')

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: parsed.data.userId },
      data: { isActive: parsed.data.isActive },
    })

    await tx.teamMember.updateMany({
      where: { userId: parsed.data.userId },
      data: { isActive: parsed.data.isActive },
    })
  })

  revalidatePath('/dashboard/super-admin')
  return ok({ userId: parsed.data.userId })
}
