import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import type { PublicClinicBookingPayload } from '@/lib/public-booking/types'

export type { PublicClinicBookingPayload }

function toNumber(value: unknown) {
  if (value == null) return null
  const parsed = Number(typeof value === 'object' ? String(value) : value)
  return Number.isNaN(parsed) ? null : parsed
}

function summarizeOpeningHours(
  rules: Array<{ weekday: number; startTime: string; endTime: string }>,
): PublicClinicBookingPayload['openingHours'] {
  const byDay = new Map<number, Array<{ startTime: string; endTime: string }>>()
  for (const rule of rules) {
    if (rule.weekday < 0 || rule.weekday > 6) continue
    const list = byDay.get(rule.weekday) ?? []
    const key = `${rule.startTime}-${rule.endTime}`
    if (!list.some((w) => `${w.startTime}-${w.endTime}` === key)) {
      list.push({ startTime: rule.startTime, endTime: rule.endTime })
    }
    byDay.set(rule.weekday, list)
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekday, windows]) => ({
      weekday,
      windows: windows.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
}

/**
 * Public book payload — must use owner/catalog client.
 * `asistan_app` without `app.business_id` returns the Business row but empty
 * services/doctors (RLS), so the widget never reaches slot selection.
 */
export async function getPublicClinicBySlug(slug: string): Promise<PublicClinicBookingPayload | null> {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return null

  const prisma = catalogPrisma()
  const business = await prisma.business.findFirst({
    where: { slug: normalized, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      email: true,
      city: true,
      address: true,
      logoUrl: true,
      primaryColor: true,
      currency: true,
      locationLat: true,
      locationLng: true,
      autoConfirmClientAppointments: true,
      requireGuestIdentity: true,
      depositEnabled: true,
      depositAmount: true,
      noShowFeeEnabled: true,
      noShowFeeAmount: true,
      noShowFeeNote: true,
      vendorAccount: { select: { isDemo: true } },
      locations: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, city: true },
      },
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          durationMin: true,
          price: true,
        },
      },
      members: {
        where: { role: 'DOKTOR', isActive: true, isBookable: true },
        orderBy: { fullName: 'asc' },
        select: {
          id: true,
          fullName: true,
          specialty: true,
          availabilityRules: {
            where: { isActive: true, deletedAt: null },
            select: { weekday: true, startTime: true, endTime: true },
          },
          serviceAssignments: {
            where: { isActive: true },
            select: { serviceId: true },
          },
        },
      },
    },
  })

  if (!business) return null

  const specialtySummary = Array.from(
    new Set(
      business.members
        .map((m) => m.specialty?.trim())
        .filter((s): s is string => Boolean(s && s.length > 0)),
    ),
  ).slice(0, 6)

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    phone: business.phone,
    email: business.email,
    city: business.city,
    address: business.address,
    logoUrl: business.logoUrl,
    primaryColor: business.primaryColor || '#0071E3',
    currency: business.currency || 'TRY',
    locationLat: toNumber(business.locationLat),
    locationLng: toNumber(business.locationLng),
    isDemo: Boolean(business.vendorAccount?.isDemo),
    specialtySummary,
    openingHours: summarizeOpeningHours(
      business.members.flatMap((m) => m.availabilityRules),
    ),
    autoConfirmClientAppointments: business.autoConfirmClientAppointments,
    requireGuestIdentity: Boolean(business.requireGuestIdentity),
    deposit: {
      enabled: Boolean(business.depositEnabled),
      amount: toNumber(business.depositAmount),
    },
    noShowFee: {
      enabled: Boolean(business.noShowFeeEnabled),
      amount: toNumber(business.noShowFeeAmount),
      note: business.noShowFeeNote,
    },
    locations: business.locations,
    services: business.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMin: s.durationMin,
      price: toNumber(s.price),
    })),
    doctors: business.members.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      specialty: m.specialty,
      serviceIds: m.serviceAssignments.map((a) => a.serviceId),
    })),
  }
}
