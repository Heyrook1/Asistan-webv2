import { prisma } from '@/lib/prisma'
import { requireSuperAdminSession } from '@/lib/session'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import {
  DEFAULT_VENDOR_MEMBERSHIP_STATUS,
  normalizeVendorPlanCode,
  type VendorMembershipStatusValue,
} from '@/lib/vendor-membership'
import { VendorAdminBoard } from './vendor-admin-board'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

type DailyCountRow = {
  day: Date
  count: number
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function dateLabel(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

function keyOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildSeries(
  days: Date[],
  appointments: Map<string, number>,
  patients: Map<string, number>,
  messages: Map<string, number>
) {
  return days.map((day) => {
    const key = keyOf(day)
    return {
      key,
      label: dateLabel(day),
      appointments: appointments.get(key) ?? 0,
      patients: patients.get(key) ?? 0,
      messages: messages.get(key) ?? 0,
    }
  })
}

function mapRows(rows: DailyCountRow[]) {
  return new Map(rows.map((row) => [keyOf(new Date(row.day)), Number(row.count)]))
}

function asNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') return Number(value)
  return 0
}

export default async function SystemAdminPage() {
  await requireSuperAdminSession()

  const today = startOfToday()
  const last14 = new Date(today)
  last14.setDate(last14.getDate() - 13)
  const last30 = new Date(today)
  last30.setDate(last30.getDate() - 29)

  const days = Array.from({ length: 14 }, (_, index) => {
    const d = new Date(last14)
    d.setDate(last14.getDate() + index)
    return d
  })

  const [
    totalAppointments,
    totalPatients,
    totalVendors,
    activeVendors,
    totalTeamMembers,
    pendingAppointments,
    noShowLast30,
    totalLast30,
    messagesToday,
    notificationsToday,
    newPatientsToday,
    activeStaffToday,
    appointmentRowsRaw,
    patientRowsRaw,
    messageRowsRaw,
  ] = await runWithTenantBypassAsync('super-admin:platform-metrics', () =>
    Promise.all([
      prisma.appointment.count(),
      prisma.patient.count(),
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.teamMember.count({ where: { isActive: true } }),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
      prisma.appointment.count({
        where: {
          status: 'NO_SHOW',
          createdAt: { gte: last30 },
        },
      }),
      prisma.appointment.count({
        where: {
          createdAt: { gte: last30 },
        },
      }),
      prisma.message.count({ where: { createdAt: { gte: today } } }),
      prisma.notification.count({ where: { createdAt: { gte: today } } }),
      prisma.patient.count({ where: { createdAt: { gte: today } } }),
      prisma.teamMember.count({ where: { isActive: true, lastSeenAt: { gte: today } } }),
      prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Appointment"
      WHERE "createdAt" >= ${last14}
      GROUP BY 1
      ORDER BY 1
    `,
      prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Patient"
      WHERE "createdAt" >= ${last14}
      GROUP BY 1
      ORDER BY 1
    `,
      prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Message"
      WHERE "createdAt" >= ${last14}
      GROUP BY 1
      ORDER BY 1
    `,
    ]),
  )

  let vendorSchemaReady = true
  let vendors: Array<{
    id: string
    name: string
    slug: string
    isActive: boolean
    createdAt: Date
    owner: { fullName: string; email: string }
    vendorAccount: null | {
      status: VendorMembershipStatusValue
      plan: string
      balance: Prisma.Decimal
      currency: string
      notes: string | null
    }
    _count: { members: number; patients: number; appointments: number }
  }>

  try {
    vendors = await runWithTenantBypassAsync('super-admin:platform-metrics', () =>
      prisma.business.findMany({
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        include: {
          owner: { select: { fullName: true, email: true } },
          vendorAccount: {
            select: {
              status: true,
              plan: true,
              balance: true,
              currency: true,
              notes: true,
            },
          },
          _count: {
            select: {
              members: true,
              patients: true,
              appointments: true,
            },
          },
        },
        take: 200,
      }),
    )
  } catch {
    vendorSchemaReady = false
    const fallback = await runWithTenantBypassAsync('super-admin:platform-metrics', () =>
      prisma.business.findMany({
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
        include: {
          owner: { select: { fullName: true, email: true } },
          _count: {
            select: {
              members: true,
              patients: true,
              appointments: true,
            },
          },
        },
        take: 200,
      }),
    )
    vendors = fallback.map((vendor) => ({ ...vendor, vendorAccount: null }))
  }

  const appointmentMap = mapRows(appointmentRowsRaw)
  const patientMap = mapRows(patientRowsRaw)
  const messageMap = mapRows(messageRowsRaw)
  const points = buildSeries(days, appointmentMap, patientMap, messageMap)

  const noShowRate30d = totalLast30 > 0 ? (noShowLast30 / totalLast30) * 100 : 0
  const highestDailyAppointmentLoad = Math.max(...points.map((point) => point.appointments), 0)

  const alerts: string[] = []
  if (pendingAppointments > 150) {
    alerts.push(`Bekleyen randevu sayısı yüksek (${pendingAppointments}). Onay süreçlerini hızlandırmanız önerilir.`)
  }
  if (noShowRate30d >= 18) {
    alerts.push(`No-show oranı kritik seviyede (%${noShowRate30d.toFixed(1)}). Hatırlatma akışları ve doğrulama mesajları gözden geçirilmeli.`)
  }
  if (highestDailyAppointmentLoad >= 250) {
    alerts.push(`Son 14 günde tek günde ${highestDailyAppointmentLoad} randevu oluşturuldu. Kapasite planı için personel/vardiya takvimi kontrol edilmeli.`)
  }

  const totalBalance = vendors.reduce((sum, vendor) => sum + asNumber(vendor.vendorAccount?.balance), 0)

  return (
    <VendorAdminBoard
      schemaReady={vendorSchemaReady}
      metrics={[
        {
          label: 'Toplam Randevu',
          value: totalAppointments.toLocaleString('tr-TR'),
          hint: 'Sistem genelinde tüm zamanlar',
        },
        {
          label: 'Toplam Kayıtlı Hasta',
          value: totalPatients.toLocaleString('tr-TR'),
          hint: 'Sistem genelinde tüm business kayıtları',
        },
        {
          label: 'Toplam Vendor',
          value: totalVendors.toLocaleString('tr-TR'),
          hint: `${activeVendors.toLocaleString('tr-TR')} vendor aktif`,
        },
        {
          label: 'Aktif Team Üyesi',
          value: totalTeamMembers.toLocaleString('tr-TR'),
          hint: 'Aktif üyelik statüsünde personeller',
        },
        {
          label: 'Toplam Vendor Balance',
          value: `${totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRY`,
          hint: 'Vendor hesap bakiyelerinin toplamı',
        },
      ]}
      traffic={{
        appointmentsToday: appointmentMap.get(keyOf(today)) ?? 0,
        newPatientsToday,
        messagesToday,
        notificationsToday,
        activeStaffToday,
        pendingAppointments,
        noShowRate30d,
        points,
        alerts,
      }}
      vendors={vendors.map((vendor) => ({
        businessId: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        isVendorActive: vendor.isActive,
        ownerName: vendor.owner.fullName,
        ownerEmail: vendor.owner.email,
        status: vendor.vendorAccount?.status ?? DEFAULT_VENDOR_MEMBERSHIP_STATUS,
        plan: normalizeVendorPlanCode(vendor.vendorAccount?.plan),
        balance: asNumber(vendor.vendorAccount?.balance),
        currency: vendor.vendorAccount?.currency ?? 'TRY',
        notes: vendor.vendorAccount?.notes ?? '',
        members: vendor._count.members,
        patients: vendor._count.patients,
        appointments: vendor._count.appointments,
        createdAt: vendor.createdAt.toLocaleDateString('tr-TR'),
      }))}
    />
  )
}
