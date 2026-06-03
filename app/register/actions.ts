'use server'

import { prisma } from '@/lib/prisma'

export async function checkDuplicateEmail(email: string) {
  if (!email) return { error: 'Email is required' }
  
  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true }
    })
    return { exists: !!existing }
  } catch (error) {
    console.error('Error checking duplicate email:', error)
    return { error: 'Database verification failed' }
  }
}
