import 'server-only'

/**
 * Hasta “pasaport” agregasyonu (Asistan Rezervasyon).
 *
 * ClientUser → Person link + klinik üyelikleri + ziyaret zaman çizelgesi.
 * `gpiDisplay` opak kimliktir; FHIR / tıbbi pasaport değildir.
 * Orphan veya RLS-gizli `service` satırlarında isim “Hizmet” fallback’i kullanılır.
 */

import { prisma } from '@/lib/prisma'
import { ensureClientUserPersonLink } from '@/lib/passport/ensure-link'
import { withPersonDb } from '@/lib/passport/person-db'
import { buildPatientVisitTimeline } from '@/lib/health-timeline'
import type { HealthTimelineItem } from '@/lib/health-timeline/types'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export type ClientPassportClinic = {
  businessId: string
  name: string
  slug: string | null
  city: string | null
  patientNumber: string | null
}

export type ClientPassportVisit = {
  id: string
  status: string
  date: string
  startTime: string
  clinic: { id: string; name: string; slug?: string | null }
  doctor: { id: string; fullName: string; specialty: string | null } | null
  service: { id: string; name: string }
  location: { id: string; name: string; address: string | null } | null
}

export type ClientPassport = {
  /** Opaque GPI — not a medical record ID */
  gpiDisplay: string | null
  personLinked: boolean
  fullName: string
  clinics: ClientPassportClinic[]
  visits: ClientPassportVisit[]
  timeline: HealthTimelineItem[]
  /** Honest product copy keys */
  honesty: {
    titleTr: string
    disclaimerTr: string
  }
}

export async function getClientPassport(input: {
  clientUserId: string
  fullName: string
  phone?: string | null
  email?: string | null
}): Promise<ClientPassport> {
  const link = await ensureClientUserPersonLink({
    clientUserId: input.clientUserId,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
  })

  const honesty = {
    titleTr: 'Asistan pasaportu',
    disclaimerTr:
      'Klinikler arası ziyaret ve üyelik özeti. Klinik notları, tahliller ve FHIR / tıbbi pasaport değildir.',
  }

  if (!link) {
    return {
      gpiDisplay: null,
      personLinked: false,
      fullName: input.fullName,
      clinics: [],
      visits: [],
      timeline: [],
      honesty,
    }
  }

  // Cross-clinic Person passport — intentional ecosystem read (RLS via app.person_id).
  const { clinics, visits } = await runWithTenantBypassAsync('passport:cross-clinic-read', () =>
    withPersonDb(link.personId, async (tx) => {
      const patients = await tx.patient.findMany({
        where: { personId: link.personId },
        select: {
          patientNumber: true,
          businessId: true,
          business: { select: { id: true, name: true, slug: true, city: true } },
        },
        take: 50,
      })

      // Do not `include: { service }` — Prisma requires the relation; orphaned
      // serviceId or RLS-hidden Service rows throw "got null instead".
      const appointments = await tx.appointment.findMany({
        where: {
          OR: [
            { clientUserId: input.clientUserId },
            { patient: { personId: link.personId } },
          ],
        },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        select: {
          id: true,
          status: true,
          date: true,
          startTime: true,
          businessId: true,
          serviceId: true,
          business: { select: { id: true, name: true, slug: true } },
          staff: { select: { id: true, fullName: true, specialty: true } },
          location: { select: { id: true, name: true, address: true } },
        },
        take: 200,
      })

      const serviceIds = Array.from(
        new Set(appointments.map((a) => a.serviceId).filter(Boolean))
      )
      const services =
        serviceIds.length === 0
          ? []
          : await tx.service.findMany({
              where: { id: { in: serviceIds } },
              select: { id: true, name: true },
            })
      const serviceById = new Map(services.map((s) => [s.id, s]))

      const clinicMap = new Map<string, ClientPassportClinic>()
      for (const p of patients) {
        clinicMap.set(p.businessId, {
          businessId: p.businessId,
          name: p.business.name,
          slug: p.business.slug,
          city: p.business.city,
          patientNumber: p.patientNumber,
        })
      }
      for (const a of appointments) {
        if (!clinicMap.has(a.businessId)) {
          clinicMap.set(a.businessId, {
            businessId: a.businessId,
            name: a.business.name,
            slug: a.business.slug,
            city: null,
            patientNumber: null,
          })
        }
      }

      const visitRows: ClientPassportVisit[] = appointments.map((row) => ({
        id: row.id,
        status: row.status,
        date: row.date.toISOString().slice(0, 10),
        startTime: row.startTime,
        clinic: row.business,
        doctor: row.staff,
        service: serviceById.get(row.serviceId) ?? {
          id: row.serviceId,
          name: 'Hizmet',
        },
        location: row.location,
      }))

      return { clinics: Array.from(clinicMap.values()), visits: visitRows }
    }),
  )

  const timeline = buildPatientVisitTimeline(
    visits.map((row) => ({
      id: row.id,
      date: row.date,
      startTime: row.startTime,
      status: row.status,
      clinic: row.clinic,
      service: row.service,
      doctor: row.doctor,
      location: row.location,
    }))
  )

  return {
    gpiDisplay: link.gpiDisplay,
    personLinked: true,
    fullName: input.fullName,
    clinics,
    visits,
    timeline,
    honesty,
  }
}

/** Used when person GUC path unavailable — fallback clinic list from clientUser appointments only. */
export async function listClinicsFromClientAppointments(clientUserId: string) {
  const rows = await prisma.appointment.findMany({
    where: { clientUserId },
    select: {
      businessId: true,
      business: { select: { id: true, name: true, slug: true, city: true } },
    },
    take: 200,
  })
  const map = new Map<string, ClientPassportClinic>()
  for (const r of rows) {
    map.set(r.businessId, {
      businessId: r.businessId,
      name: r.business.name,
      slug: r.business.slug,
      city: r.business.city,
      patientNumber: null,
    })
  }
  return Array.from(map.values())
}
