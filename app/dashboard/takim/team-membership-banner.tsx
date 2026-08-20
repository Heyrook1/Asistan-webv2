'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import type { MembershipSnapshot } from './team-board-types'

export function TeamMembershipBanner({
  membership,
  effectiveActiveMembers,
  reachedUserLimit,
}: {
  membership: MembershipSnapshot
  effectiveActiveMembers: number
  reachedUserLimit: boolean
}) {
  const membershipEndText = membership.accessEndAt
    ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(membership.accessEndAt))
    : 'Süresiz'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">Paket Durumu</p>
          <p className="mt-1 text-base font-bold text-brand-ink">
            {membership.isDemo ? 'Demo Hesap' : membership.planName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Hesap pasif tarihi: {membershipEndText}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-brand-ink">
          {membership.userLimit === null
            ? `Aktif kullanıcı: ${effectiveActiveMembers} / Sınırsız`
            : `Aktif kullanıcı: ${effectiveActiveMembers} / ${membership.userLimit}`}
        </div>
      </div>
      {reachedUserLimit && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Bu pakette aktif kullanıcı limiti doldu. Yeni ekip üyesi eklemek için{' '}
            <Link href="/dashboard/ayarlar?tab=abonelik" className="font-semibold underline underline-offset-2">
              paketi yükseltin
            </Link>
            .
          </p>
        </div>
      )}
      {!reachedUserLimit && (
        <div className="mt-3">
          <Link
            href="/dashboard/ayarlar?tab=abonelik"
            className="text-sm font-semibold text-brand-blue underline-offset-2 hover:underline"
          >
            Abonelik ve paket detayları
          </Link>
        </div>
      )}
    </section>
  )
}
