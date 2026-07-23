/**
 * Ensures a clinic test user exists in Supabase Auth + Prisma.
 *
 *   node scripts/ensure-test-user.mjs --i-know-this-bypasses-rls
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (Auth Admin). Remote targets require confirmation.
 */
import { readFileSync } from 'node:fs'
import { PrismaClient, TeamRole } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { requireElevatedOps } from './lib/privilege-guard.mjs'

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

const env = {
  ...parseEnvFile('.env'),
  ...parseEnvFile('.env.local'),
  ...process.env,
}

requireElevatedOps({
  script: 'ensure-test-user',
  purpose: 'Create/update Auth users + clinic fixtures via service_role',
  surfaces: ['supabase-service-role', 'postgres-owner'],
  env,
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL veya admin anahtari eksik.')
}

const CONFIG = {
  email: 'Demo@asistan.online',
  password: 'Demo123',
  fullName: 'Demo Kullanici',
  clinic: {
    slug: 'asistan-demo-klinigi',
    name: 'Asistan Demo Klinigi',
    phone: '+90 212 555 0100',
    address: 'Bagdat Cad. No:120 Kadikoy',
    city: 'Istanbul',
  },
}

const OWNER_PERMISSIONS = [
  'patient.view',
  'patient.edit',
  'patient.create',
  'medical_note.view',
  'medical_note.create',
  'appointment.manage',
  'appointment.view',
  'appointment.create',
  'appointment.edit',
  'appointment.cancel',
  'team.manage',
  'team.create',
  'team.role.edit',
  'team.permission.edit',
  'analytics.view',
  'service.manage',
  'file.view',
  'file.upload',
]

const prisma = new PrismaClient()
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findAuthUserByEmail(email) {
  const normalized = email.toLowerCase()
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error
  return data.users.find((user) => user.email?.toLowerCase() === normalized) ?? null
}

async function ensureAuthUser() {
  const existing = await findAuthUserByEmail(CONFIG.email)
  if (existing?.id) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      email: CONFIG.email,
      password: CONFIG.password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        full_name: CONFIG.fullName,
        role: 'clinic',
      },
    })
    if (error) throw error
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: CONFIG.email,
    password: CONFIG.password,
    email_confirm: true,
    user_metadata: {
      full_name: CONFIG.fullName,
      role: 'clinic',
    },
  })
  if (error) throw error
  if (!data.user?.id) throw new Error('Auth user olusturulamadi')
  return data.user.id
}

async function ensurePrismaUser(authUserId) {
  const byEmail = await prisma.user.findUnique({ where: { email: CONFIG.email } })
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        fullName: CONFIG.fullName,
        isActive: true,
      },
    })
  }

  const byId = await prisma.user.findUnique({ where: { id: authUserId } })
  if (byId) {
    return prisma.user.update({
      where: { id: byId.id },
      data: {
        email: CONFIG.email,
        fullName: CONFIG.fullName,
        isActive: true,
      },
    })
  }

  return prisma.user.create({
    data: {
      id: authUserId,
      email: CONFIG.email,
      fullName: CONFIG.fullName,
      isActive: true,
    },
  })
}

async function ensureBusiness(ownerUserId) {
  const existing = await prisma.business.findUnique({ where: { slug: CONFIG.clinic.slug } })
  if (existing) {
    return prisma.business.update({
      where: { id: existing.id },
      data: {
        ownerUserId,
        name: CONFIG.clinic.name,
        email: CONFIG.email,
        phone: CONFIG.clinic.phone,
        address: CONFIG.clinic.address,
        city: CONFIG.clinic.city,
      },
    })
  }

  return prisma.business.create({
    data: {
      name: CONFIG.clinic.name,
      slug: CONFIG.clinic.slug,
      ownerUserId,
      email: CONFIG.email,
      phone: CONFIG.clinic.phone,
      address: CONFIG.clinic.address,
      city: CONFIG.clinic.city,
    },
  })
}

async function ensureVendorAccount(businessId) {
  const accessEndAt = new Date()
  accessEndAt.setDate(accessEndAt.getDate() + 365)

  const existing = await prisma.vendorAccount.findUnique({ where: { businessId } })
  if (existing) {
    return prisma.vendorAccount.update({
      where: { businessId },
      data: {
        plan: 'PROFESSIONAL',
        isDemo: false,
        status: 'ACTIVE',
        accessEndAt,
        packageDurationDays: 365,
      },
    })
  }

  return prisma.vendorAccount.create({
    data: {
      businessId,
      plan: 'PROFESSIONAL',
      isDemo: false,
      status: 'ACTIVE',
      source: 'ADMIN_CREATED',
      accessStartAt: new Date(),
      accessEndAt,
      packageDurationDays: 365,
      notes: 'Test user Demo@asistan.online',
    },
  })
}

async function ensureTeamMember(businessId, userId) {
  const existing = await prisma.teamMember.findFirst({
    where: {
      businessId,
      OR: [{ userId }, { email: CONFIG.email }],
    },
  })

  if (existing) {
    return prisma.teamMember.update({
      where: { id: existing.id },
      data: {
        userId,
        email: CONFIG.email,
        fullName: CONFIG.fullName,
        role: TeamRole.ISLETME_SAHIBI,
        permissions: OWNER_PERMISSIONS,
        isActive: true,
      },
    })
  }

  return prisma.teamMember.create({
    data: {
      businessId,
      userId,
      email: CONFIG.email,
      fullName: CONFIG.fullName,
      role: TeamRole.ISLETME_SAHIBI,
      permissions: OWNER_PERMISSIONS,
      color: '#12C8AD',
      isActive: true,
    },
  })
}

async function main() {
  const authUserId = await ensureAuthUser()
  const user = await ensurePrismaUser(authUserId)
  const business = await ensureBusiness(user.id)
  await ensureVendorAccount(business.id)
  await ensureTeamMember(business.id, user.id)

  console.log('=== TEST USER READY ===')
  console.log(`Email: ${CONFIG.email}`)
  console.log(`Password: ${CONFIG.password}`)
  console.log(`Auth ID: ${authUserId}`)
  console.log(`Prisma User ID: ${user.id}`)
  console.log(`Clinic: ${business.name} (${business.slug})`)
  console.log('Login: /tr/giris or /auth/login')
}

main()
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
