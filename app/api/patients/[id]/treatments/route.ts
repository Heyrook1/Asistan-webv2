import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ title: z.string().min(2), description: z.string().optional(), doctorName: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), status: z.string().min(2), notes: z.string().optional() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canViewSensitive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const treatment = await prisma.treatment.create({ data: { providerId: access.providerId, patientId: id, ...parsed.data, startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null, endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'treatment_added', title: 'Tedavi eklendi', description: parsed.data.title } })
  return NextResponse.json({ data: treatment }, { status: 201 })
}
