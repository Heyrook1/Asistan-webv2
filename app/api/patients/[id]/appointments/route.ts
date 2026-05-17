import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ serviceId: z.string().min(1), staffId: z.string().min(1), date: z.string(), startTime: z.string(), endTime: z.string(), status: z.string().default('pending'), notes: z.string().optional() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!(access.canEdit || access.role === 'Sekreter')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const appointment = await prisma.patientAppointment.create({ data: { providerId: access.providerId, patientId: id, ...parsed.data, date: new Date(parsed.data.date) } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'appointment_created', title: 'Randevu oluşturuldu', description: `${parsed.data.date} ${parsed.data.startTime}` } })
  return NextResponse.json({ data: appointment }, { status: 201 })
}
