'use server'

import { prisma } from '@/lib/prisma'
import { can, requireSession } from '@/lib/session'

export type GlobalPatientSearchHit = {
  id: string
  fullName: string
  patientNumber: string
  phone: string
  email: string | null
}

export type GlobalAppointmentSearchHit = {
  id: string
  patientId: string
  patientName: string
  serviceName: string
  staffName: string | null
  date: string
  startTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

export type GlobalSearchPayload = {
  patients: GlobalPatientSearchHit[]
  appointments: GlobalAppointmentSearchHit[]
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export async function searchGlobalPalette(rawQuery: string): Promise<GlobalSearchPayload> {
  const session = await requireSession()
  const query = rawQuery.trim()

  if (query.length < 2) {
    return { patients: [], appointments: [] }
  }

  const canSearchPatients =
    can(session, 'patient.view') || can(session, 'patient.edit') || can(session, 'patient.create')

  const canSearchAppointments =
    can(session, 'appointment.manage') ||
    can(session, 'appointment.view') ||
    can(session, 'appointment.own.view')

  const appointmentsOwnOnly =
    can(session, 'appointment.own.view') &&
    !can(session, 'appointment.view') &&
    !can(session, 'appointment.manage')

  const [patients, appointments] = await Promise.all([
    canSearchPatients
      ? prisma.patient.findMany({
          where: {
            businessId: session.businessId,
            isArchived: false,
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { patientNumber: { contains: query, mode: 'insensitive' } },
              { identityNumber: { contains: query, mode: 'insensitive' } },
              { tags: { has: query } },
            ],
          },
          orderBy: { updatedAt: 'desc' },
          take: 8,
          select: {
            id: true,
            fullName: true,
            patientNumber: true,
            phone: true,
            email: true,
          },
        })
      : Promise.resolve([]),
    canSearchAppointments
      ? prisma.appointment.findMany({
          where: {
            businessId: session.businessId,
            ...(appointmentsOwnOnly
              ? { staffId: session.staffMemberId ?? '__no_staff_scope__' }
              : {}),
            OR: [
              { patient: { is: { fullName: { contains: query, mode: 'insensitive' } } } },
              { service: { is: { name: { contains: query, mode: 'insensitive' } } } },
              { staff: { is: { fullName: { contains: query, mode: 'insensitive' } } } },
              { notes: { contains: query, mode: 'insensitive' } },
              { startTime: { contains: query } },
            ],
          },
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
          take: 8,
          select: {
            id: true,
            patientId: true,
            date: true,
            startTime: true,
            status: true,
            patient: { select: { fullName: true } },
            service: { select: { name: true } },
            staff: { select: { fullName: true } },
          },
        })
      : Promise.resolve([]),
  ])

  return {
    patients,
    appointments: appointments.map((item) => ({
      id: item.id,
      patientId: item.patientId,
      patientName: item.patient.fullName,
      serviceName: item.service.name,
      staffName: item.staff?.fullName ?? null,
      date: toIsoDate(item.date),
      startTime: item.startTime,
      status: item.status,
    })),
  }
}

