import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  const { id } = await params
  const patient = await prisma.patient.findFirst({
    where: { id, providerId: access.providerId, isArchived: false },
    include: {
      appointments: { orderBy: { date: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      medications: { orderBy: { createdAt: 'desc' } },
      treatments: { orderBy: { createdAt: 'desc' } },
      labResults: { orderBy: { resultDate: 'desc' } },
      files: { orderBy: { uploadedAt: 'desc' } },
      timeline: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const sanitized = access.canViewSensitive ? patient : { ...patient, notes: [], medications: [], treatments: [], labResults: [] }
  return NextResponse.json({ data: sanitized })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const json = await request.json()
  const parsed = updateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const patient = await prisma.patient.update({ where: { id }, data: parsed.data })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'patient_updated', title: 'Hasta bilgileri güncellendi' } })
  return NextResponse.json({ data: patient })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.patient.update({ where: { id }, data: { isArchived: true } })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'patient_archived', title: 'Hasta arşivlendi' } })
  return NextResponse.json({ ok: true })
}
