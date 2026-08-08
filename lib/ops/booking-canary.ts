import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import {
  getAvailableSlotsDetailed,
  type AvailabilityEmptyReason,
} from '@/lib/client-marketplace/availability'
import { calendarDateInTimeZone, addCalendarDays } from '@/lib/datetime/calendar-label'
import { rotateClinicSample } from '@/lib/ops/booking-canary-core'

export { rotateClinicSample } from '@/lib/ops/booking-canary-core'

export type BookingCanaryClinicStatus = 'ok' | 'config' | 'infra' | 'empty_catalog'

export type BookingCanaryClinicResult = {
  businessId: string
  slug: string | null
  name: string
  status: BookingCanaryClinicStatus
  emptyReason: AvailabilityEmptyReason | 'EMPTY_CATALOG' | null
  slotDays: number
  doctorId: string | null
  serviceId: string | null
  detail?: string
}

export type BookingCanaryReport = {
  ok: boolean
  checkedAt: string
  sampleSize: number
  clinics: BookingCanaryClinicResult[]
  infraFailures: number
  configOnly: number
}

const CONFIG_REASONS = new Set<AvailabilityEmptyReason>([
  'OK',
  'NO_RULES',
  'CLOSED',
  'FULL',
  'NOT_BOOKABLE',
])

const DEFAULT_SAMPLE = 5
const DEFAULT_HORIZON_DAYS = 7

function addDaysIso(iso: string, days: number): string {
  return addCalendarDays(iso, days)
}

/**
 * Pick active clinics that have bookable doctors + services.
 */
export async function listBookableCanaryClinics(limit = 50): Promise<
  Array<{
    id: string
    slug: string | null
    name: string
    doctorId: string
    serviceId: string
  }>
> {
  const db = catalogPrisma()
  const businesses = await db.business.findMany({
    where: {
      isActive: true,
      members: {
        some: {
          role: 'DOKTOR',
          isActive: true,
          isBookable: true,
        },
      },
      services: {
        some: { isActive: true },
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      members: {
        where: { role: 'DOKTOR', isActive: true, isBookable: true },
        select: { id: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
      services: {
        where: { isActive: true },
        select: { id: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: Math.max(limit, 1),
  })

  return businesses
    .map((b) => {
      const doctorId = b.members[0]?.id
      const serviceId = b.services[0]?.id
      if (!doctorId || !serviceId || !b.slug?.trim()) return null
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        doctorId,
        serviceId,
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
}

async function probeClinic(input: {
  businessId: string
  slug: string | null
  name: string
  doctorId: string
  serviceId: string
  horizonDays: number
}): Promise<BookingCanaryClinicResult> {
  const base: Omit<BookingCanaryClinicResult, 'status' | 'emptyReason' | 'slotDays' | 'detail'> = {
    businessId: input.businessId,
    slug: input.slug,
    name: input.name,
    doctorId: input.doctorId,
    serviceId: input.serviceId,
  }

  try {
    const today = calendarDateInTimeZone()
    let slotDays = 0
    let lastReason: AvailabilityEmptyReason = 'NO_RULES'

    for (let offset = 0; offset < input.horizonDays; offset += 1) {
      const date = addDaysIso(today, offset)
      const result = await getAvailableSlotsDetailed({
        businessId: input.businessId,
        doctorId: input.doctorId,
        serviceId: input.serviceId,
        date,
      })
      lastReason = result.emptyReason
      if (result.emptyReason === 'INFRA') {
        return {
          ...base,
          status: 'infra',
          emptyReason: 'INFRA',
          slotDays,
          detail: `availability INFRA on ${date}`,
        }
      }
      if (result.slots.length > 0) {
        slotDays += 1
      }
    }

    if (slotDays > 0) {
      return {
        ...base,
        status: 'ok',
        emptyReason: 'OK',
        slotDays,
      }
    }

    if (CONFIG_REASONS.has(lastReason) && lastReason !== 'OK') {
      return {
        ...base,
        status: 'config',
        emptyReason: lastReason,
        slotDays: 0,
        detail: `no open slots in ${input.horizonDays}d (${lastReason})`,
      }
    }

    return {
      ...base,
      status: 'config',
      emptyReason: lastReason,
      slotDays: 0,
    }
  } catch (error) {
    return {
      ...base,
      status: 'infra',
      emptyReason: 'INFRA',
      slotDays: 0,
      detail: error instanceof Error ? error.message.slice(0, 160) : 'probe failed',
    }
  }
}

/**
 * Live booking canary — clinic-agnostic rotation over bookable businesses.
 * INFRA → page (ok:false). CONFIG (no rules / closed / full) → warn only.
 */
export async function runBookingCanary(options?: {
  sampleSize?: number
  horizonDays?: number
  nowMs?: number
}): Promise<BookingCanaryReport> {
  const sampleSize = options?.sampleSize ?? DEFAULT_SAMPLE
  const horizonDays = options?.horizonDays ?? DEFAULT_HORIZON_DAYS
  const checkedAt = new Date().toISOString()

  const all = await listBookableCanaryClinics(80)
  if (all.length === 0) {
    return {
      ok: false,
      checkedAt,
      sampleSize: 0,
      clinics: [
        {
          businessId: '',
          slug: null,
          name: '(none)',
          status: 'empty_catalog',
          emptyReason: 'EMPTY_CATALOG',
          slotDays: 0,
          doctorId: null,
          serviceId: null,
          detail: 'No active bookable clinics with doctor+service',
        },
      ],
      infraFailures: 1,
      configOnly: 0,
    }
  }

  const sample = rotateClinicSample(all, sampleSize, options?.nowMs)
  const clinics: BookingCanaryClinicResult[] = []

  for (const clinic of sample) {
    clinics.push(
      await probeClinic({
        businessId: clinic.id,
        slug: clinic.slug,
        name: clinic.name,
        doctorId: clinic.doctorId,
        serviceId: clinic.serviceId,
        horizonDays,
      }),
    )
  }

  const infraFailures = clinics.filter(
    (c) => c.status === 'infra' || c.status === 'empty_catalog',
  ).length
  const configOnly = clinics.filter((c) => c.status === 'config').length

  return {
    ok: infraFailures === 0,
    checkedAt,
    sampleSize: clinics.length,
    clinics,
    infraFailures,
    configOnly,
  }
}
