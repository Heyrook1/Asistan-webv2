import { headers } from 'next/headers'
import type { AuditSeverity, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'patient.create'
  | 'patient.update'
  | 'patient.archive'
  | 'patient.delete'
  | 'appointment.create'
  | 'appointment.update'
  | 'appointment.cancel'
  | 'appointment.reschedule'
  | 'team.member.update'
  | 'team.permission.update'
  | 'team.access.change'
  | 'settings.business.update'
  | 'prescription.create'
  | 'consent.record'
  | 'deletion.request.create'
  | 'deletion.request.process'
  | 'compliance.document.upsert'
  | 'admin.vendor.update'
  | string

type WriteAuditInput = {
  businessId?: string | null
  actorUserId?: string | null
  action: AuditAction
  entityType: string
  entityId?: string | null
  severity?: AuditSeverity
  summary?: string | null
  metadata?: Prisma.InputJsonValue
  ipAddress?: string | null
  userAgent?: string | null
}

export async function getRequestAuditContext() {
  try {
    const h = await headers()
    const forwarded = h.get('x-forwarded-for')
    const ipAddress = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || null
    const userAgent = h.get('user-agent')
    return { ipAddress, userAgent }
  } catch {
    return { ipAddress: null, userAgent: null }
  }
}

export async function writeAuditLog(input: WriteAuditInput) {
  const requestContext = input.ipAddress || input.userAgent ? null : await getRequestAuditContext()

  try {
    return await prisma.auditLog.create({
      data: {
        businessId: input.businessId ?? null,
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        severity: input.severity ?? 'INFO',
        summary: input.summary ?? null,
        metadata: input.metadata ?? undefined,
        ipAddress: input.ipAddress ?? requestContext?.ipAddress ?? null,
        userAgent: input.userAgent ?? requestContext?.userAgent ?? null,
      },
    })
  } catch (error) {
    // Never block the primary business action if audit write fails.
    console.error('[audit] failed to write audit log', error)
    return null
  }
}
