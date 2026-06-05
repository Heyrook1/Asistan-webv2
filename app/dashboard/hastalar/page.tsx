import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowRight, ChevronRight, Phone, Mail } from 'lucide-react'
import { requirePagePermission, can } from '@/lib/session'
import { getPatientsList } from '@/lib/queries'
import { ageFromBirthDate, formatPhone, formatRelativeDate } from '@/lib/format'
import { EmptyState } from '@/components/dashboard/empty-state'
import { PatientsToolbar } from './patients-toolbar'

export const dynamic = 'force-dynamic'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default async function HastalarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string; create?: string }>
}) {
  const sp = await searchParams
  const session = await requirePagePermission('patient.view')
  const archived = sp.archived === '1'
  const patients = await getPatientsList(session.businessId, { query: sp.q, archived })

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-ink lg:text-2xl">Hastalar</h1>
          <p className="text-[12px] text-muted-foreground lg:text-sm">
            {patients.length} hasta{sp.q ? ` • "${sp.q}"` : ''}{archived ? ' • arşiv' : ''}
          </p>
        </div>
      </div>

      <PatientsToolbar
        canCreate={can(session, 'patient.edit')}
        initialCreateOpen={sp.create === '1'}
      />

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
        <>
          {/* Mobile: card list */}
          <ul className="space-y-2 md:hidden">
            {patients.map((p) => {
              const age = ageFromBirthDate(p.birthDate)
              const hasAllergy = p._count.allergies > 0
              const hasRisk = Boolean(p.riskNote)
              return (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/hastalar/${p.id}`}
                    className="flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm active:bg-slate-50"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal/15 to-brand-cyan/15 text-sm font-bold text-brand-ink">
                      {initials(p.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold text-brand-ink">{p.fullName}</span>
                        {hasAllergy && (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Alerji uyarısı" />
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                        <span className="truncate">{formatPhone(p.phone)}</span>
                        {age != null && <span className="shrink-0">• {age} yaş</span>}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        {hasRisk && (
                          <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px]">Riskli</Badge>
                        )}
                        {p.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-brand-teal/10 text-brand-teal border-0 text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {p._count.appointments > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {p._count.appointments} randevu • {formatRelativeDate(p.updatedAt)}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Tablet+: table */}
          <Card className="hidden md:block">
            <CardContent className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dashboard-surface text-left">
                    <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Hasta</th>
                      <th className="px-4 py-3 font-medium">İletişim</th>
                      <th className="px-4 py-3 font-medium hidden lg:table-cell">Yaş / Cinsiyet</th>
                      <th className="px-4 py-3 font-medium hidden lg:table-cell">Etiketler</th>
                      <th className="px-4 py-3 font-medium">Aktivite</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {patients.map((p) => {
                      const age = ageFromBirthDate(p.birthDate)
                      const hasAllergy = p._count.allergies > 0
                      const hasRisk = Boolean(p.riskNote)
                      return (
                        <tr key={p.id} className="hover:bg-dashboard-surface">
                          <td className="px-4 py-3">
                            <Link
                              href={`/dashboard/hastalar/${p.id}`}
                              className="flex items-center gap-1.5 font-medium text-brand-ink hover:text-brand-teal"
                            >
                              {p.fullName}
                              {hasAllergy && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                              {hasRisk && <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px]">Riskli</Badge>}
                            </Link>
                            <span className="text-[11px] text-muted-foreground">#{p.patientNumber}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <p className="flex items-center gap-1.5 text-sm text-brand-ink">
                              <Phone className="h-3 w-3 text-muted-foreground" /> {formatPhone(p.phone)}
                            </p>
                            {p.email && (
                              <p className="flex items-center gap-1.5 text-[11px]">
                                <Mail className="h-3 w-3" /> {p.email}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <p className="text-sm text-brand-ink">{age != null ? `${age}` : '—'}</p>
                            <p className="text-[11px] text-muted-foreground">{p.gender || '—'}</p>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {p.tags.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">—</span>
                              ) : (
                                p.tags.slice(0, 3).map((t) => (
                                  <Badge key={t} variant="secondary" className="bg-brand-teal/10 text-brand-teal text-[10px]">
                                    {t}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-brand-ink">{p._count.appointments} randevu</p>
                            <p className="text-[11px] text-muted-foreground">{formatRelativeDate(p.updatedAt)}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/dashboard/hastalar/${p.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-brand-teal"
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
        </>
      )}
    </div>
  )
}
