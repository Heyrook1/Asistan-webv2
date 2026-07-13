import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

function parseEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=')
          return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')]
        }),
    )
  } catch {
    return {}
  }
}

Object.assign(process.env, parseEnvFile('.env'), parseEnvFile('.env.local'))

const prisma = new PrismaClient()

async function main() {
  const business = await prisma.business.findUnique({
    where: { slug: 'asistan-demo-klinigi' },
    include: {
      vendorAccount: true,
      members: {
        select: { email: true, fullName: true, isActive: true, role: true },
        orderBy: { fullName: 'asc' },
      },
    },
  })

  if (!business?.vendorAccount) throw new Error('Demo klinik / vendor account bulunamadi')

  console.log('Once:', {
    plan: business.vendorAccount.plan,
    isDemo: business.vendorAccount.isDemo,
    status: business.vendorAccount.status,
  })
  console.log(
    'Aktif uyeler:',
    business.members.filter((m) => m.isActive).map((m) => `${m.fullName} <${m.email}>`),
  )

  const updated = await prisma.vendorAccount.update({
    where: { businessId: business.id },
    data: {
      plan: 'PROFESSIONAL',
      isDemo: false,
      status: 'ACTIVE',
      accessEndAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      packageDurationDays: 365,
      notes: 'Test clinic for Demo@asistan.online — PROFESSIONAL (5 users)',
    },
  })

  console.log('Sonra:', {
    plan: updated.plan,
    isDemo: updated.isDemo,
    status: updated.status,
    accessEndAt: updated.accessEndAt,
  })
  console.log('Limit: PROFESSIONAL = 5 aktif kullanici')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
