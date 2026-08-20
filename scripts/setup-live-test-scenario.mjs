/**
 * Live demo clinic + client fixtures (Auth Admin + Prisma).
 *
 *   node scripts/setup-live-test-scenario.mjs --i-know-this-bypasses-rls
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY. Remote/production requires confirmation.
 */
import { readFileSync } from 'node:fs'
import { Prisma, PrismaClient, TeamRole } from '@prisma/client'
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
          return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
        })
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
  script: 'setup-live-test-scenario',
  purpose: 'Seed live demo clinic/client via service_role Auth Admin',
  surfaces: ['supabase-service-role', 'postgres-owner'],
  env,
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL veya admin anahtari eksik.')
}

const prisma = new PrismaClient()
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CONFIG = {
  clinic: {
    slug: 'asistan-demo-klinigi',
    name: 'Asistan Demo Klinigi (TEST)',
    email: 'demo.owner@example.com',
    phone: '+90 555 010 0000',
    address: 'TEST adres — Bedrettin Demirel Cad. No:120 Lefkoşa',
    city: 'Lefkoşa',
    locationLat: '35.185600',
    locationLng: '33.382300',
    timezone: 'Europe/Nicosia',
  },
  owner: {
    fullName: 'Dr. Ayse Yilmaz (TEST)',
    email: 'demo.owner@example.com',
    password: 'Demo12345!',
  },
  client: {
    fullName: 'Test Hasta (TEST)',
    email: 'hasta.test@example.com',
    password: 'Hasta12345!',
    phone: '+90 555 010 0091',
    city: 'Lefkoşa',
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

const DOCTOR_PERMISSIONS = [
  'patient.view',
  'patient.edit',
  'medical_note.view',
  'medical_note.create',
  'appointment.view',
  'appointment.own.view',
  'appointment.edit',
  'file.view',
  'analytics.view',
]

const doctorsSeed = [
  {
    fullName: 'Dr. Mehmet Demir (TEST)',
    email: 'demo.doctor.mehmet@example.com',
    specialty: 'Ic Hastaliklari',
    bio: 'Ic hastaliklari, kronik hastalik takibi ve koruyucu hekimlik alanlarinda calisir. (TEST)',
    password: 'DocDemo123!',
    services: ['Genel Muayene', 'Online Konsultasyon'],
    availability: [
      { weekday: 1, startTime: '09:00', endTime: '17:00', slotIntervalMin: 15 },
      { weekday: 2, startTime: '09:00', endTime: '17:00', slotIntervalMin: 15 },
      { weekday: 3, startTime: '09:00', endTime: '17:00', slotIntervalMin: 15 },
      { weekday: 4, startTime: '09:00', endTime: '17:00', slotIntervalMin: 15 },
      { weekday: 5, startTime: '09:00', endTime: '17:00', slotIntervalMin: 15 },
      { weekday: 6, startTime: '10:00', endTime: '15:00', slotIntervalMin: 15 },
    ],
  },
  {
    fullName: 'Dr. Elif Karaca (TEST)',
    email: 'demo.doctor.elif@example.com',
    specialty: 'Kardiyoloji',
    bio: 'Ritim bozukluklari, hipertansiyon ve koroner risk yonetimi uzerine calisir. (TEST)',
    password: 'Cardio123!',
    services: ['Kardiyoloji Muayene', 'EKG ve Kardiyak Degerlendirme'],
    availability: [
      { weekday: 1, startTime: '09:00', endTime: '16:00', slotIntervalMin: 15 },
      { weekday: 3, startTime: '09:00', endTime: '16:00', slotIntervalMin: 15 },
      { weekday: 5, startTime: '09:00', endTime: '16:00', slotIntervalMin: 15 },
      { weekday: 6, startTime: '09:00', endTime: '14:00', slotIntervalMin: 15 },
    ],
  },
  {
    fullName: 'Dr. Murat Ozkan (TEST)',
    email: 'demo.doctor.murat@example.com',
    specialty: 'Dermatoloji',
    bio: 'Akne, egzama, leke tedavileri ve dermatoskopik degerlendirme alanlarinda hizmet verir. (TEST)',
    password: 'Derma123!',
    services: ['Dermatoloji Muayene', 'Cilt Lekesi Degerlendirme'],
    availability: [
      { weekday: 2, startTime: '10:00', endTime: '18:00', slotIntervalMin: 15 },
      { weekday: 4, startTime: '10:00', endTime: '18:00', slotIntervalMin: 15 },
      { weekday: 6, startTime: '10:00', endTime: '16:00', slotIntervalMin: 15 },
    ],
  },
  {
    fullName: 'Dr. Selin Arslan (TEST)',
    email: 'demo.doctor.selin@example.com',
    specialty: 'Endokrinoloji',
    bio: 'Tiroid, insulin direnci ve metabolik sendrom takibinde hasta odakli calisir. (TEST)',
    password: 'Endo123!',
    services: ['Endokrinoloji Muayene', 'Tiroid Takip Kontrolu'],
    availability: [
      { weekday: 1, startTime: '11:00', endTime: '19:00', slotIntervalMin: 15 },
      { weekday: 2, startTime: '11:00', endTime: '19:00', slotIntervalMin: 15 },
      { weekday: 3, startTime: '11:00', endTime: '19:00', slotIntervalMin: 15 },
      { weekday: 4, startTime: '11:00', endTime: '19:00', slotIntervalMin: 15 },
      { weekday: 5, startTime: '11:00', endTime: '19:00', slotIntervalMin: 15 },
      { weekday: 6, startTime: '10:00', endTime: '14:00', slotIntervalMin: 15 },
    ],
  },
]

const servicesSeed = [
  { name: 'Genel Muayene', durationMin: 30, price: '750', category: 'Muayene', description: 'Genel saglik degerlendirmesi ve muayene.' },
  { name: 'Online Konsultasyon', durationMin: 20, price: '500', category: 'Uzaktan', description: 'Online gorusme ile doktor degerlendirmesi.' },
  { name: 'Kardiyoloji Muayene', durationMin: 40, price: '1450', category: 'Kardiyoloji', description: 'Kalp-damar sistemi muayenesi ve risk analizi.' },
  { name: 'EKG ve Kardiyak Degerlendirme', durationMin: 30, price: '1200', category: 'Kardiyoloji', description: 'EKG ile ritim analizi ve klinik degerlendirme.' },
  { name: 'Dermatoloji Muayene', durationMin: 30, price: '1100', category: 'Dermatoloji', description: 'Cilt hastaliklarina yonelik muayene.' },
  { name: 'Cilt Lekesi Degerlendirme', durationMin: 25, price: '950', category: 'Dermatoloji', description: 'Lekeler icin dermatoskopik degerlendirme.' },
  { name: 'Endokrinoloji Muayene', durationMin: 35, price: '1300', category: 'Endokrinoloji', description: 'Hormon ve metabolizma odakli muayene.' },
  { name: 'Tiroid Takip Kontrolu', durationMin: 25, price: '900', category: 'Endokrinoloji', description: 'Tiroid hastalari icin rutin takip kontrolu.' },
]

const locationsSeed = [
  {
    name: 'Lefkoşa Merkez (TEST)',
    address: 'TEST adres — Bedrettin Demirel Cad. No:120 Lefkoşa',
    city: 'Lefkoşa',
    phone: '+90 555 010 0011',
    sortOrder: 0,
  },
  {
    name: 'Girne Şube (TEST)',
    address: 'TEST adres — Karaoğlanoğlu Cad. No:45 Girne',
    city: 'Girne',
    phone: '+90 555 010 0012',
    sortOrder: 1,
  },
]

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function userMetadata(input) {
  return {
    full_name: input.fullName,
    role: input.role,
    team_role: input.teamRole ?? null,
    business_slug: CONFIG.clinic.slug,
  }
}

async function findAuthUserByEmail(email) {
  const normalized = email.toLowerCase()
  const admin = supabase.auth.admin
  if (typeof admin.getUserByEmail === 'function') {
    const { data, error } = await admin.getUserByEmail(normalized)
    if (!error) return data.user
  }

  const endpoint = new URL('/auth/v1/admin/users', supabaseUrl)
  endpoint.searchParams.set('email', normalized)
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })
  if (!response.ok) return null
  const payload = await response.json()
  return payload.user ?? payload.users?.find((user) => user.email?.toLowerCase() === normalized) ?? null
}

async function ensureAuthUser(input) {
  const existing = await findAuthUserByEmail(input.email)
  if (existing?.id) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        ...userMetadata(input),
      },
    })
    if (error) throw error
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: userMetadata(input),
  })
  if (error) throw error
  if (!data.user?.id) throw new Error(`Auth user olusturulamadi: ${input.email}`)
  return data.user.id
}

async function ensureOwnerUserRow(ownerAuthUserId) {
  const existing = await prisma.user.findUnique({ where: { email: CONFIG.owner.email } })
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName: CONFIG.owner.fullName,
        phone: CONFIG.clinic.phone,
        isActive: true,
      },
    })
  }

  return prisma.user.create({
    data: {
      id: ownerAuthUserId,
      email: CONFIG.owner.email,
      fullName: CONFIG.owner.fullName,
      phone: CONFIG.clinic.phone,
      isActive: true,
    },
  })
}

async function ensureClientUserRow(clientAuthUserId) {
  const existing = await prisma.clientUser.findFirst({
    where: {
      OR: [{ authUserId: clientAuthUserId }, { email: CONFIG.client.email }],
    },
  })

  if (existing) {
    return prisma.clientUser.update({
      where: { id: existing.id },
      data: {
        authUserId: clientAuthUserId,
        fullName: CONFIG.client.fullName,
        phone: CONFIG.client.phone,
        email: CONFIG.client.email,
        city: CONFIG.client.city,
      },
    })
  }

  return prisma.clientUser.create({
    data: {
      authUserId: clientAuthUserId,
      fullName: CONFIG.client.fullName,
      phone: CONFIG.client.phone,
      email: CONFIG.client.email,
      city: CONFIG.client.city,
    },
  })
}

async function ensureBusiness(ownerUserId) {
  const existingBySlug = await prisma.business.findUnique({ where: { slug: CONFIG.clinic.slug } })
  if (existingBySlug) {
    return prisma.business.update({
      where: { id: existingBySlug.id },
      data: {
        ownerUserId,
        name: CONFIG.clinic.name,
        email: CONFIG.clinic.email,
        phone: CONFIG.clinic.phone,
        address: CONFIG.clinic.address,
        city: CONFIG.clinic.city,
        locationLat: new Prisma.Decimal(CONFIG.clinic.locationLat),
        locationLng: new Prisma.Decimal(CONFIG.clinic.locationLng),
        timezone: CONFIG.clinic.timezone,
        isActive: true,
        autoConfirmClientAppointments: false,
      },
    })
  }

  return prisma.business.create({
    data: {
      name: CONFIG.clinic.name,
      slug: CONFIG.clinic.slug,
      ownerUserId,
      email: CONFIG.clinic.email,
      phone: CONFIG.clinic.phone,
      address: CONFIG.clinic.address,
      city: CONFIG.clinic.city,
      locationLat: new Prisma.Decimal(CONFIG.clinic.locationLat),
      locationLng: new Prisma.Decimal(CONFIG.clinic.locationLng),
      timezone: CONFIG.clinic.timezone,
      isActive: true,
      autoConfirmClientAppointments: false,
    },
  })
}

async function ensureVendorAccount(businessId) {
  await prisma.vendorAccount.upsert({
    where: { businessId },
    create: {
      businessId,
      status: 'ACTIVE',
      source: 'ADMIN_CREATED',
      isDemo: false,
      plan: 'STARTER',
      balance: new Prisma.Decimal('0'),
      currency: 'TRY',
      accessStartAt: new Date(),
      accessEndAt: addDays(new Date(), 365),
      packageDurationDays: 365,
      notes: 'Canli test senaryosu icin hazirlandi.',
    },
    update: {
      status: 'ACTIVE',
      source: 'ADMIN_CREATED',
      isDemo: false,
      plan: 'STARTER',
      currency: 'TRY',
      accessEndAt: addDays(new Date(), 365),
      packageDurationDays: 365,
    },
  })
}

async function ensureOwnerTeamMember(businessId, ownerUserId) {
  return prisma.teamMember.upsert({
    where: {
      businessId_email: {
        businessId,
        email: CONFIG.owner.email,
      },
    },
    create: {
      businessId,
      userId: ownerUserId,
      fullName: CONFIG.owner.fullName,
      email: CONFIG.owner.email,
      phone: CONFIG.clinic.phone,
      role: TeamRole.ISLETME_SAHIBI,
      permissions: OWNER_PERMISSIONS,
      specialty: 'Klinik Direktoru',
      bio: 'Klinik operasyonu ve kalite sureclerinden sorumlu.',
      isBookable: false,
      isActive: true,
      color: '#12C8AD',
    },
    update: {
      userId: ownerUserId,
      fullName: CONFIG.owner.fullName,
      phone: CONFIG.clinic.phone,
      role: TeamRole.ISLETME_SAHIBI,
      permissions: OWNER_PERMISSIONS,
      specialty: 'Klinik Direktoru',
      bio: 'Klinik operasyonu ve kalite sureclerinden sorumlu.',
      isBookable: false,
      isActive: true,
      deletedAt: null,
    },
  })
}

async function ensureLocations(businessId) {
  const ids = []
  for (const location of locationsSeed) {
    const existing = await prisma.location.findFirst({
      where: { businessId, name: location.name },
      select: { id: true },
    })
    if (existing) {
      const updated = await prisma.location.update({
        where: { id: existing.id },
        data: {
          address: location.address,
          city: location.city,
          phone: location.phone,
          isActive: true,
          sortOrder: location.sortOrder,
          deletedAt: null,
        },
      })
      ids.push(updated.id)
      continue
    }

    const created = await prisma.location.create({
      data: {
        businessId,
        name: location.name,
        address: location.address,
        city: location.city,
        phone: location.phone,
        isActive: true,
        sortOrder: location.sortOrder,
      },
    })
    ids.push(created.id)
  }
  return ids
}

async function ensureServices(businessId) {
  const serviceByName = new Map()
  for (const service of servicesSeed) {
    const existing = await prisma.service.findFirst({
      where: { businessId, name: service.name },
      select: { id: true },
    })
    if (existing) {
      const updated = await prisma.service.update({
        where: { id: existing.id },
        data: {
          durationMin: service.durationMin,
          price: new Prisma.Decimal(service.price),
          currency: 'TRY',
          category: service.category,
          description: service.description,
          isActive: true,
          deletedAt: null,
        },
      })
      serviceByName.set(service.name, updated.id)
      continue
    }

    const created = await prisma.service.create({
      data: {
        businessId,
        name: service.name,
        durationMin: service.durationMin,
        price: new Prisma.Decimal(service.price),
        currency: 'TRY',
        category: service.category,
        description: service.description,
        isActive: true,
        color: '#12C8AD',
      },
    })
    serviceByName.set(service.name, created.id)
  }
  return serviceByName
}

async function ensureDoctor(businessId, doctor, businessSlug) {
  const authId = await ensureAuthUser({
    fullName: doctor.fullName,
    email: doctor.email,
    password: doctor.password,
    role: 'provider',
    teamRole: TeamRole.DOKTOR,
    businessSlug,
  })

  const existingUser = await prisma.user.findUnique({ where: { email: doctor.email } })
  let userId = existingUser?.id ?? null
  if (!existingUser) {
    const createdUser = await prisma.user.create({
      data: {
        id: authId,
        email: doctor.email,
        fullName: doctor.fullName,
        isActive: true,
      },
    })
    userId = createdUser.id
  } else {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        fullName: doctor.fullName,
        isActive: true,
      },
    })
  }

  const member = await prisma.teamMember.upsert({
    where: {
      businessId_email: {
        businessId,
        email: doctor.email,
      },
    },
    create: {
      businessId,
      userId,
      fullName: doctor.fullName,
      email: doctor.email,
      role: TeamRole.DOKTOR,
      permissions: DOCTOR_PERMISSIONS,
      specialty: doctor.specialty,
      bio: doctor.bio,
      isBookable: true,
      isActive: true,
      color: '#16A9E8',
    },
    update: {
      userId,
      fullName: doctor.fullName,
      role: TeamRole.DOKTOR,
      permissions: DOCTOR_PERMISSIONS,
      specialty: doctor.specialty,
      bio: doctor.bio,
      isBookable: true,
      isActive: true,
      deletedAt: null,
    },
  })

  return member
}

async function setDoctorServiceAssignments(businessId, doctorId, serviceIds) {
  await prisma.serviceStaff.updateMany({
    where: { businessId, staffId: doctorId },
    data: { isActive: false, deletedAt: null },
  })

  for (const serviceId of serviceIds) {
    const existing = await prisma.serviceStaff.findFirst({
      where: { businessId, staffId: doctorId, serviceId },
      select: { id: true },
    })
    if (existing) {
      await prisma.serviceStaff.update({
        where: { id: existing.id },
        data: { isActive: true, deletedAt: null },
      })
    } else {
      await prisma.serviceStaff.create({
        data: {
          businessId,
          staffId: doctorId,
          serviceId,
          isActive: true,
        },
      })
    }
  }
}

async function setDoctorAvailability(businessId, doctorId, availability) {
  await prisma.teamMemberAvailability.deleteMany({
    where: { businessId, staffId: doctorId },
  })

  if (availability.length === 0) return

  await prisma.teamMemberAvailability.createMany({
    data: availability.map((slot) => ({
      businessId,
      staffId: doctorId,
      locationId: null,
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotIntervalMin: slot.slotIntervalMin,
      isActive: true,
    })),
  })
}

async function main() {
  console.log('Preparing live test scenario...')

  const ownerAuthId = await ensureAuthUser({
    fullName: CONFIG.owner.fullName,
    email: CONFIG.owner.email,
    password: CONFIG.owner.password,
    role: 'provider',
    teamRole: TeamRole.ISLETME_SAHIBI,
    businessSlug: CONFIG.clinic.slug,
  })
  const clientAuthId = await ensureAuthUser({
    fullName: CONFIG.client.fullName,
    email: CONFIG.client.email,
    password: CONFIG.client.password,
    role: 'client',
    businessSlug: CONFIG.clinic.slug,
  })

  const ownerUser = await ensureOwnerUserRow(ownerAuthId)
  await ensureClientUserRow(clientAuthId)

  const business = await ensureBusiness(ownerUser.id)
  await ensureVendorAccount(business.id)
  await ensureOwnerTeamMember(business.id, ownerUser.id)
  await ensureLocations(business.id)
  const servicesByName = await ensureServices(business.id)

  const doctorSummaries = []
  for (const doctor of doctorsSeed) {
    const member = await ensureDoctor(business.id, doctor, business.slug)
    const serviceIds = doctor.services
      .map((serviceName) => servicesByName.get(serviceName))
      .filter(Boolean)
    await setDoctorServiceAssignments(business.id, member.id, serviceIds)
    await setDoctorAvailability(business.id, member.id, doctor.availability)
    doctorSummaries.push({
      fullName: member.fullName,
      specialty: member.specialty,
      services: doctor.services,
      weeklyAvailabilityCount: doctor.availability.length,
    })
  }

  const [activeDoctors, activeServices, activeLocations, availabilityCount] = await Promise.all([
    prisma.teamMember.count({
      where: { businessId: business.id, role: TeamRole.DOKTOR, isActive: true, isBookable: true },
    }),
    prisma.service.count({
      where: { businessId: business.id, isActive: true },
    }),
    prisma.location.count({
      where: { businessId: business.id, isActive: true },
    }),
    prisma.teamMemberAvailability.count({
      where: { businessId: business.id, isActive: true },
    }),
  ])

  console.log('\n=== LIVE TEST SCENARIO READY ===')
  console.log(`Clinic: ${business.name} (${business.slug})`)
  console.log(`Business ID: ${business.id}`)
  console.log(`Owner Login: ${CONFIG.owner.email} / ${CONFIG.owner.password}`)
  console.log(`Client Login: ${CONFIG.client.email} / ${CONFIG.client.password}`)
  console.log(`Active Doctors: ${activeDoctors}`)
  console.log(`Active Services: ${activeServices}`)
  console.log(`Active Locations: ${activeLocations}`)
  console.log(`Availability Rules: ${availabilityCount}`)
  console.log('\nDoctors:')
  for (const item of doctorSummaries) {
    console.log(`- ${item.fullName} | ${item.specialty} | services=${item.services.length} | rules=${item.weeklyAvailabilityCount}`)
  }
}

main()
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
