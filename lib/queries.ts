import 'server-only'

import type { PatientFile, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { PATIENT_FILES_BUCKET, PATIENT_FILE_SIGNED_URL_TTL_SECONDS } from '@/lib/storage-constants'

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
    upcomingAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { businessId, date: today } }),
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
    prisma.appointment.findMany({
      where: { businessId, date: { gte: today }, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 6,
      include: {
        patient: { select: { fullName: true } },
        service: { select: { name: true, color: true } },
        staff: { select: { fullName: true, color: true } },
      },
    }),
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
    upcomingAppointments,
  }
}

export async function getPatientsList(
  businessId: string,
  options: { query?: string; tag?: string; archived?: boolean; take?: number } = {}
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

  return prisma.patient.findMany({
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
      createdAt: true,
      updatedAt: true,
      _count: { select: { appointments: true, files: true, notes: true } },
    },
  })
}

export async function getPatientDetail(businessId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, businessId },
    include: {
      assignedDoctor: { select: { id: true, fullName: true, color: true } },
      notes: { orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] },
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
        },
      },
      timeline: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })

  if (!patient) return null

  return {
    ...patient,
    files: await signPatientFiles(patient.files),
  }
}

async function signPatientFiles(files: PatientFile[]) {
  if (files.length === 0) return files

  const supabase = await createClient()
  const signed = await Promise.all(
    files.map(async (file) => {
      if (!file.storageKey.startsWith(`${file.businessId}/${file.patientId}/`)) {
        return { ...file, fileUrl: '' }
      }

      const { data, error } = await supabase.storage
        .from(PATIENT_FILES_BUCKET)
        .createSignedUrl(file.storageKey, PATIENT_FILE_SIGNED_URL_TTL_SECONDS)

      return {
        ...file,
        fileUrl: error ? '' : data.signedUrl,
      }
    })
  )

  return signed
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
  range: { from: Date; to: Date; staffId?: string; serviceId?: string }
) {
  const where: Prisma.AppointmentWhereInput = {
    businessId,
    date: { gte: range.from, lte: range.to },
  }
  if (range.staffId) where.staffId = range.staffId
  if (range.serviceId) where.serviceId = range.serviceId
  return prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    include: {
      patient: { select: { id: true, fullName: true, phone: true } },
      service: { select: { id: true, name: true, color: true, durationMin: true } },
      staff: { select: { id: true, fullName: true, color: true } },
    },
  })
}

export async function getAppointmentsList(
  businessId: string,
  options: { status?: string; from?: Date; to?: Date } = {}
) {
  const where: Prisma.AppointmentWhereInput = { businessId }
  if (options.status) where.status = options.status as Prisma.AppointmentWhereInput['status']
  if (options.from || options.to) {
    where.date = {}
    if (options.from) where.date.gte = options.from
    if (options.to) where.date.lte = options.to
  }
  return prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    take: 200,
    include: {
      patient: { select: { id: true, fullName: true, phone: true } },
      service: { select: { id: true, name: true, color: true, durationMin: true } },
      staff: { select: { id: true, fullName: true, color: true } },
    },
  })
}

export async function getNotificationsList(businessId: string, userId: string) {
  return prisma.notification.findMany({
    where: {
      businessId,
      OR: [{ userId }, { userId: null }],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function getUnreadNotificationCount(businessId: string, userId: string) {
  return prisma.notification.count({
    where: {
      businessId,
      OR: [{ userId }, { userId: null }],
      isRead: false,
    },
  })
}

export async function getAnalyticsSnapshot(businessId: string) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const appointments = await prisma.appointment.findMany({
    where: { businessId, date: { gte: start } },
    select: { date: true, status: true, price: true },
  })
  const buckets = new Map<string, { revenue: number; total: number; completed: number; cancelled: number }>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, { revenue: 0, total: 0, completed: 0, cancelled: 0 })
  }
  for (const a of appointments) {
    const key = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.total += 1
    if (a.status === 'COMPLETED') {
      bucket.completed += 1
      bucket.revenue += a.price ? Number(a.price) : 0
    }
    if (a.status === 'CANCELLED' || a.status === 'NO_SHOW') bucket.cancelled += 1
  }
  return Array.from(buckets.entries()).map(([month, stats]) => ({ month, ...stats }))
}
