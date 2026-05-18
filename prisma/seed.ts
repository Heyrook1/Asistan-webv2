/**
 * Demo seed for Asistan Health.
 *
 *   pnpm tsx prisma/seed.ts
 *
 * Idempotent: re-runs are safe — it will skip rows that already exist.
 * Creates a sample Business with team, services, patients, appointments,
 * notes, medications, allergies, treatments, lab results, and notifications.
 */

import { PrismaClient, TeamRole, AppointmentStatus, TreatmentStatus, NotificationType, TimelineEventType, FileCategory, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_OWNER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@asistan.health',
  fullName: 'Dr. Ayşe Yılmaz',
}

async function main() {
  console.log('🌱 Seeding demo data...')

  const owner = await prisma.user.upsert({
    where: { id: DEMO_OWNER.id },
    create: {
      id: DEMO_OWNER.id,
      email: DEMO_OWNER.email,
      fullName: DEMO_OWNER.fullName,
    },
    update: {},
  })

  let business = await prisma.business.findUnique({ where: { ownerUserId: owner.id } })
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Asistan Demo Kliniği',
        slug: 'asistan-demo-klinigi',
        ownerUserId: owner.id,
        email: DEMO_OWNER.email,
        phone: '+90 212 555 0100',
        address: 'Bağdat Cad. No:120',
        city: 'İstanbul',
      },
    })
  }

  // Team
  const teamSeed: { fullName: string; email: string; role: TeamRole; color: string }[] = [
    { fullName: DEMO_OWNER.fullName, email: DEMO_OWNER.email, role: TeamRole.ISLETME_SAHIBI, color: '#12C8AD' },
    { fullName: 'Dr. Mehmet Demir', email: 'mehmet@asistan.health', role: TeamRole.DOKTOR, color: '#16A9E8' },
    { fullName: 'Elif Kaya', email: 'elif@asistan.health', role: TeamRole.SEKRETER, color: '#F59E0B' },
  ]
  for (const t of teamSeed) {
    await prisma.teamMember.upsert({
      where: { businessId_email: { businessId: business.id, email: t.email } },
      create: {
        businessId: business.id,
        userId: t.email === DEMO_OWNER.email ? owner.id : null,
        fullName: t.fullName,
        email: t.email,
        role: t.role,
        color: t.color,
        permissions:
          t.role === TeamRole.ISLETME_SAHIBI
            ? ['patient.view', 'patient.edit', 'appointment.manage', 'team.manage', 'analytics.view', 'file.view', 'medical_note.view', 'service.manage']
            : t.role === TeamRole.DOKTOR
            ? ['patient.view', 'patient.edit', 'appointment.manage', 'file.view', 'medical_note.view', 'analytics.view']
            : ['patient.view', 'appointment.manage', 'file.view'],
      },
      update: {},
    })
  }
  const team = await prisma.teamMember.findMany({ where: { businessId: business.id } })
  const doctor = team.find((t) => t.role === TeamRole.DOKTOR)

  // Services
  const servicesSeed = [
    { name: 'Genel Muayene', durationMin: 30, price: 750, color: '#12C8AD', category: 'Muayene' },
    { name: 'Diş Hekimi Muayene', durationMin: 45, price: 950, color: '#16A9E8', category: 'Diş' },
    { name: 'Online Konsültasyon', durationMin: 20, price: 500, color: '#8B5CF6', category: 'Uzaktan' },
    { name: 'Aşılama', durationMin: 15, price: 250, color: '#F59E0B', category: 'Önleyici' },
  ]
  for (const s of servicesSeed) {
    const exists = await prisma.service.findFirst({ where: { businessId: business.id, name: s.name } })
    if (!exists) {
      await prisma.service.create({
        data: {
          businessId: business.id,
          name: s.name,
          durationMin: s.durationMin,
          price: new Prisma.Decimal(s.price),
          color: s.color,
          category: s.category,
        },
      })
    }
  }
  const services = await prisma.service.findMany({ where: { businessId: business.id } })

  // Patients
  const patientsSeed = [
    { fullName: 'Ahmet Yılmaz', phone: '05551112233', email: 'ahmet@example.com', gender: 'Erkek', bloodType: 'A Rh+', birthDate: new Date('1985-03-12'), tags: ['VIP', 'Düzenli'] },
    { fullName: 'Zeynep Şahin', phone: '05552223344', email: 'zeynep@example.com', gender: 'Kadın', bloodType: '0 Rh+', birthDate: new Date('1992-07-19'), tags: ['Hamile'] },
    { fullName: 'Murat Demir', phone: '05553334455', gender: 'Erkek', bloodType: 'B Rh-', birthDate: new Date('1970-11-02'), tags: ['Kronik'] },
    { fullName: 'Selin Aydın', phone: '05554445566', email: 'selin@example.com', gender: 'Kadın', bloodType: 'AB Rh+', birthDate: new Date('2002-01-25') },
  ]

  for (let i = 0; i < patientsSeed.length; i++) {
    const data = patientsSeed[i]
    const number = `HST-${1000 + i + 1}`
    const exists = await prisma.patient.findFirst({ where: { businessId: business.id, patientNumber: number } })
    if (exists) continue

    const patient = await prisma.patient.create({
      data: {
        businessId: business.id,
        patientNumber: number,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? null,
        gender: data.gender,
        bloodType: data.bloodType,
        birthDate: data.birthDate,
        tags: data.tags ?? [],
        chronicDiseases: data.tags?.includes('Kronik') ? 'Hipertansiyon, Tip-2 Diyabet' : null,
        patientStory: i === 0 ? 'Hasta 5 yıldır kliniğe düzenli kontrole geliyor. Genel sağlık durumu iyi.' : null,
      },
    })

    if (i === 0) {
      await prisma.medication.create({
        data: { businessId: business.id, patientId: patient.id, name: 'Aspirin', dosage: '100 mg', frequency: 'Günde 1' },
      })
      await prisma.allergy.create({
        data: { businessId: business.id, patientId: patient.id, name: 'Penisilin', severity: 'SIDDETLI', reaction: 'Anafilaksi' },
      })
      await prisma.treatment.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          title: 'Diyabet İzlemi',
          status: TreatmentStatus.DEVAM_EDIYOR,
          doctorName: doctor?.fullName ?? null,
          startDate: new Date(Date.now() - 90 * 86_400_000),
        },
      })
      await prisma.labResult.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          title: 'HbA1c',
          resultDate: new Date(Date.now() - 14 * 86_400_000),
          description: 'HbA1c: 6.8 (hedef: <7.0)',
        },
      })
      await prisma.patientNote.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          title: 'İlk değerlendirme',
          note: 'Hasta genel sağlık durumu açısından stabil. 3 ay sonra kontrol önerildi.',
          createdBy: DEMO_OWNER.fullName,
          isPinned: true,
        },
      })
      await prisma.patientFile.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          fileName: 'kan-tahlili-mart.pdf',
          fileType: 'application/pdf',
          fileSize: 142_000,
          category: FileCategory.TAHLIL,
          storageKey: `${business.id}/${patient.id}/kan-tahlili-mart.pdf`,
          fileUrl: `storage://patient-files/${business.id}/${patient.id}/kan-tahlili-mart.pdf`,
          uploadedBy: DEMO_OWNER.fullName,
        },
      })
    }

    await prisma.timelineEvent.create({
      data: {
        businessId: business.id,
        patientId: patient.id,
        type: TimelineEventType.PATIENT_CREATED,
        title: 'Hasta oluşturuldu',
        actorName: DEMO_OWNER.fullName,
      },
    })

    // Add a couple appointments for the first two patients
    if (i < 2 && services[0] && services[1]) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          serviceId: services[i % services.length].id,
          staffId: doctor?.id ?? null,
          date: new Date(today.getTime() + (i + 1) * 86_400_000),
          startTime: ['09:00', '14:30'][i] ?? '10:00',
          endTime: ['09:30', '15:15'][i] ?? '10:30',
          status: AppointmentStatus.SCHEDULED,
          price: services[i % services.length].price,
        },
      })
      // One completed in the past month for revenue
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          serviceId: services[0].id,
          staffId: doctor?.id ?? null,
          date: new Date(today.getTime() - (i + 1) * 7 * 86_400_000),
          startTime: '11:00',
          endTime: '11:30',
          status: AppointmentStatus.COMPLETED,
          price: services[0].price,
        },
      })
    }
  }

  // Notification
  await prisma.notification.create({
    data: {
      businessId: business.id,
      userId: owner.id,
      type: NotificationType.SYSTEM,
      title: 'Asistan Health’a hoş geldiniz!',
      message: 'Demo verileri yüklendi. Sol menüden modülleri inceleyebilirsiniz.',
    },
  })

  console.log('✅ Seed complete:', business.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
