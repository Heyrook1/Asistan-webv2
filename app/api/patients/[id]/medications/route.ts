import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ name: z.string().min(2), dosageMg: z.number().int().optional(), frequency: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), notes: z.string().optional(), active: z.boolean().optional() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canViewSensitive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const medication = await prisma.medication.create({ data: { providerId: access.providerId, patientId: id, ...parsed.data, startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null, endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'medication_added', title: 'İlaç eklendi', description: parsed.data.name } })
  return NextResponse.json({ data: medication }, { status: 201 })
}
