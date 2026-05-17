import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ fileName: z.string().min(1), fileType: z.string().min(1), category: z.string().min(1), fileUrl: z.string().min(3) })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const file = await prisma.patientFile.create({ data: { providerId: access.providerId, patientId: id, ...parsed.data } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'file_uploaded', title: 'Dosya kaydedildi', description: parsed.data.fileName } })
  return NextResponse.json({ data: file }, { status: 201 })
}
