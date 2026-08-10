import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireSession } from '@/lib/session'
import { ROLE_LABELS } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const NEED_LABELS: Record<string, string> = {
  'team.view': 'Takım görüntüleme',
  'team.manage': 'Takım yönetimi',
  'analytics.view': 'Analitik',
  'analytics.revenue.view': 'Ciro analitikleri',
  'patient.view': 'Hasta görüntüleme',
  'service.manage': 'Hizmet yönetimi',
  'audit.view': 'Denetim kaydı',
}

export default async function YetkisizPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>
}) {
  const session = await requireSession()
  const sp = await searchParams
  const needs = (sp.need ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const needLabels = needs.map((n) => NEED_LABELS[n] ?? n)

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <ShieldAlert className="h-7 w-7" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-brand-ink">Bu sayfaya erişim yetkiniz yok</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Rolünüz: <strong className="text-brand-ink">{ROLE_LABELS[session.role]}</strong>
          {needLabels.length > 0 ? (
            <>
              . Gerekli yetki: <strong className="text-brand-ink">{needLabels.join(' veya ')}</strong>.
            </>
          ) : (
            '.'
          )}{' '}
          İşletme sahibi veya yetkili bir yöneticiden rol/izin güncellemesi isteyin.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button asChild className="bg-brand-teal text-white hover:bg-brand-teal-hover">
          <Link href="/dashboard">Panele dön</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/yardim">Yardım Merkezi</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" role="status">
        HTTP 403 — yetkisiz erişim
      </p>
    </div>
  )
}
