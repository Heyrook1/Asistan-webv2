import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const newsletterSchema = z.object({
  email: z
    .string({ required_error: 'E-posta zorunlu' })
    .email('Geçersiz e-posta adresi'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = newsletterSchema.safeParse(body)

    if (!result.success) {
      const message = result.error.flatten().fieldErrors.email?.[0] ?? 'Geçersiz e-posta'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { email } = result.data

    // Ensure table exists without requiring a schema migration (mirrors waitlist pattern)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
        "id"        TEXT PRIMARY KEY,
        "email"     TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // ON CONFLICT DO NOTHING → duplicate subscriptions silently accepted (no error shown to user)
    await prisma.$executeRawUnsafe(
      `INSERT INTO "NewsletterSubscriber" ("id", "email", "createdAt")
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT ("email") DO NOTHING`,
      crypto.randomUUID(),
      email,
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    console.error('[newsletter] error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
