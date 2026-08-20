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
          return [
            line.slice(0, index).trim(),
            line.slice(index + 1).trim().replace(/^["']|["']$/g, ''),
          ]
        }),
    )
  } catch {
    return {}
  }
}

const env = { ...parseEnvFile('.env'), ...parseEnvFile('.env.local'), ...process.env }
const url =
  env.DATABASE_URL_MIGRATE?.trim() ||
  env.DIRECT_URL?.trim() ||
  env.DATABASE_URL?.trim()

const prisma = new PrismaClient({ datasources: { db: { url } } })

const slugs = [
  'lefkosa-asistan-test',
  'girne-asistan-test',
  'magusa-asistan-test',
  'asistan-demo-klinigi',
]

const biz = await prisma.business.findMany({
  where: { slug: { in: slugs } },
  select: {
    slug: true,
    city: true,
    isActive: true,
    deletedAt: true,
    vendorAccount: { select: { isDemo: true, status: true } },
  },
})
console.log('businesses', biz)

const docs = await prisma.teamMember.findMany({
  where: {
    role: 'DOKTOR',
    isActive: true,
    isBookable: true,
    business: { slug: { in: slugs } },
  },
  select: {
    fullName: true,
    email: true,
    deletedAt: true,
    business: { select: { slug: true, city: true } },
    _count: { select: { availabilityRules: true, serviceAssignments: true } },
  },
})
console.log('doctors', docs)

await prisma.$disconnect()
