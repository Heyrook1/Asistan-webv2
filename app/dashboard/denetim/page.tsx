import { ScrollText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { requirePagePermission } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/format'
import { labelAuditSeverity } from '@/lib/ui-labels'

export const dynamic = 'force-dynamic'

const OWNER_VISIBLE_ACTIONS = [
  'patient.create',
  'patient.update',
  'patient.archive',
  'patient.delete',
  'appointment.create',
  'appointment.update',
  'appointment.cancel',
  'appointment.reschedule',
  'team.member.update',
  'team.permission.update',
  'team.access.change',
  'settings.business.update',
  'prescription.create',
] as const

export default async function DenetimPage() {
  const session = await requirePagePermission('audit.view')

  const logs = await prisma.auditLog.findMany({
    where: {
      businessId: session.businessId,
      OR: [
        { action: { in: [...OWNER_VISIBLE_ACTIONS] } },
        { action: { startsWith: 'patient.' } },
        { action: { startsWith: 'appointment.' } },
        { action: { startsWith: 'team.' } },
        { action: { startsWith: 'settings.' } },
      ],
    },
    include: {
      actor: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-teal">
          <ScrollText className="h-3.5 w-3.5" aria-hidden />
          Denetim
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink">Klinik denetim günlüğü</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          İşletmenize ait güvenlik ve operasyon kayıtlarının özeti. Platform geneli yönetişim
          kayıtları Super Admin alanındadır.
        </p>
      </header>

      <Card className="shadow-none">
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Henüz görüntülenecek denetim kaydı yok.</p>
          ) : (
            <ul className="divide-y">
              {logs.map((log) => (
                <li key={log.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                      <Badge
                        className={
                          log.severity === 'ERROR' || log.severity === 'CRITICAL'
                            ? 'border-0 bg-rose-100 text-rose-700'
                            : log.severity === 'WARN'
                              ? 'border-0 bg-amber-100 text-amber-800'
                              : 'border-0 bg-slate-100 text-slate-700'
                        }
                      >
                        {labelAuditSeverity(log.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-brand-ink">
                      {log.summary || `${log.entityType}${log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.actor?.fullName ?? 'Sistem'}
                      {log.actor?.email ? ` · ${log.actor.email}` : ''}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground" dateTime={log.createdAt.toISOString()}>
                    {formatDateTime(log.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
