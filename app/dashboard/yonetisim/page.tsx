import { requireSuperAdminSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { GovernanceBoard } from './governance-board'

export const dynamic = 'force-dynamic'

export default async function GovernancePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; severity?: string; action?: string }>
}) {
  await requireSuperAdminSession()
  const params = (await searchParams) ?? {}
  const q = params.q?.trim() || ''
  const severity = params.severity?.trim() || 'all'
  const action = params.action?.trim() || 'all'

  const [auditLogs, deletionRequests, consents, complianceDocs, patients] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        ...(severity !== 'all' ? { severity: severity as 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'DEBUG' } : {}),
        ...(action !== 'all' ? { action: { contains: action } } : {}),
        ...(q
          ? {
              OR: [
                { summary: { contains: q, mode: 'insensitive' } },
                { action: { contains: q, mode: 'insensitive' } },
                { entityType: { contains: q, mode: 'insensitive' } },
                { entityId: { contains: q, mode: 'insensitive' } },
                { business: { name: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        actor: { select: { fullName: true, email: true } },
        business: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 150,
    }),
    prisma.dataDeletionRequest.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        processedBy: { select: { fullName: true } },
        business: { select: { name: true } },
      },
      orderBy: { requestedAt: 'desc' },
      take: 80,
    }),
    prisma.userConsent.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { grantedAt: 'desc' },
      take: 80,
    }),
    prisma.complianceDocument.findMany({
      include: {
        business: { select: { name: true } },
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: 80,
    }),
    prisma.patient.findMany({
      where: { isArchived: false, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        patientNumber: true,
        business: { select: { name: true } },
      },
      orderBy: { fullName: 'asc' },
      take: 300,
    }),
  ])

  return (
    <GovernanceBoard
      canManage
      filters={{ q, severity, action }}
      auditLogs={auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        severity: log.severity,
        summary: log.summary,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
        actorName: log.actor?.fullName ?? 'Sistem',
        actorEmail: log.actor?.email ?? null,
        businessName: log.business?.name ?? null,
      }))}
      deletionRequests={deletionRequests.map((req) => ({
        id: req.id,
        status: req.status,
        reason: req.reason,
        patientId: req.patientId,
        notes: req.notes,
        requestedAt: req.requestedAt.toISOString(),
        processedAt: req.processedAt?.toISOString() ?? null,
        requesterName: req.user.fullName,
        requesterEmail: req.user.email,
        processedByName: req.processedBy?.fullName ?? null,
        businessName: req.business?.name ?? null,
      }))}
      consents={consents.map((c) => ({
        id: c.id,
        consentType: c.consentType,
        version: c.version,
        granted: c.granted,
        grantedAt: c.grantedAt.toISOString(),
        revokedAt: c.revokedAt?.toISOString() ?? null,
        userName: c.user.fullName,
        userEmail: c.user.email,
      }))}
      complianceDocs={complianceDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        version: doc.version,
        status: doc.status,
        fileUrl: doc.fileUrl,
        notes: doc.notes,
        effectiveAt: doc.effectiveAt.toISOString(),
        expiresAt: doc.expiresAt?.toISOString() ?? null,
        businessName: doc.business?.name ?? null,
      }))}
      patients={patients.map((p) => ({
        id: p.id,
        fullName: `${p.fullName} · ${p.business.name}`,
        patientNumber: p.patientNumber,
      }))}
    />
  )
}
