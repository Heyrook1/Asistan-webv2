import 'server-only'

import { prisma } from '@/lib/prisma'
import type { PublicClinicBookingPayload } from '@/lib/public-booking/types'

export type { PublicClinicBookingPayload }

function toNumber(value: unknown) {
  if (value == null) return null
  const parsed = Number(typeof value === 'object' ? String(value) : value)
  return Number.isNaN(parsed) ? null : parsed
}

export async function getPublicClinicBySlug(slug: string): Promise<PublicClinicBookingPayload | null> {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return null

  const business = await prisma.business.findFirst({
    where: { slug: normalized, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      city: true,
      address: true,
      logoUrl: true,
      primaryColor: true,
      currency: true,
      autoConfirmClientAppointments: true,
      depositEnabled: true,
      depositAmount: true,
      noShowFeeEnabled: true,
      noShowFeeAmount: true,
      noShowFeeNote: true,
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
          serviceAssignments: {
            where: { isActive: true },
            select: { serviceId: true },
          },
        },
      },
    },
  })

  if (!business) return null

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    phone: business.phone,
    city: business.city,
    address: business.address,
    logoUrl: business.logoUrl,
    primaryColor: business.primaryColor || '#0071E3',
    currency: business.currency || 'TRY',
    autoConfirmClientAppointments: business.autoConfirmClientAppointments,
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
