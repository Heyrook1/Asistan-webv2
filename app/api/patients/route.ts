import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const createSchema = z.object({
  patientNumber: z.string(),
  fullName: z.string(),
  identityNumber: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  bloodType: z.string().optional(),
  phone: z.string(),
  email: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

function formatZodError(flattened: z.typeToFlattenedError<z.infer<typeof createSchema>>) {
  const fieldLabel: Record<string, string> = {
    patientNumber: 'Hasta numarasi',
    fullName: 'Ad soyad',
    phone: 'Telefon',
    email: 'E-posta',
    identityNumber: 'Kimlik no',
    birthDate: 'Dogum tarihi',
    tags: 'Etiketler',
  }
  const formErrors = flattened.formErrors.filter(Boolean)
  const fieldErrors = Object.entries(flattened.fieldErrors)
    .flatMap(([field, messages]) =>
      (messages || []).filter(Boolean).map((msg) => `${fieldLabel[field] || field}: ${msg}`)
    )
  const all = [...formErrors, ...fieldErrors]
  return all.length ? all.join(' | ') : 'Form verileri gecersiz.'
}

function isSchemaSetupError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false
  return error.code === 'P2021' || error.code === 'P2022'
}

function asUserMessage(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return 'Ayni hasta numarasi zaten kayitli.'
    if (error.code === 'P2021' || error.code === 'P2022') {
      return 'Hasta tablolari henuz hazir degil. Prisma migration/db push calistirin.'
    }
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export async function GET(request: Request) {
  try {
    const access = await getPatientAccess()
    if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') || '').trim()
    const where = {
      providerId: access.providerId,
      isArchived: false,
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
              { patientNumber: { contains: q, mode: 'insensitive' as const } },
              { identityNumber: { contains: q, mode: 'insensitive' as const } },
              { tags: { has: q } },
            ],
          }
        : {}),
    }
    const patients = await prisma.patient.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json({ data: patients })
  } catch (error: unknown) {
    if (isSchemaSetupError(error)) {
      return NextResponse.json(
        {
          data: [],
          setupRequired: true,
          error: asUserMessage(error, 'Hasta tablolari henuz olusturulmamis. Prisma db push/migration tamamlanmali.'),
        },
        { status: 200 }
      )
    }
    return NextResponse.json({ error: asUserMessage(error, 'Patient query failed') }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const access = await getPatientAccess()
    if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
    if (!access.canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const json = await request.json()
    const normalized = {
      ...json,
      patientNumber: typeof json?.patientNumber === 'string' ? json.patientNumber.trim() : json?.patientNumber,
      fullName: typeof json?.fullName === 'string' ? json.fullName.trim() : json?.fullName,
      phone: typeof json?.phone === 'string' ? json.phone.trim() : json?.phone,
      email: typeof json?.email === 'string' ? json.email.trim() : json?.email,
      identityNumber: typeof json?.identityNumber === 'string' ? json.identityNumber.trim() : json?.identityNumber,
      tags: Array.isArray(json?.tags) ? json.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : json?.tags,
    }
    const parsed = createSchema.safeParse(normalized)
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error.flatten()) }, { status: 400 })

    const patientNumber = (parsed.data.patientNumber || '').trim()
    const fullName = (parsed.data.fullName || '').trim()
    const phone = (parsed.data.phone || '').trim()
    const email = (parsed.data.email || '').trim()
    if (!patientNumber) return NextResponse.json({ error: 'Hasta numarasi zorunlu.' }, { status: 400 })
    if (fullName.length < 2) return NextResponse.json({ error: 'Ad soyad en az 2 karakter olmali.' }, { status: 400 })
    if (phone.length < 8) return NextResponse.json({ error: 'Telefon en az 8 karakter olmali.' }, { status: 400 })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-posta gecersiz.' }, { status: 400 })
    }

    const parsedBirthDate = parsed.data.birthDate ? new Date(parsed.data.birthDate) : null
    if (parsedBirthDate && Number.isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json({ error: 'Dogum tarihi gecersiz.' }, { status: 400 })
    }

    const patient = await prisma.patient.create({
      data: {
        providerId: access.providerId,
        patientNumber,
        fullName,
        identityNumber: parsed.data.identityNumber || null,
        birthDate: parsedBirthDate,
        gender: parsed.data.gender || null,
        bloodType: parsed.data.bloodType || null,
        phone,
        email: email || null,
        address: parsed.data.address || null,
        emergencyContactName: parsed.data.emergencyContactName || null,
        emergencyContactPhone: parsed.data.emergencyContactPhone || null,
        allergies: parsed.data.allergies || null,
        chronicDiseases: parsed.data.chronicDiseases || null,
        tags: parsed.data.tags || [],
        timeline: {
          create: {
            providerId: access.providerId,
            type: 'patient_created',
            title: 'Hasta kaydi olusturuldu',
            description: `${fullName} icin kayit acildi`,
          },
        },
      },
    })

    return NextResponse.json({ data: patient }, { status: 201 })
  } catch (error: unknown) {
    if (isSchemaSetupError(error)) {
      return NextResponse.json({ error: asUserMessage(error, 'Prisma schema hazir degil.') }, { status: 503 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: asUserMessage(error, 'Ayni kayit zaten var.') }, { status: 409 })
    }
    return NextResponse.json({ error: asUserMessage(error, 'Patient create failed') }, { status: 500 })
  }
}
