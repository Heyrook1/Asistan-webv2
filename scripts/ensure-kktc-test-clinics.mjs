/**
 * KKTC marketplace test klinikleri — staging only.
 *
 * Public discovery excludes `isDemo=true` and `*-asistan-test` slugs unless
 * CLIENT_SHOW_TEST_CLINICS=1. Display names use Turkish characters (Kliniği);
 * slugs stay ASCII.
 *
 *   node scripts/ensure-kktc-test-clinics.mjs --i-know-this-bypasses-rls
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
  script: 'ensure-kktc-test-clinics',
  purpose: 'Seed KKTC bookable test clinics for /client marketplace',
  surfaces: ['supabase-service-role', 'postgres-owner'],
  env,
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL veya admin anahtarı eksik.')
}

/** Owner / migrate URL — Prisma pooler role is often RLS-bound. */
const databaseUrl =
  env.DATABASE_URL_MIGRATE?.trim() ||
  env.DIRECT_URL?.trim() ||
  env.POSTGRES_URL_NON_POOLING?.trim() ||
  env.DATABASE_URL?.trim()

if (!databaseUrl) {
  throw new Error('DATABASE_URL_MIGRATE / DIRECT_URL / DATABASE_URL eksik.')
}

const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
})
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const OWNER_PERMISSIONS = [
  'patient.view',
  'patient.edit',
  'patient.create',
  'appointment.manage',
  'appointment.view',
  'appointment.create',
  'appointment.edit',
  'appointment.cancel',
  'team.manage',
  'service.manage',
  'analytics.view',
]

const DOCTOR_PERMISSIONS = [
  'patient.view',
  'appointment.view',
  'appointment.own.view',
  'appointment.edit',
]

/** @type {Array<{
 *   slug: string
 *   name: string
 *   city: string
 *   address: string
 *   phone: string
 *   lat: string
 *   lng: string
 *   owner: { fullName: string, email: string, password: string }
 *   doctor: { fullName: string, email: string, password: string, specialty: string }
 *   services: Array<{ name: string, durationMin: number, price: string, category: string }>
 * }>} */
const CLINICS = [
  {
    // slug = ASCII URL key; name = Turkish display (Kliniği)
    slug: 'lefkosa-asistan-test',
    name: 'Lefkoşa Asistan Test Kliniği',
    city: 'Lefkoşa',
    address: 'Bedrettin Demirel Cad. No:12 Lefkoşa',
    phone: '+90 392 555 0101',
    lat: '35.185600',
    lng: '33.382300',
    owner: {
      fullName: 'Dr. Ayşe Lefkoşa',
      email: 'lefkosa.owner@asistan.health',
      password: 'TestKlinik123!',
    },
    doctor: {
      fullName: 'Dr. Mehmet Lefkoşa',
      email: 'lefkosa.doktor@asistan.health',
      password: 'TestDoktor123!',
      specialty: 'Aile Hekimliği',
    },
    services: [
      { name: 'Genel Muayene', durationMin: 30, price: '650', category: 'Muayene' },
      { name: 'Kontrol Muayenesi', durationMin: 20, price: '450', category: 'Muayene' },
    ],
  },
  {
    slug: 'girne-asistan-test',
    name: 'Girne Asistan Test Kliniği',
    city: 'Girne',
    address: 'Karaoğlanoğlu Cad. No:8 Girne',
    phone: '+90 392 555 0202',
    lat: '35.341700',
    lng: '33.316700',
    owner: {
      fullName: 'Dr. Elif Girne',
      email: 'girne.owner@asistan.health',
      password: 'TestKlinik123!',
    },
    doctor: {
      fullName: 'Dr. Can Girne',
      email: 'girne.doktor@asistan.health',
      password: 'TestDoktor123!',
      specialty: 'Dermatoloji',
    },
    services: [
      { name: 'Dermatoloji Muayene', durationMin: 30, price: '900', category: 'Dermatoloji' },
      { name: 'Cilt Kontrolü', durationMin: 20, price: '700', category: 'Dermatoloji' },
    ],
  },
  {
    slug: 'magusa-asistan-test',
    name: 'Gazimağusa Asistan Test Kliniği',
    city: 'Gazimağusa',
    address: 'Salamis Yolu No:22 Gazimağusa',
    phone: '+90 392 555 0303',
    lat: '35.126400',
    lng: '33.937800',
    owner: {
      fullName: 'Dr. Murat Mağusa',
      email: 'magusa.owner@asistan.health',
      password: 'TestKlinik123!',
    },
    doctor: {
      fullName: 'Dr. Selin Mağusa',
      email: 'magusa.doktor@asistan.health',
      password: 'TestDoktor123!',
      specialty: 'Kardiyoloji',
    },
    services: [
      { name: 'Kardiyoloji Muayene', durationMin: 40, price: '1200', category: 'Kardiyoloji' },
      { name: 'EKG Değerlendirme', durationMin: 25, price: '850', category: 'Kardiyoloji' },
    ],
  },
]

const WEEKDAY_AVAILABILITY = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  startTime: weekday === 6 ? '10:00' : '09:00',
  endTime: weekday === 6 ? '14:00' : '17:00',
  slotIntervalMin: 15,
}))

async function findAuthUserByEmail(email) {
  const normalized = email.toLowerCase()
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
  return payload.user ?? payload.users?.find((u) => u.email?.toLowerCase() === normalized) ?? null
}

async function ensureAuthUser({ email, password, fullName, role, teamRole, businessSlug }) {
  const existing = await findAuthUserByEmail(email)
  const metadata = {
    full_name: fullName,
    role,
    team_role: teamRole ?? null,
    business_slug: businessSlug,
  }
  if (existing?.id) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata ?? {}), ...metadata },
    })
    if (error) throw error
    return existing.id
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })
  if (error) throw error
  if (!data.user?.id) throw new Error(`Auth user oluşturulamadı: ${email}`)
  return data.user.id
}

async function ensureUserRow(authUserId, { email, fullName, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { fullName, phone, isActive: true },
    })
  }
  return prisma.user.create({
    data: { id: authUserId, email, fullName, phone, isActive: true },
  })
}

async function ensureClinic(clinic) {
  const ownerAuthId = await ensureAuthUser({
    email: clinic.owner.email,
    password: clinic.owner.password,
    fullName: clinic.owner.fullName,
    role: 'OWNER',
    teamRole: 'ADMIN',
    businessSlug: clinic.slug,
  })
  const owner = await ensureUserRow(ownerAuthId, {
    email: clinic.owner.email,
    fullName: clinic.owner.fullName,
    phone: clinic.phone,
  })

  let business = await prisma.business.findUnique({ where: { slug: clinic.slug } })
  const businessData = {
    ownerUserId: owner.id,
    name: clinic.name,
    email: clinic.owner.email,
    phone: clinic.phone,
    address: clinic.address,
    city: clinic.city,
    locationLat: new Prisma.Decimal(clinic.lat),
    locationLng: new Prisma.Decimal(clinic.lng),
    timezone: 'Europe/Nicosia',
    isActive: true,
    autoConfirmClientAppointments: true,
  }
  if (business) {
    business = await prisma.business.update({
      where: { id: business.id },
      data: businessData,
    })
  } else {
    business = await prisma.business.create({
      data: { ...businessData, slug: clinic.slug },
    })
  }

  await prisma.vendorAccount.upsert({
    where: { businessId: business.id },
    create: {
      businessId: business.id,
      status: 'ACTIVE',
      source: 'ADMIN_CREATED',
      isDemo: true,
      plan: 'PRO',
    },
    update: {
      status: 'ACTIVE',
      isDemo: true,
      deletedAt: null,
    },
  })

  await prisma.teamMember.upsert({
    where: {
      businessId_email: { businessId: business.id, email: clinic.owner.email },
    },
    create: {
      businessId: business.id,
      userId: owner.id,
      fullName: clinic.owner.fullName,
      email: clinic.owner.email,
      role: TeamRole.ADMIN,
      isActive: true,
      isBookable: false,
      permissions: OWNER_PERMISSIONS,
    },
    update: {
      userId: owner.id,
      fullName: clinic.owner.fullName,
      role: TeamRole.ADMIN,
      isActive: true,
      permissions: OWNER_PERMISSIONS,
    },
  })

  const doctorAuthId = await ensureAuthUser({
    email: clinic.doctor.email,
    password: clinic.doctor.password,
    fullName: clinic.doctor.fullName,
    role: 'STAFF',
    teamRole: 'DOKTOR',
    businessSlug: clinic.slug,
  })
  const doctorUser = await ensureUserRow(doctorAuthId, {
    email: clinic.doctor.email,
    fullName: clinic.doctor.fullName,
    phone: clinic.phone,
  })

  const doctor = await prisma.teamMember.upsert({
    where: {
      businessId_email: { businessId: business.id, email: clinic.doctor.email },
    },
    create: {
      businessId: business.id,
      userId: doctorUser.id,
      fullName: clinic.doctor.fullName,
      email: clinic.doctor.email,
      role: TeamRole.DOKTOR,
      specialty: clinic.doctor.specialty,
      isActive: true,
      isBookable: true,
      permissions: DOCTOR_PERMISSIONS,
    },
    update: {
      userId: doctorUser.id,
      fullName: clinic.doctor.fullName,
      specialty: clinic.doctor.specialty,
      role: TeamRole.DOKTOR,
      isActive: true,
      isBookable: true,
      permissions: DOCTOR_PERMISSIONS,
    },
  })

  const serviceIds = []
  for (const svc of clinic.services) {
    const existing = await prisma.service.findFirst({
      where: { businessId: business.id, name: svc.name, deletedAt: null },
    })
    const row = existing
      ? await prisma.service.update({
          where: { id: existing.id },
          data: {
            durationMin: svc.durationMin,
            price: new Prisma.Decimal(svc.price),
            category: svc.category,
            isActive: true,
          },
        })
      : await prisma.service.create({
          data: {
            businessId: business.id,
            name: svc.name,
            durationMin: svc.durationMin,
            price: new Prisma.Decimal(svc.price),
            category: svc.category,
            isActive: true,
          },
        })
    serviceIds.push(row.id)

    await prisma.serviceStaff.upsert({
      where: {
        serviceId_staffId: { serviceId: row.id, staffId: doctor.id },
      },
      create: {
        businessId: business.id,
        serviceId: row.id,
        staffId: doctor.id,
        isActive: true,
      },
      update: { isActive: true },
    })
  }

  await prisma.teamMemberAvailability.deleteMany({
    where: { businessId: business.id, staffId: doctor.id },
  })
  await prisma.teamMemberAvailability.createMany({
    data: WEEKDAY_AVAILABILITY.map((rule) => ({
      businessId: business.id,
      staffId: doctor.id,
      weekday: rule.weekday,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slotIntervalMin: rule.slotIntervalMin,
      isActive: true,
    })),
  })

  const location = await prisma.location.findFirst({
    where: { businessId: business.id, name: `${clinic.city} Merkez` },
  })
  if (location) {
    await prisma.location.update({
      where: { id: location.id },
      data: {
        address: clinic.address,
        city: clinic.city,
        phone: clinic.phone,
        isActive: true,
      },
    })
  } else {
    await prisma.location.create({
      data: {
        businessId: business.id,
        name: `${clinic.city} Merkez`,
        address: clinic.address,
        city: clinic.city,
        phone: clinic.phone,
        isActive: true,
        sortOrder: 0,
      },
    })
  }

  return {
    slug: clinic.slug,
    name: clinic.name,
    city: clinic.city,
    ownerEmail: clinic.owner.email,
    doctorEmail: clinic.doctor.email,
    serviceCount: serviceIds.length,
  }
}

/**
 * Eski İstanbul demo kliniklerini discovery’ye aç (şehir + isDemo düzelt).
 */
async function relocateLegacyDemoClinics() {
  const legacy = await prisma.business.findMany({
    where: {
      OR: [
        { slug: 'asistan-demo-klinigi' },
        { city: { in: ['Istanbul', 'İstanbul', 'Ataşehir', 'Ankara', 'Izmir', 'İzmir'] } },
      ],
      isActive: true,
    },
    include: { vendorAccount: true },
    take: 20,
  })

  const moved = []
  for (const biz of legacy) {
    // Sadece bilinen demo slug / seed e-postalarını taşı; rastgele TR kliniklerini bozma.
    const isKnownDemo =
      biz.slug === 'asistan-demo-klinigi' ||
      biz.email?.endsWith('@asistan.health') ||
      biz.email?.endsWith('@asistan.online')

    if (!isKnownDemo) continue

    await prisma.business.update({
      where: { id: biz.id },
      data: {
        city: 'Lefkoşa',
        address: biz.address?.includes('Lefkoşa')
          ? biz.address
          : 'Bedrettin Demirel Cad. (test) Lefkoşa',
        locationLat: new Prisma.Decimal('35.185600'),
        locationLng: new Prisma.Decimal('33.382300'),
        timezone: 'Europe/Nicosia',
        isActive: true,
      },
    })

    if (biz.vendorAccount) {
      await prisma.vendorAccount.update({
        where: { id: biz.vendorAccount.id },
        data: { isDemo: true, status: 'ACTIVE', deletedAt: null },
      })
    } else {
      await prisma.vendorAccount.create({
        data: {
          businessId: biz.id,
          status: 'ACTIVE',
          source: 'ADMIN_CREATED',
          isDemo: true,
          plan: 'PRO',
        },
      })
    }

    // Bookable doktor yoksa ekle (minimal)
    const bookable = await prisma.teamMember.findFirst({
      where: {
        businessId: biz.id,
        role: TeamRole.DOKTOR,
        isActive: true,
        isBookable: true,
      },
    })
    if (!bookable) {
      const doctor = await prisma.teamMember.create({
        data: {
          businessId: biz.id,
          fullName: 'Dr. Test Hekim',
          email: `doktor+${biz.slug}@asistan.health`,
          role: TeamRole.DOKTOR,
          specialty: 'Genel',
          isActive: true,
          isBookable: true,
          permissions: DOCTOR_PERMISSIONS,
        },
      })
      let service = await prisma.service.findFirst({
        where: { businessId: biz.id, isActive: true, deletedAt: null },
      })
      if (!service) {
        service = await prisma.service.create({
          data: {
            businessId: biz.id,
            name: 'Genel Muayene',
            durationMin: 30,
            price: new Prisma.Decimal('600'),
            category: 'Muayene',
            isActive: true,
          },
        })
      }
      await prisma.serviceStaff.upsert({
        where: {
          serviceId_staffId: { serviceId: service.id, staffId: doctor.id },
        },
        create: {
          businessId: biz.id,
          serviceId: service.id,
          staffId: doctor.id,
          isActive: true,
        },
        update: { isActive: true },
      })
      await prisma.teamMemberAvailability.createMany({
        data: WEEKDAY_AVAILABILITY.map((rule) => ({
          businessId: biz.id,
          staffId: doctor.id,
          weekday: rule.weekday,
          startTime: rule.startTime,
          endTime: rule.endTime,
          slotIntervalMin: rule.slotIntervalMin,
          isActive: true,
        })),
      })
    }

    moved.push(biz.slug)
  }
  return moved
}

async function main() {
  console.log('Relocating legacy demo clinics to Lefkoşa…')
  const moved = await relocateLegacyDemoClinics()
  console.log('Moved:', moved.length ? moved.join(', ') : '(none)')

  console.log('Upserting KKTC test clinics…')
  const results = []
  for (const clinic of CLINICS) {
    results.push(await ensureClinic(clinic))
    console.log(`  ✓ ${clinic.name} (${clinic.city})`)
  }

  console.log('\nOK — /client/clinics için test klinikleri hazır.\n')
  console.log('Klinik girişleri (şifre: TestKlinik123!):')
  for (const row of results) {
    console.log(`  ${row.city.padEnd(12)} ${row.ownerEmail}  → /book/${row.slug}`)
  }
  console.log('\nHasta hesabı (önceden varsa): hasta.test@asistan.health / Hasta12345!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
