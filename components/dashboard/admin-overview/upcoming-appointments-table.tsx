'use client'

import Link from 'next/link'
import { CalendarPlus, ChevronRight, PlayCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatShortDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from './types'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UpcomingAppointmentsTable({
  upcomingAppointments,
  canCreateAppointment,
  onCreateAppointment,
  onShareCalendar,
  onOpenQuickStart,
}: {
  upcomingAppointments: CalendarEvent[]
  canCreateAppointment: boolean
  onCreateAppointment: () => void
  onShareCalendar: () => void
  onOpenQuickStart: () => void
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-brand-ink">Yaklaşan Randevular</h2>
          <Link href="/dashboard/randevular" className="inline-flex items-center gap-1 text-xs font-medium text-brand-teal">
            Tümü <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-slate-50/70 px-4 py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
              <PlayCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-brand-ink">Yaklaşan randevu yok</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Yeni bir randevu oluşturabilir veya online takvim bağlantısını paylaşabilirsiniz.
            </p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              {canCreateAppointment && (
                <Button size="sm" onClick={onCreateAppointment} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Randevu Oluştur
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onShareCalendar}>
                <Share2 className="mr-2 h-4 w-4" />
                Takvimi Paylaş
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenQuickStart}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Hızlı başlangıç turu
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id}>
                  <Link
                    href={`/dashboard/hastalar/${appointment.patientId}`}
                    className="flex items-center gap-3 rounded-xl border bg-white p-3 active:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-700">
                      {initials(appointment.patientName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-brand-ink">{appointment.patientName}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {appointment.serviceName}
                        {appointment.staffName ? ` • ${appointment.staffName}` : ''}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-semibold text-brand-ink">{formatTime(appointment.startTime)}</span>
                      <span
                        className={cn(
                          'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          appointment.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        )}
                      >
                        {appointment.status === 'CONFIRMED' ? 'Onaylı' : 'Bekliyor'}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-medium text-muted-foreground">
                    <th className="pb-3">Saat</th>
                    <th className="pb-3">Müşteri</th>
                    <th className="pb-3">Hizmet</th>
                    <th className="pb-3">Çalışan</th>
                    <th className="pb-3">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-dashboard-surface">
                      <td className="py-3 font-semibold text-brand-ink">{formatTime(appointment.startTime)}</td>
                      <td className="py-3">
                        <Link href={`/dashboard/hastalar/${appointment.patientId}`} className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                            {initials(appointment.patientName)}
                          </span>
                          <span>
                            <span className="block font-medium text-brand-ink">{appointment.patientName}</span>
                            <span className="block text-[11px] text-muted-foreground">{formatShortDate(appointment.date)}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 text-brand-ink">{appointment.serviceName}</td>
                      <td className="py-3 text-muted-foreground">{appointment.staffName ?? 'Atanmadı'}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-[11px] font-semibold',
                            appointment.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                          )}
                        >
                          {appointment.status === 'CONFIRMED' ? 'Onaylandı' : 'Onay Bekliyor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function UpcomingAppointmentsTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-12" />
        </div>

        <ul className="space-y-2 md:hidden">
          {Array.from({ length: rows }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 rounded-xl border bg-white p-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-40 max-w-full" />
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="pb-3"><Skeleton className="h-3 w-8" /></th>
                <th className="pb-3"><Skeleton className="h-3 w-12" /></th>
                <th className="pb-3"><Skeleton className="h-3 w-12" /></th>
                <th className="pb-3"><Skeleton className="h-3 w-14" /></th>
                <th className="pb-3"><Skeleton className="h-3 w-10" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="border-t">
                  <td className="py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

