/**
 * Create/update demo Supabase Auth + Prisma accounts for every clinic TeamRole
 * (including SUPER_ADMIN), attached to the demo clinic.
 *
 *   node scripts/ensure-demo-role-accounts.mjs --i-know-this-bypasses-rls
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (+ URL) and a Postgres URL that can write User/TeamMember
 * (prefer DATABASE_URL_MIGRATE / DIRECT_URL when runtime DB is asistan_app).
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
  script: 'ensure-demo-role-accounts',
  purpose: 'Create demo Auth users for every TeamRole via service_role + owner DB',
  surfaces: ['supabase-service-role', 'postgres-owner'],
  env,
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY
const dbUrl =
  env.DATABASE_URL_MIGRATE ?? env.DIRECT_URL ?? env.POSTGRES_URL_NON_POOLING ?? env.DATABASE_URL

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL veya SUPABASE_SERVICE_ROLE_KEY eksik.')
}
if (!dbUrl) {
  throw new Error('DATABASE_URL / DATABASE_URL_MIGRATE eksik.')
}

/** Shared demo password — change in production environments. */
const DEMO_PASSWORD = 'AsistanDemo2026!'

const CLINIC = {
  slug: 'asistan-demo-klinigi',
  name: 'Asistan Demo Klinigi',
  phone: '+90 392 555 0100',
  address: 'Bedrettin Demirel Cad. No:120 Lefkosa',
  city: 'Lefkosa',
}

const ALL_PERMISSIONS = [
  'patient.view',
  'patient.create',
  'patient.edit',
  'patient.archive',
  'patient.delete',
  'medical_note.create',
  'appointment.manage',
  'appointment.view',
  'appointment.own.view',
  'appointment.create',
  'appointment.edit',
  'appointment.cancel',
  'team.manage',
  'team.view',
  'team.create',
  'team.role.edit',
  'team.permission.edit',
  'analytics.view',
  'analytics.revenue.view',
  'file.view',
  'file.upload',
  'file.delete',
  'medical_note.view',
  'service.manage',
  'settings.business.edit',
  'settings.security.edit',
  'audit.view',
  'compliance.manage',
]

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ISLETME_SAHIBI: ALL_PERMISSIONS,
  DOKTOR: [
    'patient.view',
    'patient.create',
    'patient.edit',
    'patient.archive',
    'appointment.manage',
    'appointment.view',
    'appointment.create',
    'appointment.edit',
    'appointment.cancel',
    'file.view',
    'file.upload',
    'medical_note.view',
    'medical_note.create',
    'analytics.view',
  ],
  SEKRETER: [
    'patient.view',
    'patient.create',
    'patient.edit',
    'appointment.manage',
    'appointment.view',
    'appointment.create',
    'appointment.edit',
    'appointment.cancel',
    'file.view',
    'file.upload',
  ],
  PERSONEL: ['patient.view', 'appointment.own.view'],
}

/** @type {Array<{ role: import('@prisma/client').TeamRole, email: string, fullName: string, color: string, isOwner?: boolean, bookable?: boolean }>} */
const ACCOUNTS = [
  {
    role: TeamRole.SUPER_ADMIN,
    email: 'superadmin@asistan.demo',
    fullName: 'Demo Super Admin',
    color: '#7C3AED',
    bookable: false,
  },
  {
    role: TeamRole.ISLETME_SAHIBI,
    email: 'owner@asistan.demo',
    fullName: 'Demo Isletme Sahibi',
    color: '#12C8AD',
    isOwner: true,
    bookable: false,
  },
  {
    role: TeamRole.DOKTOR,
    email: 'doktor@asistan.demo',
    fullName: 'Demo Doktor',
    color: '#16A9E8',
    bookable: true,
  },
  {
    role: TeamRole.SEKRETER,
    email: 'sekreter@asistan.demo',
    fullName: 'Demo Sekreter',
    color: '#F59E0B',
    bookable: false,
  },
  {
    role: TeamRole.PERSONEL,
    email: 'personel@asistan.demo',
    fullName: 'Demo Personel',
    color: '#64748B',
    bookable: false,
  },
]

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
})
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findAuthUserByEmail(email) {
  const normalized = email.toLowerCase()
  // Paginate — demos may not be on page 1 of large projects.
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((user) => user.email?.toLowerCase() === normalized)
    if (hit) return hit
    if (!data.users.length || data.users.length < 200) break
  }
  return null
}

async function ensureAuthUser(account) {
  const existing = await findAuthUserByEmail(account.email)
  if (existing?.id) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      email: account.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        full_name: account.fullName,
        role: account.role === TeamRole.SUPER_ADMIN ? 'super_admin' : 'clinic',
        demo_role: account.role,
      },
    })
    if (error) throw error
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: account.fullName,
      role: account.role === TeamRole.SUPER_ADMIN ? 'super_admin' : 'clinic',
      demo_role: account.role,
    },
  })
  if (error) throw error
  if (!data.user?.id) throw new Error(`Auth user olusturulamadi: ${account.email}`)
  return data.user.id
}

async function ensurePrismaUser(authUserId, account) {
  const byEmail = await prisma.user.findUnique({ where: { email: account.email } })
  if (byEmail) {
    if (byEmail.id !== authUserId) {
      // Prefer Auth id as source of truth when possible; keep email unique.
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { fullName: account.fullName, isActive: true },
      })
    }
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { fullName: account.fullName, isActive: true },
    })
  }

  const byId = await prisma.user.findUnique({ where: { id: authUserId } })
  if (byId) {
    return prisma.user.update({
      where: { id: byId.id },
      data: {
        email: account.email,
        fullName: account.fullName,
        isActive: true,
      },
    })
  }

  return prisma.user.create({
    data: {
      id: authUserId,
      email: account.email,
      fullName: account.fullName,
      isActive: true,
    },
  })
}

async function ensureBusiness(ownerUserId) {
  const existing = await prisma.business.findUnique({ where: { slug: CLINIC.slug } })
  if (existing) {
    return prisma.business.update({
      where: { id: existing.id },
      data: {
        ownerUserId,
        name: CLINIC.name,
        email: 'owner@asistan.demo',
        phone: CLINIC.phone,
        address: CLINIC.address,
        city: CLINIC.city,
        isActive: true,
        deletedAt: null,
      },
    })
  }

  return prisma.business.create({
    data: {
      name: CLINIC.name,
      slug: CLINIC.slug,
      ownerUserId,
      email: 'owner@asistan.demo',
      phone: CLINIC.phone,
      address: CLINIC.address,
      city: CLINIC.city,
      timezone: 'Europe/Nicosia',
      currency: 'TRY',
    },
  })
}

async function ensureVendorAccount(businessId) {
  const accessEndAt = new Date()
  accessEndAt.setFullYear(accessEndAt.getFullYear() + 1)

  const existing = await prisma.vendorAccount.findUnique({ where: { businessId } })
  if (existing) {
    return prisma.vendorAccount.update({
      where: { businessId },
      data: {
        plan: 'PROFESSIONAL',
        isDemo: true,
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
      isDemo: true,
      status: 'ACTIVE',
      source: 'ADMIN_CREATED',
      accessStartAt: new Date(),
      accessEndAt,
      packageDurationDays: 365,
      notes: 'Demo role accounts (ensure-demo-role-accounts)',
    },
  })
}

async function ensureTeamMember(businessId, userId, account) {
  const permissions = ROLE_PERMISSIONS[account.role] ?? []
  const existing = await prisma.teamMember.findFirst({
    where: {
      businessId,
      OR: [{ userId }, { email: account.email }],
    },
  })

  const data = {
    userId,
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    permissions,
    color: account.color,
    isBookable: Boolean(account.bookable),
    isActive: true,
    deletedAt: null,
  }

  if (existing) {
    return prisma.teamMember.update({ where: { id: existing.id }, data })
  }

  return prisma.teamMember.create({
    data: {
      businessId,
      ...data,
    },
  })
}

async function main() {
  const ownerAccount = ACCOUNTS.find((a) => a.isOwner)
  if (!ownerAccount) throw new Error('Owner account missing from ACCOUNTS')

  const ownerAuthId = await ensureAuthUser(ownerAccount)
  const ownerUser = await ensurePrismaUser(ownerAuthId, ownerAccount)
  const business = await ensureBusiness(ownerUser.id)
  await ensureVendorAccount(business.id)
  await ensureTeamMember(business.id, ownerUser.id, ownerAccount)

  const results = [
    {
      role: ownerAccount.role,
      email: ownerAccount.email,
      password: DEMO_PASSWORD,
      userId: ownerUser.id,
      authId: ownerAuthId,
    },
  ]

  for (const account of ACCOUNTS) {
    if (account.isOwner) continue
    const authId = await ensureAuthUser(account)
    const user = await ensurePrismaUser(authId, account)
    await ensureTeamMember(business.id, user.id, account)
    results.push({
      role: account.role,
      email: account.email,
      password: DEMO_PASSWORD,
      userId: user.id,
      authId,
    })
  }

  console.log('')
  console.log('=== DEMO ROLE ACCOUNTS READY ===')
  console.log(`Clinic: ${business.name} (${business.slug})`)
  console.log(`Business ID: ${business.id}`)
  console.log(`Shared password: ${DEMO_PASSWORD}`)
  console.log('')
  for (const row of results) {
    console.log(`${row.role.padEnd(16)}  ${row.email}`)
  }
  console.log('')
  console.log('Login: /tr/giris or /auth/login')
  console.log('Super Admin UI: /dashboard/super-admin (role=SUPER_ADMIN)')
  console.log(
    'Optional (platform allowlist in production): SYSTEM_ADMIN_EMAILS=superadmin@asistan.demo',
  )
  console.log('')
}

main()
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
