import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ title: z.string().min(2), note: z.string().min(2), createdBy: z.string().min(2) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canViewSensitive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const note = await prisma.patientNote.create({ data: { providerId: access.providerId, patientId: id, ...parsed.data } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'note_added', title: 'Not eklendi', description: parsed.data.title } })
  return NextResponse.json({ data: note }, { status: 201 })
}
