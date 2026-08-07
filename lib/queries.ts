import 'server-only'

import type { PatientFile, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import {
  MESSAGE_MEDIA_BUCKET,
  MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS,
  PATIENT_FILES_BUCKET,
  PATIENT_FILE_SIGNED_URL_TTL_SECONDS,
} from '@/lib/storage-constants'
import type { NotificationListItem } from '@/lib/notifications/types'
import { deriveStatus } from '@/lib/notifications/types'
import { can, type SessionContext } from '@/lib/rbac'
import {
  parseAnalyticsMonthRange,
  type AnalyticsMonthRange,
} from '@/lib/analytics-range'
import { logPhiAccess } from '@/lib/observability/phi-access'
import { withPerfSpan } from '@/lib/observability/logger'

export type { AnalyticsMonthRange }
export { parseAnalyticsMonthRange }

export type AnalyticsMonthPoint = {
  month: string
  revenue: number
  total: number
  completed: number
  cancelled: number
}

export type AnalyticsBreakdownRow = {
  id: string
  name: string
  count: number
  revenue: number
}

function applyAppointmentViewScope(where: Prisma.AppointmentWhereInput, viewer: SessionContext) {
  if (can(viewer, 'appointment.view') || can(viewer, 'appointment.manage')) return
  if (viewer.staffMemberId) {
    where.staffId = viewer.staffMemberId
  } else {
    where.id = { in: [] }
  }
}

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export async function getDashboardStats(businessId: string) {
  const now = new Date()
  const today = dateOnly(now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [
    todayAppointments,
    pendingAppointments,
    activePatients,
    monthlyAppointments,
    completedAppointments,
    cancelledAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { businessId, date: today, status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
    prisma.appointment.count({ where: { businessId, status: 'SCHEDULED' } }),
    prisma.patient.count({ where: { businessId, isArchived: false } }),
    prisma.appointment.findMany({
      where: {
        businessId,
        date: { gte: monthStart, lt: monthEnd },
        status: 'COMPLETED',
      },
      select: { price: true },
    }),
    prisma.appointment.count({ where: { businessId, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { businessId, status: { in: ['CANCELLED', 'NO_SHOW'] } } }),
  ])

  const totalAppointments = completedAppointments + cancelledAppointments + pendingAppointments
  const monthlyRevenue = monthlyAppointments.reduce(
    (acc, a) => acc + (a.price ? Number(a.price) : 0),
    0
  )

  return {
    todayAppointments,
    pendingAppointments,
    activePatients,
    monthlyRevenue,
    completedAppointments,
    cancellationRate: totalAppointments > 0 ? cancelledAppointments / totalAppointments : 0,
  }
}

/** Pending approvals for nav badge — respects own-view staff scope. */
export async function getPendingAppointmentCount(businessId: string, viewer: SessionContext) {
  const where: Prisma.AppointmentWhereInput = {
    businessId,
    status: 'SCHEDULED',
  }
  applyAppointmentViewScope(where, viewer)
  return prisma.appointment.count({ where })
}

export async function getPatientsList(
  businessId: string,
  options: {
    query?: string
    tag?: string
    archived?: boolean
    take?: number
    actorUserId?: string
  } = {}
) {
  const where: Prisma.PatientWhereInput = {
    businessId,
    isArchived: options.archived ?? false,
  }
  if (options.query) {
    where.OR = [
      { fullName: { contains: options.query, mode: 'insensitive' } },
      { phone: { contains: options.query, mode: 'insensitive' } },
      { email: { contains: options.query, mode: 'insensitive' } },
      { patientNumber: { contains: options.query, mode: 'insensitive' } },
      { identityNumber: { contains: options.query, mode: 'insensitive' } },
    ]
  }
  if (options.tag) where.tags = { has: options.tag }

  const rows = await withPerfSpan(
    'patients.list',
    'db.query',
    () =>
      prisma.patient.findMany({
        where,
        take: options.take ?? 100,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          patientNumber: true,
          fullName: true,
          phone: true,
          email: true,
          gender: true,
          birthDate: true,
          tags: true,
          riskNote: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { appointments: true, files: true, notes: true, allergies: true } },
        },
      }),
    { hasQuery: Boolean(options.query) }
  )

  if (options.query && options.actorUserId) {
    logPhiAccess({
      businessId,
      actorUserId: options.actorUserId,
      action: 'patient.search',
      summary: 'Hasta listesi araması',
      metadata: {
        hitCount: rows.length,
        queryLen: options.query.trim().length,
        source: 'patients.list',
      },
    })
  }

  return rows
}

export async function getPatientDetail(
  businessId: string,
  patientId: string,
  options: {
    includeMedicalNotes?: boolean
    includeFiles?: boolean
    actorUserId?: string
  } = {}
) {
  return withPerfSpan(
    'patients.detail',
    'db.query',
    async () => {
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, businessId },
        include: {
          assignedDoctor: { select: { id: true, fullName: true, color: true } },
          notes: {
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
            include: { creator: { select: { fullName: true, email: true } } },
          },
          medications: { orderBy: { createdAt: 'desc' } },
          allergies: { orderBy: { createdAt: 'desc' } },
          treatments: { orderBy: { createdAt: 'desc' } },
          treatmentPlan: { orderBy: { order: 'asc' } },
          labResults: { orderBy: { resultDate: 'desc' } },
          files: { orderBy: { uploadedAt: 'desc' } },
          appointments: {
            orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
            include: {
              service: { select: { name: true, color: true } },
              staff: { select: { fullName: true } },
              location: { select: { name: true } },
            },
          },
          timeline: { orderBy: { createdAt: 'desc' }, take: 50 },
        },
      })

      if (!patient) return null

      const includeMedicalNotes = options.includeMedicalNotes ?? true
      const includeFiles = options.includeFiles ?? true
      const files = includeFiles ? await signPatientFiles(patient.files) : []

      if (options.actorUserId) {
        logPhiAccess({
          businessId,
          actorUserId: options.actorUserId,
          action: 'patient.view',
          entityId: patientId,
          summary: 'Hasta kartı görüntülendi',
          metadata: {
            includeNotes: includeMedicalNotes,
            includeFiles,
            fileCount: files.length,
            source: 'patients.detail',
          },
        })
        if (includeFiles && files.length > 0) {
          logPhiAccess({
            businessId,
            actorUserId: options.actorUserId,
            action: 'patient.file.view',
            entityId: patientId,
            summary: 'Hasta dosyaları için imzalı URL üretildi',
            metadata: {
              fileCount: files.length,
              source: 'patients.detail.sign',
            },
          })
        }
      }

      return {
        ...patient,
        riskNote: includeMedicalNotes ? patient.riskNote : null,
        summary: includeMedicalNotes ? patient.summary : null,
        patientStory: includeMedicalNotes ? patient.patientStory : null,
        familyHistory: includeMedicalNotes ? patient.familyHistory : null,
        notes: includeMedicalNotes ? patient.notes : [],
        aiSuggestions: includeMedicalNotes ? patient.aiSuggestions : null,
        timeline: includeMedicalNotes
          ? patient.timeline
          : patient.timeline
              .filter((event) => event.type !== 'NOTE_ADDED')
              .map((event) => ({ ...event, description: null })),
        files,
      }
    },
    { includeFiles: options.includeFiles !== false }
  )
}

async function batchSignStorageKeys(
  bucket: string,
  storageKeys: string[],
  ttlSeconds: number
): Promise<Map<string, string>> {
  if (storageKeys.length === 0) return new Map()
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(storageKeys, ttlSeconds)
  if (error || !data) return new Map()
  const result = new Map<string, string>()
  for (const item of data) {
    if (item.path && !item.error && item.signedUrl) {
      result.set(item.path, item.signedUrl)
    }
  }
  return result
}

async function signPatientFiles(files: PatientFile[]) {
  if (files.length === 0) return files
  const validKeys = files
    .filter((f) => f.storageKey.startsWith(`${f.businessId}/${f.patientId}/`))
    .map((f) => f.storageKey)
  const urlMap = await batchSignStorageKeys(
    PATIENT_FILES_BUCKET,
    validKeys,
    PATIENT_FILE_SIGNED_URL_TTL_SECONDS
  )
  return files.map((file) => ({
    ...file,
    fileUrl: urlMap.get(file.storageKey) ?? '',
  }))
}

export async function getServicesList(businessId: string) {
  return prisma.service.findMany({
    where: { businessId },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })
}

export async function getTeamList(businessId: string) {
  return prisma.teamMember.findMany({
    where: { businessId },
    orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
  })
}

export async function getAppointmentsRange(
  businessId: string,
  range: { from: Date; to: Date; staffId?: string; serviceId?: string; locationId?: string },
  viewer: SessionContext
) {
  const where: Prisma.AppointmentWhereInput = {
    businessId,
    date: { gte: range.from, lte: range.to },
  }
  if (range.staffId) where.staffId = range.staffId
  if (range.serviceId) where.serviceId = range.serviceId
  if (range.locationId) where.locationId = range.locationId
  applyAppointmentViewScope(where, viewer)
  return prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take: 2500,
    include: {
      patient: { select: { id: true, fullName: true, phone: true } },
      service: { select: { id: true, name: true, color: true, durationMin: true } },
      staff: { select: { id: true, fullName: true, color: true } },
      location: { select: { id: true, name: true } },
    },
  })
}

const appointmentBoardInclude = {
  patient: { select: { id: true, fullName: true, phone: true } },
  service: { select: { id: true, name: true, color: true, durationMin: true } },
  staff: { select: { id: true, fullName: true, color: true } },
  location: { select: { id: true, name: true } },
} as const

export async function getAppointmentsList(
  businessId: string,
  options: { status?: string; from?: Date; to?: Date; locationId?: string } = {},
  viewer: SessionContext
) {
  const where: Prisma.AppointmentWhereInput = { businessId }
  if (options.status) where.status = options.status as Prisma.AppointmentWhereInput['status']
  if (options.from || options.to) {
    where.date = {}
    if (options.from) where.date.gte = options.from
    if (options.to) where.date.lte = options.to
  }
  if (options.locationId) where.locationId = options.locationId
  applyAppointmentViewScope(where, viewer)
  return prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    take: 200,
    include: appointmentBoardInclude,
  })
}

/** Deep-link rescue when the row is outside the list `take: 200` window. */
export async function getAppointmentForBoard(
  businessId: string,
  appointmentId: string,
  viewer: SessionContext,
) {
  const where: Prisma.AppointmentWhereInput = { id: appointmentId, businessId }
  applyAppointmentViewScope(where, viewer)
  return prisma.appointment.findFirst({
    where,
    include: appointmentBoardInclude,
  })
}

export async function getNotificationsList(businessId: string, userId: string, take = 100) {
  return prisma.notification.findMany({
    where: {
      businessId,
      OR: [{ userId }, { userId: null }],
      archivedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      actor: { select: { id: true, fullName: true } },
      actions: { orderBy: { createdAt: 'asc' } },
    },
  })
}

export async function getNotificationById(notificationId: string, businessId: string, userId: string) {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      businessId,
      OR: [{ userId }, { userId: null }],
    },
    include: {
      actor: { select: { id: true, fullName: true } },
      actions: { orderBy: { createdAt: 'asc' } },
    },
  })
}

/**
 * Serializes a notification row (with its actor + actions) into a
 * client-safe shape. Centralized so every UI consumer reads the same data.
 */
export function serializeNotification(
  row: Awaited<ReturnType<typeof getNotificationsList>>[number]
): NotificationListItem {
  return {
    id: row.id,
    type: row.type,
    subtype: row.subtype,
    title: row.title,
    message: row.message,
    link: row.link,
    entityType: row.entityType,
    entityId: row.entityId,
    priority: row.priority,
    actionRequired: row.actionRequired,
    metadata: (row.metadata ?? null) as Record<string, unknown> | null,
    isRead: row.isRead,
    status: deriveStatus({ isRead: row.isRead, archivedAt: row.archivedAt }),
    readAt: row.readAt ? row.readAt.toISOString() : null,
    archivedAt: row.archivedAt ? row.archivedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    actor: row.actor ? { id: row.actor.id, fullName: row.actor.fullName } : null,
    actions: row.actions.map((a) => ({
      id: a.id,
      label: a.label,
      actionType: a.actionType,
      payload: (a.payload ?? null) as Record<string, unknown> | null,
      status: a.status,
      completedAt: a.completedAt ? a.completedAt.toISOString() : null,
    })),
  }
}

export async function getUnreadNotificationCount(businessId: string, userId: string) {
  return prisma.notification.count({
    where: {
      businessId,
      OR: [{ userId }, { userId: null }],
      isRead: false,
      archivedAt: null,
    },
  })
}

export async function getAnalyticsSnapshot(
  businessId: string,
  months: AnalyticsMonthRange = 6
): Promise<AnalyticsMonthPoint[]> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const grouped = await prisma.appointment.groupBy({
    by: ['date', 'status'],
    where: {
      businessId,
      deletedAt: null,
      date: { gte: start },
    },
    _count: { _all: true },
    _sum: { price: true },
  })
  const buckets = new Map<string, { revenue: number; total: number; completed: number; cancelled: number }>()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, { revenue: 0, total: 0, completed: 0, cancelled: 0 })
  }
  for (const g of grouped) {
    const key = `${g.date.getFullYear()}-${String(g.date.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.get(key)
    if (!bucket) continue
    const count = g._count._all
    bucket.total += count
    if (g.status === 'COMPLETED') {
      bucket.completed += count
      bucket.revenue += g._sum.price ? Number(g._sum.price) : 0
    }
    if (g.status === 'CANCELLED' || g.status === 'NO_SHOW') {
      bucket.cancelled += count
    }
  }
  return Array.from(buckets.entries()).map(([month, stats]) => ({ month, ...stats }))
}

export async function getAnalyticsBreakdowns(
  businessId: string,
  months: AnalyticsMonthRange = 6
): Promise<{ byStaff: AnalyticsBreakdownRow[]; byService: AnalyticsBreakdownRow[] }> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const where = {
    businessId,
    deletedAt: null,
    date: { gte: start },
    status: 'COMPLETED' as const,
  }

  const [byStaffRaw, byServiceRaw] = await Promise.all([
    prisma.appointment.groupBy({
      by: ['staffId'],
      where,
      _count: { _all: true },
      _sum: { price: true },
    }),
    prisma.appointment.groupBy({
      by: ['serviceId'],
      where,
      _count: { _all: true },
      _sum: { price: true },
    }),
  ])

  const staffSorted = [...byStaffRaw].sort((a, b) => b._count._all - a._count._all).slice(0, 8)
  const serviceSorted = [...byServiceRaw].sort((a, b) => b._count._all - a._count._all).slice(0, 8)

  const staffIds = staffSorted.map((r) => r.staffId).filter((id): id is string => Boolean(id))
  const serviceIds = serviceSorted.map((r) => r.serviceId)

  const [staffRows, serviceRows] = await Promise.all([
    staffIds.length
      ? prisma.teamMember.findMany({
          where: { businessId, id: { in: staffIds } },
          select: { id: true, fullName: true },
        })
      : Promise.resolve([]),
    serviceIds.length
      ? prisma.service.findMany({
          where: { businessId, id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ])

  const staffName = new Map(staffRows.map((s) => [s.id, s.fullName]))
  const serviceName = new Map(serviceRows.map((s) => [s.id, s.name]))

  const byStaff: AnalyticsBreakdownRow[] = staffSorted.map((r) => ({
    id: r.staffId ?? 'unassigned',
    name: r.staffId ? staffName.get(r.staffId) ?? 'Bilinmeyen personel' : 'Atanmamış',
    count: r._count._all,
    revenue: r._sum.price ? Number(r._sum.price) : 0,
  }))

  const byService: AnalyticsBreakdownRow[] = serviceSorted.map((r) => ({
    id: r.serviceId,
    name: serviceName.get(r.serviceId) ?? 'Bilinmeyen hizmet',
    count: r._count._all,
    revenue: r._sum.price ? Number(r._sum.price) : 0,
  }))

  return { byStaff, byService }
}

export type AppointmentFunnel = {
  scheduled: number
  confirmed: number
  completed: number
  cancelled: number
  noShow: number
  /** completed / (completed + cancelled + noShow) when denominator > 0 */
  completionRate: number
  noShowRate: number
}

export type StaffUtilizationRow = {
  id: string
  name: string
  completed: number
  noShow: number
  cancelled: number
  totalBooked: number
  /** completed / totalBooked */
  utilization: number
}

export async function getAppointmentFunnel(
  businessId: string,
  months: AnalyticsMonthRange = 6,
): Promise<AppointmentFunnel> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const grouped = await prisma.appointment.groupBy({
    by: ['status'],
    where: { businessId, deletedAt: null, date: { gte: start } },
    _count: { _all: true },
  })
  const counts = {
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  }
  for (const row of grouped) {
    const n = row._count._all
    if (row.status === 'SCHEDULED') counts.scheduled = n
    else if (row.status === 'CONFIRMED') counts.confirmed = n
    else if (row.status === 'COMPLETED') counts.completed = n
    else if (row.status === 'CANCELLED') counts.cancelled = n
    else if (row.status === 'NO_SHOW') counts.noShow = n
  }
  const settled = counts.completed + counts.cancelled + counts.noShow
  return {
    ...counts,
    completionRate: settled > 0 ? counts.completed / settled : 0,
    noShowRate: settled > 0 ? counts.noShow / settled : 0,
  }
}

export async function getStaffUtilization(
  businessId: string,
  months: AnalyticsMonthRange = 6,
): Promise<StaffUtilizationRow[]> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const grouped = await prisma.appointment.groupBy({
    by: ['staffId', 'status'],
    where: {
      businessId,
      deletedAt: null,
      date: { gte: start },
      staffId: { not: null },
      status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'CONFIRMED', 'SCHEDULED'] },
    },
    _count: { _all: true },
  })

  const byStaff = new Map<
    string,
    { completed: number; noShow: number; cancelled: number; totalBooked: number }
  >()
  for (const row of grouped) {
    if (!row.staffId) continue
    const bucket = byStaff.get(row.staffId) ?? {
      completed: 0,
      noShow: 0,
      cancelled: 0,
      totalBooked: 0,
    }
    const n = row._count._all
    bucket.totalBooked += n
    if (row.status === 'COMPLETED') bucket.completed += n
    if (row.status === 'NO_SHOW') bucket.noShow += n
    if (row.status === 'CANCELLED') bucket.cancelled += n
    byStaff.set(row.staffId, bucket)
  }

  const ids = [...byStaff.keys()]
  const staffRows = ids.length
    ? await prisma.teamMember.findMany({
        where: { businessId, id: { in: ids } },
        select: { id: true, fullName: true },
      })
    : []
  const names = new Map(staffRows.map((s) => [s.id, s.fullName]))

  return [...byStaff.entries()]
    .map(([id, stats]) => ({
      id,
      name: names.get(id) ?? 'Personel',
      ...stats,
      utilization: stats.totalBooked > 0 ? stats.completed / stats.totalBooked : 0,
    }))
    .sort((a, b) => b.totalBooked - a.totalBooked)
    .slice(0, 10)
}

export type FinanceLedgerRow = {
  date: string
  startTime: string
  patientName: string
  serviceName: string
  staffName: string | null
  status: string
  price: number
}

/** Completed appointments for finance CSV/PDF export. */
export async function getFinanceLedgerForExport(
  businessId: string,
  months: AnalyticsMonthRange = 6,
): Promise<FinanceLedgerRow[]> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const rows = await prisma.appointment.findMany({
    where: {
      businessId,
      deletedAt: null,
      date: { gte: start },
      status: 'COMPLETED',
    },
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    take: 2000,
    select: {
      date: true,
      startTime: true,
      price: true,
      status: true,
      patient: { select: { fullName: true } },
      service: { select: { name: true } },
      staff: { select: { fullName: true } },
    },
  })

  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    startTime: r.startTime,
    patientName: r.patient.fullName,
    serviceName: r.service.name,
    staffName: r.staff?.fullName ?? null,
    status: r.status,
    price: r.price ? Number(r.price) : 0,
  }))
}

// ── Messaging ──────────────────────────────────────────────────────────────

export type ConversationSummary = {
  id: string
  isGroup: boolean
  title: string | null
  lastMessageAt: string | null
  partner: { id: string; fullName: string; avatarUrl: string | null } | null
  lastMessage: { body: string; senderUserId: string; createdAt: string } | null
  unreadCount: number
}

async function countUnreadByConversation(
  userId: string,
  participants: { conversationId: string; lastReadAt: Date | null }[]
): Promise<Map<string, number>> {
  if (participants.length === 0) return new Map()
  const grouped = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      OR: participants.map((p) => ({
        conversationId: p.conversationId,
        senderUserId: { not: userId },
        deletedAt: null,
        ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
      })),
    },
    _count: { _all: true },
  })
  return new Map(grouped.map((g) => [g.conversationId, g._count._all]))
}

export async function getMyConversations(
  businessId: string,
  userId: string
): Promise<ConversationSummary[]> {
  const rows = await prisma.conversation.findMany({
    where: {
      businessId,
      participants: { some: { userId, isActive: true } },
    },
    orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    include: {
      participants: {
        where: { isActive: true },
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, senderUserId: true, createdAt: true, attachments: { select: { id: true } } },
      },
    },
  })

  const enriched = rows.map((c) => {
    const me = c.participants.find((p) => p.userId === userId) ?? null
    const partner = c.participants.find((p) => p.userId !== userId)?.user ?? null
    const last = c.messages[0] ?? null
    return { c, me, partner, last }
  })

  const unreadByConv = await countUnreadByConversation(
    userId,
    enriched.flatMap((e) => (e.me ? [{ conversationId: e.c.id, lastReadAt: e.me.lastReadAt }] : []))
  )

  return enriched.map(({ c, me, partner, last }) => ({
    id: c.id,
    isGroup: c.isGroup,
    title: c.title,
    lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : null,
    partner,
    lastMessage: last
      ? {
          body: last.body || (last.attachments.length ? 'Dosya gönderildi' : ''),
          senderUserId: last.senderUserId,
          createdAt: last.createdAt.toISOString(),
        }
      : null,
    unreadCount: me ? unreadByConv.get(c.id) ?? 0 : 0,
  }))
}

export async function getConversationThread(
  conversationId: string,
  userId: string,
  limit = 100
) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId, isActive: true },
    select: { id: true },
  })
  if (!participant) return null

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        where: { isActive: true },
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      },
    },
  })
  if (!conversation) return null

  const messages = await prisma.message.findMany({
    where: { conversationId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true } },
      attachments: { orderBy: { createdAt: 'asc' } },
      reactions: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, fullName: true } } },
      },
    },
  })

  const prefix = `${conversation.businessId}/${conversation.id}/`
  const validKeys = messages
    .flatMap((m) => m.attachments)
    .filter((a) => a.storageKey.startsWith(prefix))
    .map((a) => a.storageKey)
  const urlMap = await batchSignStorageKeys(
    MESSAGE_MEDIA_BUCKET,
    validKeys,
    MESSAGE_MEDIA_SIGNED_URL_TTL_SECONDS
  )

  const signedMessages = messages.map((message) => ({
    ...message,
    attachments: message.attachments.map((attachment) => ({
      ...attachment,
      fileUrl: urlMap.get(attachment.storageKey) ?? '',
    })),
  }))

  return { conversation, messages: signedMessages }
}

export async function getUnreadMessageCount(businessId: string, userId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      isActive: true,
      conversation: { businessId },
    },
    select: { conversationId: true, lastReadAt: true },
  })
  const counts = await countUnreadByConversation(userId, participants)
  let total = 0
  for (const n of counts.values()) total += n
  return total
}

export async function getReminders(businessId: string, userId: string) {
  // Defensive: if the Prisma client hasn't been regenerated, or the underlying table
  // hasn't been pushed yet (`npx prisma db push`), don't crash the dashboard.
  const delegate = (prisma as unknown as { reminder?: { findMany: Function } }).reminder
  if (!delegate || typeof delegate.findMany !== 'function') {
    console.warn('[getReminders] prisma.reminder is undefined — run `npx prisma generate` to refresh the client.')
    return []
  }
  try {
    return await prisma.reminder.findMany({
      where: { businessId, userId },
      orderBy: [
        { isDone: 'asc' },
        { dueAt: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: 30,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('does not exist') || message.includes('P2021')) {
      console.warn('[getReminders] Reminder table missing — run `npx prisma db push`.')
      return []
    }
    throw error
  }
}
