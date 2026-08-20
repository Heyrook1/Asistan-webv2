'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'

import { pickAnnouncementSlot, type DashboardAnnouncement } from '@/lib/announcements'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'asistan-announcement-dismissed'

export function AnnouncementBanner({ items }: { items: DashboardAnnouncement[] }) {
  const [dismissed, setDismissed] = useState<string[] | null>(null)

  useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '[]') as string[])
    } catch {
      setDismissed([])
    }
  }, [])

  if (dismissed === null) return null

  const item = pickAnnouncementSlot(items, dismissed)
  if (!item) return null

  function dismiss(id: string) {
    const next = [...new Set([...(dismissed ?? []), id])]
    setDismissed(next)
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota */
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border px-3 py-2',
        item.severity === 'warning'
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-brand-blue/20 bg-brand-blue/5 text-brand-ink',
      )}
      role="status"
    >
      <Megaphone className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold sm:text-sm">
          {item.title}
          <span className="font-normal opacity-90"> — {item.body}</span>
        </p>
        {item.href && item.hrefLabel ? (
          <Link
            href={item.href}
            className="mt-0.5 inline-block text-[11px] font-bold underline-offset-2 hover:underline"
          >
            {item.hrefLabel}
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="rounded-lg p-1 opacity-60 hover:bg-black/5 hover:opacity-100"
        aria-label="Duyuruyu kapat"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
