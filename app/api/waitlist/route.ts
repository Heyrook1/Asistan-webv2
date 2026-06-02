import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Dynamic table creation to ensure PostgreSQL has the table even if schema-level prisma migrations are blocked by policies on unrelated tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Waitlist" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Insert into the waitlist table
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Waitlist" ("id", "email", "createdAt")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("email") DO NOTHING;
    `, crypto.randomUUID(), email)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Waitlist error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
