'use client'

import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Activity,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

type TimelineItem = {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: Date | string
}

function timelineColor(idx: number) {
  const palette = ['#0B7F6F', '#16A9E8', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4']
  return palette[idx % palette.length]
}

function timelineIcon(type: string) {
  if (type.includes('APPOINTMENT')) return <CalendarIcon className="h-3 w-3" />
  if (type.includes('MEDICATION')) return <span className="text-[9px] font-bold">Rx</span>
  if (type.includes('LAB')) return <ClipboardCheck className="h-3 w-3" />
  if (type.includes('FILE')) return <FileText className="h-3 w-3" />
  return <Activity className="h-3 w-3" />
}

export function PatientSecondaryPanel({ timeline }: { timeline: TimelineItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-ink">Son aktivite</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Hasta kartındaki son işlemler — ihtiyaç halinde açın.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? 'Gizle' : 'Göster'}
            <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
          </Button>
        </div>

        {open ? (
          <div className="mt-4 rounded-xl border bg-white p-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aktivite kaydı yok.</p>
            ) : (
              <ul className="relative space-y-3 pl-1">
                <span className="absolute bottom-1 left-3 top-1 w-px bg-border" />
                {timeline.slice(0, 8).map((ev, idx) => (
                  <li key={ev.id} className="relative pl-7">
                    <span
                      className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white"
                      style={{ background: timelineColor(idx) }}
                    >
                      {timelineIcon(ev.type)}
                    </span>
                    <p className="text-[11px] text-muted-foreground">{formatTimeAgo(ev.createdAt)}</p>
                    <p className="text-sm text-brand-ink">{ev.title}</p>
                    {ev.description ? (
                      <p className="text-[11px] text-muted-foreground">{ev.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
