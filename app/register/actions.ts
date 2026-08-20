'use server'

import { prisma } from '@/lib/prisma'
import { emailInputSchema } from '@/lib/actions/validation'

export async function checkDuplicateEmail(email: unknown) {
  const parsed = emailInputSchema.safeParse(email)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Geçersiz e-posta' }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.toLowerCase() },
      select: { id: true },
    })
    return { exists: !!existing }
  } catch (error) {
    console.error('Error checking duplicate email:', error)
    return { error: 'Database verification failed' }
  }
}
