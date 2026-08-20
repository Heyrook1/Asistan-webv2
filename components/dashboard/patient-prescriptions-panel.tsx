import Link from 'next/link'
import { FileText } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { labelPrescriptionStatus } from '@/lib/ui-labels'
import { Badge } from '@/components/ui/badge'

export function PatientPrescriptionsPanel({
  patientId,
  prescriptions,
}: {
  patientId: string
  prescriptions: Array<{
    id: string
    protocolNo: string
    diagnosis: string
    issuedAt: string
    doctorFullName: string
    status: string
  }>
}) {
  if (prescriptions.length === 0) return null

  return (
    <div className="rounded-xl border border-border/70 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-brand-teal" />
        <p className="text-sm font-semibold text-brand-ink">Klinik reçeteler</p>
      </div>
      <ul className="space-y-2">
        {prescriptions.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-dashboard-surface px-3 py-2"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-brand-ink">{item.protocolNo}</p>
                <Badge variant="outline" className="text-[10px]">
                  {labelPrescriptionStatus(item.status)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(item.issuedAt)} · {item.doctorFullName}
              </p>
              <p className="text-xs text-brand-ink">{item.diagnosis}</p>
            </div>
            <Link
              href={`/dashboard/hastalar/${patientId}/receteler/${item.id}`}
              className="text-xs font-semibold text-brand-teal hover:underline"
              data-testid={`prescription-open-${item.id}`}
            >
              Görüntüle / Yazdır
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
