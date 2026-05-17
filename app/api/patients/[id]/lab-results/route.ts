import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ title: z.string().min(2), description: z.string().optional(), resultDate: z.string(), fileUrl: z.string().url().optional().or(z.literal('')), notes: z.string().optional() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canViewSensitive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const lab = await prisma.labResult.create({ data: { providerId: access.providerId, patientId: id, title: parsed.data.title, description: parsed.data.description, resultDate: new Date(parsed.data.resultDate), fileUrl: parsed.data.fileUrl || null, notes: parsed.data.notes } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'lab_result_added', title: 'Tahlil sonucu eklendi', description: parsed.data.title } })
  return NextResponse.json({ data: lab }, { status: 201 })
}
