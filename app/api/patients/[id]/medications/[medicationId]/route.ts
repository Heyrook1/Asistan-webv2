import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPatientAccess } from '@/lib/patient-rbac'

const schema = z.object({ name: z.string().min(2).optional(), dosageMg: z.number().int().optional(), frequency: z.string().optional(), notes: z.string().optional(), active: z.boolean().optional() })

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; medicationId: string }> }) {
  const access = await getPatientAccess()
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status })
  if (!access.canViewSensitive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, medicationId } = await params
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const medication = await prisma.medication.update({ where: { id: medicationId }, data: parsed.data })
  await prisma.patientTimelineEvent.create({ data: { providerId: access.providerId, patientId: id, type: 'medication_updated', title: 'İlaç güncellendi' } })
  return NextResponse.json({ data: medication })
}
