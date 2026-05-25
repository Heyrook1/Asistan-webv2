import { prisma } from '@/lib/prisma'
import { requireSuperAdminSession } from '@/lib/session'
import {
  DEFAULT_VENDOR_MEMBERSHIP_STATUS,
  normalizeVendorPlanCode,
  type VendorMembershipStatusValue,
} from '@/lib/vendor-membership'
import { SuperAdminBoard } from './super-admin-board'
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

function keyOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function labelOf(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

function mapRows(rows: DailyCountRow[]) {
  return new Map(rows.map((row) => [keyOf(new Date(row.day)), Number(row.count)]))
}

function asNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  if (typeof value === 'bigint') return Number(value)
  return 0
}

export default async function SuperAdminPage() {
  const session = await requireSuperAdminSession()

  const today = startOfToday()
  const last30 = new Date(today)
  last30.setDate(last30.getDate() - 29)
  const last7 = new Date(today)
  last7.setDate(last7.getDate() - 6)

  const days = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(last30)
    day.setDate(last30.getDate() + index)
    return day
  })

  const [
    totalBusinesses,
    activeBusinesses,
    totalUsers,
    activeUsers,
    totalTeamMembers,
    activeTeamMembers,
    totalPatients,
    totalAppointments,
    totalMessages,
    totalNotifications,
    openReminders,
    overdueReminders,
    pendingAppointments,
    noShowLast30,
    totalAppointmentLast30,
    appointmentsToday,
    patientsToday,
    messagesToday,
    notificationsToday,
    appointmentRowsRaw,
    patientRowsRaw,
    messageRowsRaw,
    notificationRowsRaw,
    topAppointments30Raw,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.teamMember.count(),
    prisma.teamMember.count({ where: { isActive: true } }),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.message.count(),
    prisma.notification.count(),
    prisma.reminder.count({ where: { isDone: false } }),
    prisma.reminder.count({ where: { isDone: false, dueAt: { lt: new Date() } } }),
    prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
    prisma.appointment.count({
      where: {
        status: 'NO_SHOW',
        createdAt: { gte: last30 },
      },
    }),
    prisma.appointment.count({ where: { createdAt: { gte: last30 } } }),
    prisma.appointment.count({ where: { createdAt: { gte: today } } }),
    prisma.patient.count({ where: { createdAt: { gte: today } } }),
    prisma.message.count({ where: { createdAt: { gte: today } } }),
    prisma.notification.count({ where: { createdAt: { gte: today } } }),
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Appointment"
      WHERE "createdAt" >= ${last30}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Patient"
      WHERE "createdAt" >= ${last30}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Message"
      WHERE "createdAt" >= ${last30}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<DailyCountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM "Notification"
      WHERE "createdAt" >= ${last30}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.appointment.groupBy({
      by: ['businessId'],
      where: { createdAt: { gte: last30 } },
      _count: { businessId: true },
      orderBy: { _count: { businessId: 'desc' } },
      take: 15,
    }),
  ])

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
      isDemo: boolean
      plan: string
      balance: Prisma.Decimal
      currency: string
      accessStartAt: Date | null
      accessEndAt: Date | null
      packageDurationDays: number | null
      notes: string | null
    }
    _count: { members: number; patients: number; appointments: number }
  }>

  try {
    vendors = await prisma.business.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      include: {
        owner: { select: { fullName: true, email: true } },
        vendorAccount: {
          select: {
            status: true,
            isDemo: true,
            plan: true,
            balance: true,
            currency: true,
            accessStartAt: true,
            accessEndAt: true,
            packageDurationDays: true,
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
      take: 250,
    })
  } catch {
    vendorSchemaReady = false
    const fallback = await prisma.business.findMany({
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
      take: 250,
    })
    vendors = fallback.map((vendor) => ({ ...vendor, vendorAccount: null }))
  }

  const recentActivity = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 25,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      createdAt: true,
      business: { select: { name: true } },
      actor: { select: { fullName: true, email: true } },
    },
  })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 40,
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          memberships: true,
          notifications: true,
        },
      },
      memberships: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          role: true,
          isActive: true,
          business: {
            select: { name: true },
          },
        },
      },
    },
  })

  const appointmentMap = mapRows(appointmentRowsRaw)
  const patientMap = mapRows(patientRowsRaw)
  const messageMap = mapRows(messageRowsRaw)
  const notificationMap = mapRows(notificationRowsRaw)

  const points = days.map((day) => {
    const key = keyOf(day)
    return {
      key,
      label: labelOf(day),
      appointments: appointmentMap.get(key) ?? 0,
      patients: patientMap.get(key) ?? 0,
      messages: messageMap.get(key) ?? 0,
      notifications: notificationMap.get(key) ?? 0,
    }
  })

  const sevenDayAppointments = points.slice(-7).reduce((sum, point) => sum + point.appointments, 0)
  const sevenDayPatients = points.slice(-7).reduce((sum, point) => sum + point.patients, 0)
  const sevenDayMessages = points.slice(-7).reduce((sum, point) => sum + point.messages, 0)
  const averageDailyAppointments = Math.round(points.reduce((sum, point) => sum + point.appointments, 0) / points.length)
  const peakDayAppointments = Math.max(...points.map((point) => point.appointments), 0)
  const noShowRate30d = totalAppointmentLast30 > 0 ? (noShowLast30 / totalAppointmentLast30) * 100 : 0

  const alerts: string[] = []
  if (pendingAppointments > 180) {
    alerts.push(`Bekleyen randevu hacmi yüksek (${pendingAppointments}). Süreç darboğazı olabilir.`)
  }
  if (overdueReminders > 40) {
    alerts.push(`Süresi geçen açık hatırlatma adedi yüksek (${overdueReminders}). Operasyon SLA takip edilmeli.`)
  }
  if (noShowRate30d >= 18) {
    alerts.push(`No-show oranı kritik (%${noShowRate30d.toFixed(1)}). Hatırlatma ve doğrulama akışlarını sıkılaştırın.`)
  }
  if (activeUsers / Math.max(totalUsers, 1) < 0.65) {
    alerts.push('Aktif kullanıcı oranı düşük. Pasif hesaplar ve erişim durumları gözden geçirilmeli.')
  }
  if (alerts.length === 0) {
    alerts.push('Kritik sistem alarmı görünmüyor. Trafik ve kaynak dengesi stabil.')
  }

  const appointments30Map = new Map(topAppointments30Raw.map((row) => [row.businessId, row._count.businessId]))
  const vendorRows = vendors
    .map((vendor) => ({
      businessId: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      isVendorActive: vendor.isActive,
      ownerName: vendor.owner.fullName,
      ownerEmail: vendor.owner.email,
      status: vendor.vendorAccount?.status ?? DEFAULT_VENDOR_MEMBERSHIP_STATUS,
      isDemo: vendor.vendorAccount?.isDemo ?? false,
      plan: normalizeVendorPlanCode(vendor.vendorAccount?.plan),
      balance: asNumber(vendor.vendorAccount?.balance),
      currency: vendor.vendorAccount?.currency ?? 'TRY',
      accessStartAt: vendor.vendorAccount?.accessStartAt ? vendor.vendorAccount.accessStartAt.toISOString() : null,
      accessEndAt: vendor.vendorAccount?.accessEndAt ? vendor.vendorAccount.accessEndAt.toISOString() : null,
      packageDurationDays: vendor.vendorAccount?.packageDurationDays ?? null,
      notes: vendor.vendorAccount?.notes ?? '',
      members: vendor._count.members,
      patients: vendor._count.patients,
      appointmentsTotal: vendor._count.appointments,
      appointments30d: appointments30Map.get(vendor.id) ?? 0,
      createdAt: vendor.createdAt.toLocaleDateString('tr-TR'),
    }))
    .sort((a, b) => b.appointments30d - a.appointments30d || b.appointmentsTotal - a.appointmentsTotal)

  const totalBalance = vendorRows.reduce((sum, vendor) => sum + vendor.balance, 0)
  const demoVendorCount = vendorRows.filter((vendor) => vendor.isDemo).length
  const expiringSoonCount = vendorRows.filter((vendor) => {
    if (!vendor.accessEndAt) return false
    const remainingMs = new Date(vendor.accessEndAt).getTime() - Date.now()
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))
    return remainingDays >= 0 && remainingDays <= 3
  }).length

  return (
    <SuperAdminBoard
      schemaReady={vendorSchemaReady}
      currentUserId={session.userId}
      metrics={[
        {
          label: 'Toplam Vendor',
          value: totalBusinesses.toLocaleString('tr-TR'),
          hint: `${activeBusinesses.toLocaleString('tr-TR')} aktif, ${(totalBusinesses - activeBusinesses).toLocaleString('tr-TR')} pasif`,
        },
        {
          label: 'Demo Vendor',
          value: demoVendorCount.toLocaleString('tr-TR'),
          hint: `${expiringSoonCount.toLocaleString('tr-TR')} hesabın süresi 3 gün içinde doluyor`,
        },
        {
          label: 'Toplam Kullanıcı',
          value: totalUsers.toLocaleString('tr-TR'),
          hint: `${activeUsers.toLocaleString('tr-TR')} aktif hesap`,
        },
        {
          label: 'Toplam Team Üyesi',
          value: totalTeamMembers.toLocaleString('tr-TR'),
          hint: `${activeTeamMembers.toLocaleString('tr-TR')} aktif üyelik`,
        },
        {
          label: 'Toplam Randevu',
          value: totalAppointments.toLocaleString('tr-TR'),
          hint: 'Sistem genelinde tüm zamanlar',
        },
        {
          label: 'Toplam Hasta',
          value: totalPatients.toLocaleString('tr-TR'),
          hint: 'Platform genelinde kayıtlı hasta',
        },
        {
          label: 'Toplam Mesaj',
          value: totalMessages.toLocaleString('tr-TR'),
          hint: 'İç mesajlaşma trafiği',
        },
        {
          label: 'Toplam Bildirim',
          value: totalNotifications.toLocaleString('tr-TR'),
          hint: `${notificationsToday.toLocaleString('tr-TR')} bugün üretildi`,
        },
        {
          label: 'Vendor Balance Toplamı',
          value: `${totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRY`,
          hint: `${openReminders.toLocaleString('tr-TR')} açık hatırlatma`,
        },
      ]}
      traffic={{
        appointmentsToday,
        patientsToday,
        messagesToday,
        notificationsToday,
        appointmentsLast7d: sevenDayAppointments,
        patientsLast7d: sevenDayPatients,
        messagesLast7d: sevenDayMessages,
        pendingAppointments,
        noShowRate30d,
        averageDailyAppointments,
        peakDayAppointments,
        overdueReminders,
        points,
        alerts,
      }}
      vendors={vendorRows}
      users={users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        role: user.memberships[0]?.role ?? 'PERSONEL',
        businessName: user.memberships[0]?.business.name ?? '-',
        membershipIsActive: user.memberships[0]?.isActive ?? false,
        membershipsCount: user._count.memberships,
        notificationsCount: user._count.notifications,
        createdAt: user.createdAt.toLocaleDateString('tr-TR'),
      }))}
      recentActivity={recentActivity.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        businessName: item.business.name,
        actor: item.actor?.fullName ?? item.actor?.email ?? 'Sistem',
        createdAt: item.createdAt.toLocaleString('tr-TR'),
      }))}
    />
  )
}
