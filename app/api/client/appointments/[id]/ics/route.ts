import { NextResponse, type NextRequest } from 'next/server'
import { apiError, parsePathId } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { requireClientAuth } from '@/lib/client-marketplace/auth'

export const dynamic = 'force-dynamic'

function icsEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function toIcsDate(date: Date, time: string) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const hm = time.replace(':', '')
  return `${ymd}T${hm}00`
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  const id = parsePathId((await context.params).id)
  if (!id) {
    return apiError('Gecersiz randevu kimligi', 400)
  }
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      clientUserId: auth.clientUser.id,
      deletedAt: null,
    },
    include: {
      business: { select: { name: true, address: true } },
      service: { select: { name: true } },
      staff: { select: { fullName: true } },
      location: { select: { name: true, address: true } },
    },
  })

  if (!appointment) {
    return apiError('Randevu bulunamadi', 404)
  }

  const summary = `${appointment.service.name} — ${appointment.business.name}`
  const description = [
    appointment.staff?.fullName ? `Hekim: ${appointment.staff.fullName}` : null,
    `Durum: ${appointment.status}`,
  ]
    .filter(Boolean)
    .join('\\n')
  const location =
    appointment.location?.address ??
    appointment.location?.name ??
    appointment.business.address ??
    appointment.business.name

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Asistan Health//Booking//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.id}@asistan.online`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART:${toIcsDate(appointment.date, appointment.startTime)}`,
    `DTEND:${toIcsDate(appointment.date, appointment.endTime)}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="asistan-randevu-${appointment.id.slice(0, 8)}.ics"`,
    },
  })
}
