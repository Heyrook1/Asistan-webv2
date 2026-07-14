'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'

import type { DashboardAnnouncement } from '@/lib/announcements'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'asistan-announcement-dismissed'

export function AnnouncementBanner({ items }: { items: DashboardAnnouncement[] }) {
  const [visible, setVisible] = useState<DashboardAnnouncement[]>([])

  useEffect(() => {
    let dismissed: string[] = []
    try {
      dismissed = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '[]') as string[]
    } catch {
      dismissed = []
    }
    setVisible(items.filter((item) => !dismissed.includes(item.id)))
  }, [items])

  if (visible.length === 0) return null

  function dismiss(id: string) {
    setVisible((prev) => prev.filter((item) => item.id !== id))
    try {
      const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '[]') as string[]
      localStorage.setItem(DISMISS_KEY, JSON.stringify([...new Set([...raw, id])]))
    } catch {
      localStorage.setItem(DISMISS_KEY, JSON.stringify([id]))
    }
  }

  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start gap-3 rounded-2xl border px-4 py-3',
            item.severity === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-brand-blue/20 bg-brand-blue/5 text-brand-ink',
          )}
          role="status"
        >
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed opacity-90">{item.body}</p>
            {item.href && item.hrefLabel ? (
              <Link href={item.href} className="mt-1.5 inline-block text-xs font-bold underline-offset-2 hover:underline">
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
      ))}
    </div>
  )
}
