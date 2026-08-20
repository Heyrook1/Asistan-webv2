import 'server-only'

import { prisma } from '@/lib/prisma'
import { computeAvailableSlots } from '@/lib/client-marketplace/availability-compute'
import { getCurrentDateAndTimeForTimezone, getWeekdayFromDateString } from '@/lib/client-marketplace/time'
import { toIsoDate } from '@/lib/format'
import {
  buildFillGapCopy,
  type FillGapReturningPatient,
  type FillGapSlotCluster,
} from '@/lib/ops/fill-the-gap-copy'
import {
  notifyPatientChannels,
  summarizeNotifyResults,
  type PatientChannelSummary,
} from '@/lib/notifications/patient-channels'
import { isFillTheGapEnabled } from '@/lib/ops/policy'
import { trackFunnelEvent } from '@/lib/observability/funnel'

export type { FillGapSlotCluster, FillGapReturningPatient } from '@/lib/ops/fill-the-gap-copy'
export { buildFillGapCopy, clustersForDate } from '@/lib/ops/fill-the-gap-copy'

export type FillTheGapSnapshot = {
  clusters: FillGapSlotCluster[]
  patients: FillGapReturningPatient[]
  /** Turkish ops copy — never invent fill % */
  headline: string | null
  detail: string | null
  ajandaHref: string
}

export type FillGapOfferResult = {
  attempted: number
  notified: number
  channelDelivery: PatientChannelSummary
}

const DEFAULT_HORIZON_DAYS = 5
const MAX_DOCTORS = 4
const MAX_CLUSTERS = 6
const MAX_RETURNING = 12
const LOOKBACK_DAYS = 180
const MAX_OFFER_CANDIDATES = 3

const WEEKDAY_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

function addDaysIso(from: Date, days: number): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
  return toIsoDate(d)
}

function weekdayLabelFromIso(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return WEEKDAY_TR[d.getDay()] ?? iso
}

function dateKey(value: Date): string {
  return toIsoDate(value)
}

export async function getReturningPatientsWithoutUpcoming(
  businessId: string,
  options?: { take?: number; preferStaffId?: string | null }
): Promise<FillGapReturningPatient[]> {
  const take = options?.take ?? MAX_RETURNING
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lookback = new Date(today)
  lookback.setDate(lookback.getDate() - LOOKBACK_DAYS)

  const rows = await prisma.patient.findMany({
    where: {
      businessId,
      isArchived: false,
      appointments: {
        some: {
          status: 'COMPLETED',
          date: { gte: lookback, lt: today },
        },
        none: {
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          date: { gte: today },
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      appointments: {
        where: { status: 'COMPLETED' },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        take: 1,
        select: {
          date: true,
          staffId: true,
          service: { select: { name: true } },
        },
      },
    },
    take: take * 3,
  })

  const mapped: FillGapReturningPatient[] = rows.map((row) => {
    const last = row.appointments[0]
    return {
      id: row.id,
      fullName: row.fullName,
      phone: row.phone,
      lastVisitDate: last ? toIsoDate(last.date) : '',
      lastServiceName: last?.service?.name ?? null,
      lastStaffId: last?.staffId ?? null,
    }
  })

  const prefer = options?.preferStaffId
  if (prefer) {
    mapped.sort((a, b) => {
      const aMatch = a.lastStaffId === prefer ? 0 : 1
      const bMatch = b.lastStaffId === prefer ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      return b.lastVisitDate.localeCompare(a.lastVisitDate)
    })
  } else {
    mapped.sort((a, b) => b.lastVisitDate.localeCompare(a.lastVisitDate))
  }

  return mapped.slice(0, take)
}

/**
 * Batched open-slot scan — O(1) query rounds instead of doctor×day getAvailableSlots N+1.
 */
export async function getOpenSlotClusters(
  businessId: string,
  options?: { horizonDays?: number; maxDoctors?: number }
): Promise<FillGapSlotCluster[]> {
  const horizonDays = options?.horizonDays ?? DEFAULT_HORIZON_DAYS
  const maxDoctors = options?.maxDoctors ?? MAX_DOCTORS
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizonEnd = new Date(today)
  horizonEnd.setDate(horizonEnd.getDate() + horizonDays)

  const dates: string[] = []
  for (let day = 0; day < horizonDays; day += 1) {
    dates.push(addDaysIso(today, day))
  }
  const weekdays = [...new Set(dates.map((d) => getWeekdayFromDateString(d)))]

  const [business, doctors, services, serviceStaffRows] = await Promise.all([
    prisma.business.findFirst({
      where: { id: businessId, isActive: true },
      select: { id: true, timezone: true },
    }),
    prisma.teamMember.findMany({
      where: {
        businessId,
        isActive: true,
        role: 'DOKTOR',
        isBookable: true,
      },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
      take: maxDoctors,
    }),
    prisma.service.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMin: true },
      take: 8,
    }),
    prisma.serviceStaff.findMany({
      where: {
        businessId,
        isActive: true,
        service: { isActive: true },
      },
      select: {
        staffId: true,
        serviceId: true,
        createdAt: true,
        service: { select: { id: true, name: true, durationMin: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    }),
  ])

  if (!business || doctors.length === 0 || services.length === 0) return []

  const doctorIds = doctors.map((d) => d.id)
  const serviceByDoctor = new Map<string, { id: string; name: string; durationMin: number }>()
  for (const row of serviceStaffRows) {
    if (!doctorIds.includes(row.staffId)) continue
    if (serviceByDoctor.has(row.staffId)) continue
    serviceByDoctor.set(row.staffId, row.service)
  }
  const fallbackService = services[0]

  const [rules, appointments, blocks] = await Promise.all([
    prisma.teamMemberAvailability.findMany({
      where: {
        businessId,
        staffId: { in: doctorIds },
        weekday: { in: weekdays },
        isActive: true,
      },
      select: {
        staffId: true,
        weekday: true,
        startTime: true,
        endTime: true,
        slotIntervalMin: true,
        locationId: true,
      },
      take: 2_000,
    }),
    prisma.appointment.findMany({
      where: {
        businessId,
        staffId: { in: doctorIds },
        date: { gte: today, lt: horizonEnd },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: { staffId: true, date: true, startTime: true, endTime: true },
      take: 5_000,
    }),
    prisma.teamMemberUnavailableBlock.findMany({
      where: {
        businessId,
        staffId: { in: doctorIds },
        date: { gte: today, lt: horizonEnd },
      },
      select: { staffId: true, date: true, startTime: true, endTime: true },
      take: 2_000,
    }),
  ])

  const rulesByStaffWeekday = new Map<string, typeof rules>()
  for (const rule of rules) {
    const key = `${rule.staffId}:${rule.weekday}`
    const list = rulesByStaffWeekday.get(key) ?? []
    list.push(rule)
    rulesByStaffWeekday.set(key, list)
  }

  type BusyPair = { startTime: string; endTime: string }

  const apptByStaffDate = new Map<string, BusyPair[]>()
  for (const row of appointments) {
    if (!row.staffId) continue
    const key = `${row.staffId}:${dateKey(row.date)}`
    const list = apptByStaffDate.get(key) ?? []
    list.push({ startTime: row.startTime, endTime: row.endTime })
    apptByStaffDate.set(key, list)
  }

  const blockByStaffDate = new Map<string, BusyPair[]>()
  for (const row of blocks) {
    const key = `${row.staffId}:${dateKey(row.date)}`
    const list = blockByStaffDate.get(key) ?? []
    list.push({ startTime: row.startTime, endTime: row.endTime })
    blockByStaffDate.set(key, list)
  }

  const now = getCurrentDateAndTimeForTimezone(business.timezone || 'Europe/Istanbul')
  const clusters: FillGapSlotCluster[] = []

  for (const doctor of doctors) {
    const service = serviceByDoctor.get(doctor.id) ?? fallbackService
    if (!service) continue

    for (const date of dates) {
      const weekday = getWeekdayFromDateString(date)
      const dayRules = rulesByStaffWeekday.get(`${doctor.id}:${weekday}`) ?? []
      if (dayRules.length === 0) continue

      const slots = computeAvailableSlots({
        durationMin: service.durationMin,
        rules: dayRules,
        appointments: apptByStaffDate.get(`${doctor.id}:${date}`) ?? [],
        blocks: blockByStaffDate.get(`${doctor.id}:${date}`) ?? [],
        date,
        nowDate: now.date,
        nowTime: now.time,
      })
      if (slots.length === 0) continue

      clusters.push({
        date,
        weekdayLabel: weekdayLabelFromIso(date),
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        serviceId: service.id,
        serviceName: service.name,
        slotCount: slots.length,
        sampleTimes: slots.slice(0, 3).map((s) => s.startTime),
      })
    }
  }

  return clusters
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      return b.slotCount - a.slotCount
    })
    .slice(0, MAX_CLUSTERS)
}

export async function getFillTheGapSnapshot(
  businessId: string,
  options?: { horizonDays?: number }
): Promise<FillTheGapSnapshot> {
  const clusters = await getOpenSlotClusters(businessId, {
    horizonDays: options?.horizonDays ?? DEFAULT_HORIZON_DAYS,
  })

  const preferStaffId = clusters[0]?.doctorId ?? null
  const patients =
    clusters.length > 0
      ? await getReturningPatientsWithoutUpcoming(businessId, {
          take: MAX_RETURNING,
          preferStaffId,
        })
      : []

  const copy = buildFillGapCopy({
    clusters,
    patientCount: patients.length,
  })

  return {
    clusters,
    patients,
    headline: copy.headline,
    detail: copy.detail,
    ajandaHref: copy.ajandaHref,
  }
}

/**
 * Prod waitlist auto-fill proxy: after cancel/no-show, soft-notify up to 3 returning
 * patients (prefer same doctor) that a slot opened. Never throws; never rolls back cancel.
 */
export async function offerOpenedSlotToWaitlistCandidates(input: {
  businessId: string
  appointmentId: string
  staffId: string | null
  serviceName: string
  startsAt: string
  clinicName?: string | null
  dateIso: string
  startTime: string
}): Promise<FillGapOfferResult | null> {
  if (!isFillTheGapEnabled()) return null

  const candidates = await getReturningPatientsWithoutUpcoming(input.businessId, {
    take: MAX_OFFER_CANDIDATES,
    preferStaffId: input.staffId,
  })
  const withPhone = candidates.filter((p) => Boolean(p.phone?.trim()))
  if (withPhone.length === 0) {
    return {
      attempted: 0,
      notified: 0,
      channelDelivery: summarizeNotifyResults([]),
    }
  }

  const allResults = []
  for (const patient of withPhone) {
    try {
      const results = await notifyPatientChannels({
        businessId: input.businessId,
        appointmentId: input.appointmentId,
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        serviceName: input.serviceName,
        startsAt: input.startsAt,
        clinicName: input.clinicName ?? undefined,
        kind: 'slot_offer',
      })
      allResults.push(...results)
    } catch {
      // Soft-fail per candidate
    }
  }

  const channelDelivery = summarizeNotifyResults(allResults)
  const notified = withPhone.length

  trackFunnelEvent({
    step: 'reminder_attempted',
    businessId: input.businessId,
    appointmentId: input.appointmentId,
    ok: channelDelivery.sent > 0,
    metadata: {
      kind: 'slot_offer',
      candidates: withPhone.length,
      date: input.dateIso,
      startTime: input.startTime,
    },
  })

  return {
    attempted: withPhone.length,
    notified,
    channelDelivery,
  }
}
