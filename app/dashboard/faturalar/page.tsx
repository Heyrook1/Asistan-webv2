import { requireSession, can, canViewFinance } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isKktcEFaturaConfigured } from '@/lib/invoicing'
import { ClinicInvoicesBoard } from '@/components/dashboard/clinic-invoices-board'
import type { ClinicInvoiceRow } from '@/lib/actions/invoices'

export const dynamic = 'force-dynamic'

export default async function FaturalarPage() {
  const session = await requireSession()
  const allowed = can(session, 'appointment.manage') || canViewFinance(session)

  if (!allowed) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
        Faturaları görüntülemek için yetkiniz yok.
      </div>
    )
  }

  const [business, rows] = await Promise.all([
    prisma.business.findUnique({
      where: { id: session.businessId },
      select: { invoiceEnabled: true },
    }),
    prisma.clinicInvoice.findMany({
      where: { businessId: session.businessId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const invoices: ClinicInvoiceRow[] = rows.map((r) => ({
    id: r.id,
    number: r.number,
    status: r.status,
    kind: r.kind,
    buyerName: r.buyerName,
    total: Number(r.total),
    currency: r.currency,
    appointmentId: r.appointmentId,
    patientId: r.patientId,
    provider: r.provider,
    providerRef: r.providerRef,
    lastError: r.lastError,
    issuedAt: r.issuedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-brand-ink">Faturalar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          KKTC e-Fatura taslakları — TR GİB e-SMM değil.
        </p>
      </div>
      <ClinicInvoicesBoard
        invoices={invoices}
        invoiceEnabled={Boolean(business?.invoiceEnabled)}
        kktcApiConfigured={isKktcEFaturaConfigured()}
        canManage={allowed}
      />
    </div>
  )
}
