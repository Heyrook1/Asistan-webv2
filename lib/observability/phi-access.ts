/**
 * Structured PHI access audit — who accessed which patient chart / search / files.
 * Metadata must be ids + counts only (no names, phones, query strings).
 */
import type { Prisma } from '@prisma/client'

import { log } from '@/lib/observability/logger'

export type PhiAccessAction =
  | 'patient.view'
  | 'patient.search'
  | 'patient.file.view'

type PhiAccessInput = {
  businessId: string
  actorUserId: string
  action: PhiAccessAction
  entityType?: string
  entityId?: string | null
  summary?: string
  metadata?: {
    hitCount?: number
    queryLen?: number
    fileCount?: number
    includeNotes?: boolean
    includeFiles?: boolean
    source?: string
  }
}

/** Fire-and-forget PHI access record (never throws). */
export function logPhiAccess(input: PhiAccessInput): void {
  const metadata = (input.metadata ?? {}) as Prisma.InputJsonValue

  log.info('phi.access', {
    action: input.action,
    businessId: input.businessId,
    actorUserId: input.actorUserId,
    entityId: input.entityId ?? undefined,
    hitCount: input.metadata?.hitCount,
    queryLen: input.metadata?.queryLen,
    fileCount: input.metadata?.fileCount,
    source: input.metadata?.source,
  })

  // Dynamic import keeps unit tests free of Prisma/env bootstrap.
  void import('@/lib/audit')
    .then(({ writeAuditLog }) =>
      writeAuditLog({
        businessId: input.businessId,
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType ?? 'Patient',
        entityId: input.entityId ?? null,
        severity: 'INFO',
        summary: input.summary ?? input.action,
        metadata,
      })
    )
    .catch(() => {
      /* never block */
    })
}
