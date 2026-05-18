import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { requirePermission, can } from '@/lib/session'
import { getPatientsList } from '@/lib/queries'
import { ageFromBirthDate, formatPhone, formatRelativeDate } from '@/lib/format'
import { EmptyState } from '@/components/dashboard/empty-state'
import { PatientsToolbar } from './patients-toolbar'

export const dynamic = 'force-dynamic'

export default async function HastalarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>
}) {
  const sp = await searchParams
  const session = await requirePermission('patient.view')
  const archived = sp.archived === '1'
  const patients = await getPatientsList(session.businessId, { query: sp.q, archived })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Hastalar</h1>
          <p className="text-sm text-muted-foreground">
            {patients.length} hasta listeleniyor{sp.q ? ` • "${sp.q}" araması` : ''}
            {archived ? ' • arşivlenenler' : ''}
          </p>
        </div>
        <PatientsToolbar canCreate={can(session, 'patient.edit')} />
      </div>

      {patients.length === 0 ? (
        <EmptyState
          title={sp.q ? 'Eşleşen hasta bulunamadı' : 'Henüz hasta yok'}
          description={
            sp.q
              ? 'Farklı bir arama deneyin ya da yeni hasta ekleyin.'
              : 'İlk hastayı kaydederek randevu, takip ve raporlama akışını başlatın.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FB] text-left">
                  <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Hasta</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">İletişim</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Yaş / Cinsiyet</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Etiketler</th>
                    <th className="px-4 py-3 font-medium">Aktivite</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map((p) => {
                    const age = ageFromBirthDate(p.birthDate)
                    return (
                      <tr key={p.id} className="hover:bg-[#F7F9FB]">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/hastalar/${p.id}`}
                            className="block font-medium text-[#0C1D36] hover:text-[#12C8AD]"
                          >
                            {p.fullName}
                          </Link>
                          <span className="text-[11px] text-muted-foreground">#{p.patientNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          <p className="text-sm text-[#0C1D36]">{formatPhone(p.phone)}</p>
                          {p.email && <p className="text-[11px]">{p.email}</p>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-sm text-[#0C1D36]">{age != null ? `${age}` : '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{p.gender || '—'}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {p.tags.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            ) : (
                              p.tags.slice(0, 3).map((t) => (
                                <Badge key={t} variant="secondary" className="bg-[#12C8AD]/10 text-[#0b7f6f] text-[10px]">
                                  {t}
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-[#0C1D36]">{p._count.appointments} randevu</p>
                          <p className="text-[11px] text-muted-foreground">{formatRelativeDate(p.updatedAt)}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/hastalar/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#12C8AD]"
                          >
                            Aç <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
