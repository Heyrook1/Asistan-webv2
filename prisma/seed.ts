/**
 * Sales-demo seed for Asistan Health (KKTC outpatient SMB).
 *
 *   pnpm tsx prisma/seed.ts
 *
 * Idempotent for core rows. Clinical narrative (patients / prescriptions /
 * timeline) is refreshed so re-runs fix low-quality demo copy (P1-08).
 */

import {
  PrismaClient,
  TeamRole,
  AppointmentStatus,
  TreatmentStatus,
  NotificationType,
  TimelineEventType,
  FileCategory,
  PrescriptionStatus,
  Prisma,
} from '@prisma/client'
import {
  DEMO_CLINIC_PHONE,
  assertNoForbiddenDemoPii,
  demoEmail,
  demoIdentityDocument,
  demoPersonPhone,
  demoTestLabel,
  looksLikeForbiddenDemoPii,
} from '@/lib/demo/synthetic-pii'

const prisma = new PrismaClient()

const DEMO_OWNER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: demoEmail('demo.owner'),
  fullName: demoTestLabel('Dr. Ayşe Yılmaz'),
}

const DEMO_SLUG = 'asistan-demo-klinigi'
const year = new Date().getFullYear()

function daysFromNow(days: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d
}

async function main() {
  console.log('🌱 Seeding sales-demo data (KKTC)…')

  assertNoForbiddenDemoPii('demo owner', DEMO_OWNER.email, DEMO_CLINIC_PHONE)

  const owner = await prisma.user.upsert({
    where: { id: DEMO_OWNER.id },
    create: {
      id: DEMO_OWNER.id,
      email: DEMO_OWNER.email,
      fullName: DEMO_OWNER.fullName,
    },
    update: { fullName: DEMO_OWNER.fullName, email: DEMO_OWNER.email },
  })

  let business = await prisma.business.findUnique({ where: { ownerUserId: owner.id } })
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Lefkoşa Sağlık Polikliniği (TEST Demo)',
        slug: DEMO_SLUG,
        ownerUserId: owner.id,
        email: DEMO_OWNER.email,
        phone: DEMO_CLINIC_PHONE,
        address: 'Bedrettin Demirel Cad. No:42',
        city: 'Lefkoşa',
        timezone: 'Asia/Nicosia',
        currency: 'TRY',
      },
    })
  } else {
    business = await prisma.business.update({
      where: { id: business.id },
      data: {
        name: 'Lefkoşa Sağlık Polikliniği (TEST Demo)',
        slug: DEMO_SLUG,
        email: DEMO_OWNER.email,
        phone: DEMO_CLINIC_PHONE,
        address: 'Bedrettin Demirel Cad. No:42',
        city: 'Lefkoşa',
        timezone: 'Asia/Nicosia',
        currency: 'TRY',
      },
    })
  }

  await prisma.vendorAccount.upsert({
    where: { businessId: business.id },
    create: {
      businessId: business.id,
      plan: 'STARTER',
      status: 'ACTIVE',
      isDemo: true,
    },
    update: { isDemo: true, status: 'ACTIVE' },
  })

  const location =
    (await prisma.location.findFirst({
      where: { businessId: business.id, name: 'Merkez Poliklinik' },
    })) ??
    (await prisma.location.create({
      data: {
        businessId: business.id,
        name: 'Merkez Poliklinik',
        address: 'Bedrettin Demirel Cad. No:42',
        city: 'Lefkoşa',
        phone: DEMO_CLINIC_PHONE,
        isActive: true,
        sortOrder: 0,
      },
    }))
  await prisma.location.update({
    where: { id: location.id },
    data: { phone: DEMO_CLINIC_PHONE },
  })

  const teamSeed: {
    fullName: string
    email: string
    role: TeamRole
    color: string
    specialty?: string
    prescriptionTitle?: string
  }[] = [
    {
      fullName: DEMO_OWNER.fullName,
      email: DEMO_OWNER.email,
      role: TeamRole.ISLETME_SAHIBI,
      color: '#12C8AD',
      specialty: 'Aile Hekimliği',
      prescriptionTitle: 'Uzm. Dr.',
    },
    {
      fullName: demoTestLabel('Dr. Mehmet Demir'),
      email: demoEmail('demo.doctor'),
      role: TeamRole.DOKTOR,
      color: '#16A9E8',
      specialty: 'İç Hastalıkları',
      prescriptionTitle: 'Uzm. Dr.',
    },
    {
      fullName: demoTestLabel('Elif Kaya'),
      email: demoEmail('demo.desk'),
      role: TeamRole.SEKRETER,
      color: '#F59E0B',
    },
  ]

  for (const t of teamSeed) {
    assertNoForbiddenDemoPii(`team ${t.email}`, t.email, DEMO_CLINIC_PHONE)
  }

  // Drop legacy team rows that used product-domain emails (P1-09).
  await prisma.teamMember.deleteMany({
    where: {
      businessId: business.id,
      email: {
        in: [
          'mehmet@asistan.health',
          'elif@asistan.health',
          'demo@asistan.health',
          'owner@asistan.demo',
          'doktor@asistan.demo',
          'sekreter@asistan.demo',
          'personel@asistan.demo',
          'superadmin@asistan.demo',
        ],
      },
      NOT: { email: DEMO_OWNER.email },
    },
  })

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
        isBookable: t.role === TeamRole.DOKTOR || t.role === TeamRole.ISLETME_SAHIBI,
        specialty: t.specialty ?? null,
        prescriptionTitle: t.prescriptionTitle ?? null,
        permissions:
          t.role === TeamRole.ISLETME_SAHIBI
            ? [
                'patient.view',
                'patient.edit',
                'appointment.manage',
                'team.manage',
                'analytics.view',
                'file.view',
                'medical_note.view',
                'service.manage',
              ]
            : t.role === TeamRole.DOKTOR
              ? [
                  'patient.view',
                  'patient.edit',
                  'appointment.manage',
                  'file.view',
                  'medical_note.view',
                  'analytics.view',
                ]
              : ['patient.view', 'appointment.manage', 'file.view'],
      },
      update: {
        fullName: t.fullName,
        specialty: t.specialty ?? null,
        prescriptionTitle: t.prescriptionTitle ?? null,
        isBookable: t.role === TeamRole.DOKTOR || t.role === TeamRole.ISLETME_SAHIBI,
      },
    })
  }

  const team = await prisma.teamMember.findMany({ where: { businessId: business.id } })
  const doctor = team.find((t) => t.role === TeamRole.DOKTOR) ?? team.find((t) => t.role === TeamRole.ISLETME_SAHIBI)

  const servicesSeed = [
    { name: 'Genel Muayene', durationMin: 30, price: 750, color: '#12C8AD', category: 'Muayene' },
    { name: 'Kontrol Muayenesi', durationMin: 20, price: 550, color: '#16A9E8', category: 'Muayene' },
    { name: 'Kan Tahlili Değerlendirme', durationMin: 15, price: 350, color: '#8B5CF6', category: 'Laboratuvar' },
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
  // Remove telehealth-adjacent leftover from older seeds
  await prisma.service.updateMany({
    where: { businessId: business.id, name: 'Online Konsültasyon' },
    data: { isActive: false, name: 'Online Konsültasyon (pasif)' },
  })
  const services = await prisma.service.findMany({
    where: { businessId: business.id, isActive: true },
    orderBy: { name: 'asc' },
  })

  type PatientSeed = {
    number: string
    fullName: string
    phone: string
    email?: string
    gender: string
    bloodType: string
    birthDate: Date
    identityNumber: string
    tags: string[]
    city: string
    address: string
    chronicDiseases?: string
    patientStory: string
    lastDiagnosis: string
    allergy?: { name: string; severity: 'HAFIF' | 'ORTA' | 'SIDDETLI'; reaction: string }
    medication?: { name: string; dosage: string; frequency: string }
    treatment?: { title: string; status: TreatmentStatus }
    lab?: { title: string; description: string; daysAgo: number }
    note?: { title: string; note: string }
    prescription?: {
      protocolSuffix: string
      diagnosis: string
      notes: string
      lines: Array<{
        drugName: string
        dosage: string
        frequency: string
        durationDays: number
        quantity: number
        form: string
        instructions: string
      }>
    }
  }

  const patientsSeed: PatientSeed[] = [
    {
      number: 'TEST-1001',
      fullName: demoTestLabel('Ahmet Yılmaz'),
      phone: demoPersonPhone(1),
      email: demoEmail('hasta01.test'),
      gender: 'Erkek',
      bloodType: 'A Rh+',
      birthDate: new Date('1985-03-12'),
      identityNumber: demoIdentityDocument(1),
      tags: ['TEST', 'Düzenli takip'],
      city: 'Lefkoşa',
      address: 'TEST adres — Küçük Kaymaklı No:1',
      chronicDiseases: 'Tip 2 diyabet (2021)',
      patientStory:
        'TEST kaydı. Beş yıldır aynı poliklinikte takip ediliyor. İlaç uyumu iyi; son HbA1c hedef aralığında. Penisilin alerjisi kayıtlı.',
      lastDiagnosis: 'Tip 2 diyabet — rutin kontrol',
      allergy: { name: 'Penisilin', severity: 'SIDDETLI', reaction: 'Ürtiker ve nefes darlığı' },
      medication: { name: 'Metformin', dosage: '1000 mg', frequency: 'Günde 2 (yemekle)' },
      treatment: { title: 'Diyabet izlem programı', status: TreatmentStatus.DEVAM_EDIYOR },
      lab: {
        title: 'HbA1c',
        description: 'HbA1c %6,8 (hedef <%7). Açlık glukoz 118 mg/dL.',
        daysAgo: 14,
      },
      note: {
        title: 'Kontrol özeti',
        note: 'TEST notu. Hasta stabil. Metformin dozu devam. 3 ay sonra HbA1c ve ayak muayenesi planlandı.',
      },
      prescription: {
        protocolSuffix: '00001',
        diagnosis: 'Tip 2 diyabet — rutin kontrol',
        notes: 'Yazdırılabilir klinik reçete. Resmi e-reçete ağı yoktur. (TEST)',
        lines: [
          {
            drugName: 'Metformin',
            dosage: '1000 mg',
            frequency: 'Günde 2',
            durationDays: 90,
            quantity: 180,
            form: 'Tablet',
            instructions: 'Yemeklerle birlikte alınır',
          },
        ],
      },
    },
    {
      number: 'TEST-1002',
      fullName: demoTestLabel('Zeynep Şahin'),
      phone: demoPersonPhone(2),
      email: demoEmail('hasta02.test'),
      gender: 'Kadın',
      bloodType: '0 Rh+',
      birthDate: new Date('1992-07-19'),
      identityNumber: demoIdentityDocument(2),
      tags: ['TEST', 'Gebelik takibi'],
      city: 'Girne',
      address: 'TEST adres — Alsancak No:2',
      patientStory: 'TEST kaydı. İlk trimester gebelik takibi. Demir eksikliği anemi şüphesi ile laboratuvar planlandı.',
      lastDiagnosis: 'Gebelik — demir eksikliği şüphesi',
      prescription: {
        protocolSuffix: '00002',
        diagnosis: 'Gebelik — demir desteği',
        notes: 'Folik asit ile birlikte; mide rahatsızlığında yemek sonrası. (TEST)',
        lines: [
          {
            drugName: 'Ferroglisin sülfat',
            dosage: '100 mg elemental demir',
            frequency: 'Günde 1',
            durationDays: 30,
            quantity: 30,
            form: 'Kapsül',
            instructions: 'Aç karnına veya C vitamini ile',
          },
        ],
      },
    },
    {
      number: 'TEST-1003',
      fullName: demoTestLabel('Murat Demir'),
      phone: demoPersonPhone(3),
      gender: 'Erkek',
      bloodType: 'B Rh-',
      birthDate: new Date('1970-11-02'),
      identityNumber: demoIdentityDocument(3),
      tags: ['TEST', 'Hipertansiyon'],
      city: 'Gazimağusa',
      address: 'TEST adres — Salamis Yolu No:3',
      chronicDiseases: 'Esansiyel hipertansiyon',
      patientStory: 'TEST kaydı. Evde tansiyon takibi yapıyor. Son ölçümler 138/86 mmHg civarı.',
      lastDiagnosis: 'Esansiyel hipertansiyon — stabil',
      medication: { name: 'Ramipril', dosage: '5 mg', frequency: 'Günde 1 sabah' },
    },
    {
      number: 'TEST-1004',
      fullName: demoTestLabel('Selin Aydın'),
      phone: demoPersonPhone(4),
      email: demoEmail('hasta04.test'),
      gender: 'Kadın',
      bloodType: 'AB Rh+',
      birthDate: new Date('2002-01-25'),
      identityNumber: demoIdentityDocument(4),
      tags: ['TEST', 'İlk başvuru'],
      city: 'Lefkoşa',
      address: 'TEST adres — Gönyeli No:4',
      patientStory: 'TEST kaydı. Üst solunum yolu enfeksiyonu şikâyeti ile ilk başvuru. Ateş yok, boğaz ağrısı 2 gündür.',
      lastDiagnosis: 'Akut farenjit (viral?)',
      prescription: {
        protocolSuffix: '00003',
        diagnosis: 'Akut farenjit — semptomatik tedavi',
        notes: 'Antibiyotik başlanmadı. 48 saat içinde ateş / yutma güçlüğü olursa yeniden değerlendirme. (TEST)',
        lines: [
          {
            drugName: 'Parasetamol',
            dosage: '500 mg',
            frequency: 'Gerektiğinde, en fazla günde 3',
            durationDays: 5,
            quantity: 15,
            form: 'Tablet',
            instructions: 'Aç veya tok; karaciğer hastalığı yok',
          },
          {
            drugName: 'Benzidamin sprey',
            dosage: '1-2 püskürtme',
            frequency: 'Günde 3-4',
            durationDays: 5,
            quantity: 1,
            form: 'Oral sprey',
            instructions: 'Yemeklerden sonra',
          },
        ],
      },
    },
  ]

  for (let i = 0; i < patientsSeed.length; i++) {
    const data = patientsSeed[i]
    assertNoForbiddenDemoPii(`patient ${data.number}`, data.email, data.phone)

    let patient = await prisma.patient.findFirst({
      where: { businessId: business.id, patientNumber: data.number },
    })

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          businessId: business.id,
          patientNumber: data.number,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email ?? null,
          gender: data.gender,
          bloodType: data.bloodType,
          birthDate: data.birthDate,
          identityNumber: data.identityNumber,
          tags: data.tags,
          city: data.city,
          address: data.address,
          chronicDiseases: data.chronicDiseases ?? null,
          patientStory: data.patientStory,
          lastDiagnosis: data.lastDiagnosis,
          assignedDoctorId: doctor?.id ?? null,
        },
      })
      await prisma.timelineEvent.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          type: TimelineEventType.PATIENT_CREATED,
          title: 'Hasta kaydı oluşturuldu',
          actorName: DEMO_OWNER.fullName,
        },
      })
    } else {
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email ?? null,
          gender: data.gender,
          bloodType: data.bloodType,
          birthDate: data.birthDate,
          identityNumber: data.identityNumber,
          tags: data.tags,
          city: data.city,
          address: data.address,
          chronicDiseases: data.chronicDiseases ?? null,
          patientStory: data.patientStory,
          lastDiagnosis: data.lastDiagnosis,
          assignedDoctorId: doctor?.id ?? null,
        },
      })
    }

    // Refresh clinical cards (delete+recreate for this demo patient to keep narrative coherent)
    await prisma.allergy.deleteMany({ where: { patientId: patient.id, businessId: business.id } })
    await prisma.medication.deleteMany({ where: { patientId: patient.id, businessId: business.id } })
    await prisma.treatment.deleteMany({ where: { patientId: patient.id, businessId: business.id } })
    await prisma.labResult.deleteMany({ where: { patientId: patient.id, businessId: business.id } })
    await prisma.patientNote.deleteMany({ where: { patientId: patient.id, businessId: business.id } })

    if (data.allergy) {
      await prisma.allergy.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          name: data.allergy.name,
          severity: data.allergy.severity,
          reaction: data.allergy.reaction,
        },
      })
    }
    if (data.medication) {
      await prisma.medication.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          name: data.medication.name,
          dosage: data.medication.dosage,
          frequency: data.medication.frequency,
          active: true,
        },
      })
    }
    if (data.treatment) {
      await prisma.treatment.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          title: data.treatment.title,
          status: data.treatment.status,
          doctorName: doctor?.fullName ?? null,
          startDate: daysFromNow(-90),
        },
      })
    }
    if (data.lab) {
      await prisma.labResult.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          title: data.lab.title,
          resultDate: daysFromNow(-data.lab.daysAgo),
          description: data.lab.description,
          labName: 'Lefkoşa Merkez Lab',
        },
      })
    }
    if (data.note) {
      await prisma.patientNote.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          title: data.note.title,
          note: data.note.note,
          createdBy: DEMO_OWNER.fullName,
          isPinned: true,
        },
      })
    }

    if (i === 0) {
      const fileExists = await prisma.patientFile.findFirst({
        where: { patientId: patient.id, fileName: 'hba1c-sonuc.pdf' },
      })
      if (!fileExists) {
        await prisma.patientFile.create({
          data: {
            businessId: business.id,
            patientId: patient.id,
            fileName: 'hba1c-sonuc.pdf',
            fileType: 'application/pdf',
            fileSize: 142_000,
            category: FileCategory.TAHLIL,
            storageKey: `${business.id}/${patient.id}/hba1c-sonuc.pdf`,
            fileUrl: `storage://patient-files/${business.id}/${patient.id}/hba1c-sonuc.pdf`,
            uploadedBy: DEMO_OWNER.fullName,
          },
        })
      }
    }

    // Appointments: keep one upcoming + one completed when none exist
    const apptCount = await prisma.appointment.count({
      where: { businessId: business.id, patientId: patient.id },
    })
    if (apptCount === 0 && services[0] && doctor) {
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          serviceId: services[i % services.length].id,
          staffId: doctor.id,
          locationId: location.id,
          date: daysFromNow(i + 1),
          startTime: ['09:00', '11:00', '14:00', '16:00'][i] ?? '10:00',
          endTime: ['09:30', '11:20', '14:30', '16:15'][i] ?? '10:30',
          status: AppointmentStatus.SCHEDULED,
          price: services[i % services.length].price,
        },
      })
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          serviceId: services[0].id,
          staffId: doctor.id,
          locationId: location.id,
          date: daysFromNow(-(i + 1) * 7),
          startTime: '11:00',
          endTime: '11:30',
          status: AppointmentStatus.COMPLETED,
          price: services[0].price,
        },
      })
    }

    if (data.prescription && doctor) {
      const protocolNo = `RX-${year}-${data.prescription.protocolSuffix}`
      let rx = await prisma.prescription.findFirst({
        where: { businessId: business.id, protocolNo },
      })
      if (rx) {
        await prisma.prescriptionLine.deleteMany({ where: { prescriptionId: rx.id } })
        rx = await prisma.prescription.update({
          where: { id: rx.id },
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            status: PrescriptionStatus.ISSUED,
            diagnosis: data.prescription.diagnosis,
            notes: data.prescription.notes,
            allergyWarning: data.allergy?.name ?? null,
            patientFullName: data.fullName,
            patientIdentityNumber: data.identityNumber,
            patientBirthDate: data.birthDate,
            patientGender: data.gender,
            patientPhone: data.phone,
            patientAddress: data.address,
            patientCity: data.city,
            doctorTitle: doctor.prescriptionTitle ?? 'Uzm. Dr.',
            doctorFullName: doctor.fullName,
            doctorSpecialty: doctor.specialty ?? 'İç Hastalıkları',
            clinicName: business.name,
            clinicAddress: business.address,
            clinicCity: business.city,
            clinicPhone: business.phone,
            issuedAt: daysFromNow(-(i + 2)),
            lines: {
              create: data.prescription.lines.map((line, index) => ({
                sortOrder: index,
                ...line,
              })),
            },
          },
        })
      } else {
        rx = await prisma.prescription.create({
          data: {
            businessId: business.id,
            patientId: patient.id,
            doctorId: doctor.id,
            protocolNo,
            status: PrescriptionStatus.ISSUED,
            diagnosis: data.prescription.diagnosis,
            notes: data.prescription.notes,
            allergyWarning: data.allergy?.name ?? null,
            patientFullName: data.fullName,
            patientIdentityNumber: data.identityNumber,
            patientBirthDate: data.birthDate,
            patientGender: data.gender,
            patientPhone: data.phone,
            patientAddress: data.address,
            patientCity: data.city,
            doctorTitle: doctor.prescriptionTitle ?? 'Uzm. Dr.',
            doctorFullName: doctor.fullName,
            doctorSpecialty: doctor.specialty ?? 'İç Hastalıkları',
            clinicName: business.name,
            clinicAddress: business.address,
            clinicCity: business.city,
            clinicPhone: business.phone,
            createdByUserId: owner.id,
            issuedAt: daysFromNow(-(i + 2)),
            lines: {
              create: data.prescription.lines.map((line, index) => ({
                sortOrder: index,
                ...line,
              })),
            },
          },
        })
      }

      // Single audit-style timeline row with metadata (health timeline prefers Prescription entity)
      await prisma.timelineEvent.deleteMany({
        where: {
          businessId: business.id,
          patientId: patient.id,
          OR: [
            { title: { contains: 'E-recete', mode: 'insensitive' } },
            { title: { contains: 'E-reçete', mode: 'insensitive' } },
            { title: { contains: 'Klinik reçete', mode: 'insensitive' } },
            { description: { startsWith: 'RX-' } },
          ],
        },
      })
      await prisma.timelineEvent.create({
        data: {
          businessId: business.id,
          patientId: patient.id,
          type: TimelineEventType.PATIENT_UPDATED,
          title: 'Klinik reçete oluşturuldu',
          description: `${protocolNo} • ${data.prescription.diagnosis}`,
          actorName: doctor.fullName,
          actorId: owner.id,
          metadata: { prescriptionId: rx.id },
          createdAt: daysFromNow(-(i + 2)),
        },
      })
    }
  }

  // P1-09: scrub leftover demo-clinic contacts that still look like real people.
  const keepNumbers = new Set(patientsSeed.map((p) => p.number))
  const leftoverPatients = await prisma.patient.findMany({
    where: { businessId: business.id },
    select: { id: true, email: true, phone: true, fullName: true, patientNumber: true, tags: true },
  })
  let scrubbed = 0
  for (const row of leftoverPatients) {
    if (keepNumbers.has(row.patientNumber)) continue
    const contactBlob = `${row.email ?? ''} ${row.phone ?? ''}`
    const needsScrub =
      looksLikeForbiddenDemoPii(contactBlob) ||
      !/\(TEST\)/i.test(row.fullName) ||
      !/^TEST-/i.test(row.patientNumber)
    if (!needsScrub) continue
    const scrubIndex = 50 + (scrubbed % 40)
    await prisma.patient.update({
      where: { id: row.id },
      data: {
        fullName: demoTestLabel(row.fullName.replace(/\s*\(TEST\)\s*/gi, ' ').trim() || 'Anonim Hasta'),
        phone: demoPersonPhone(scrubIndex),
        email: demoEmail(`legacy.${row.id.slice(0, 8)}.test`),
        identityNumber: demoIdentityDocument(scrubIndex),
        address: row.patientNumber ? `TEST adres — legacy ${row.patientNumber}` : 'TEST adres — legacy',
        tags: Array.from(new Set([...(row.tags ?? []), 'TEST', 'legacy-scrub'])),
      },
    })
    scrubbed += 1
  }
  if (scrubbed > 0) {
    console.log(`🧹 Scrubbed ${scrubbed} legacy patient contact(s) to synthetic PII`)
  }

  // Scrub legacy bad titles still hanging on other patients
  await prisma.timelineEvent.updateMany({
    where: {
      businessId: business.id,
      title: { contains: 'E-recete', mode: 'insensitive' },
    },
    data: { title: 'Klinik reçete oluşturuldu' },
  })
  await prisma.timelineEvent.updateMany({
    where: {
      businessId: business.id,
      title: { contains: 'olusturuldu', mode: 'insensitive' },
    },
    data: { title: 'Klinik reçete oluşturuldu' },
  })

  const welcomeExists = await prisma.notification.findFirst({
    where: {
      businessId: business.id,
      userId: owner.id,
      title: { contains: 'hoş geldiniz' },
    },
  })
  if (!welcomeExists) {
    await prisma.notification.create({
      data: {
        businessId: business.id,
        userId: owner.id,
        type: NotificationType.SYSTEM,
        title: 'Asistan Health’a hoş geldiniz',
        message:
          'TEST demo kliniği hazır: Lefkoşa polikliniği, 4 örnek hasta, klinik reçeteler ve ajanda kayıtları yüklendi.',
      },
    })
  }

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
