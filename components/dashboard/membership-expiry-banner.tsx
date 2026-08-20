'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import {
  daysUntilAccessEnd,
  getMembershipUrgency,
  type MembershipUrgency,
} from '@/lib/vendor-membership'
import { cn } from '@/lib/utils'

export type DashboardMembership = {
  planName: string
  planCode: string
  status: string
  isDemo: boolean
  accessEndAt: string | null
}

function bannerClass(urgency: MembershipUrgency) {
  if (urgency === 'critical' || urgency === 'expired') {
    return 'border-rose-200 bg-rose-50 text-rose-950'
  }
  return 'border-amber-200 bg-amber-50 text-amber-950'
}

export function MembershipExpiryBanner({
  membership,
  canManage,
}: {
  membership: DashboardMembership | null
  canManage: boolean
}) {
  if (!canManage || !membership) return null

  const urgency = getMembershipUrgency({
    accessEndAt: membership.accessEndAt,
    status: membership.status,
  })
  if (urgency === 'ok') return null

  const days = daysUntilAccessEnd(membership.accessEndAt)
  let message = 'Paket durumunuzu kontrol edin.'
  if (urgency === 'expired') {
    message = 'Paketiniz askıda veya süresi dolmuş. Yenileme için abonelik sayfasından talep gönderin.'
  } else if (days !== null) {
    message = `Paket erişiminizin bitmesine ${days} gün kaldı. Elden yenileme için abonelik sayfasını açın.`
  }

  return (
    <div className={cn('mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm', bannerClass(urgency))}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="font-medium leading-relaxed">{message}</p>
      </div>
      <Link
        href="/dashboard/ayarlar?tab=abonelik"
        className="shrink-0 text-sm font-bold underline-offset-2 hover:underline"
      >
        Aboneliği yönet
      </Link>
    </div>
  )
}
