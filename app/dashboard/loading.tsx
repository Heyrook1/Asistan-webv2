import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsGridSkeleton } from '@/components/dashboard/admin-overview/stats-grid'
import { MiniCalendarSkeleton } from '@/components/dashboard/admin-overview/mini-calendar'
import { PriorityCardsSkeleton } from '@/components/dashboard/admin-overview/priority-cards'
import { UpcomingAppointmentsTableSkeleton } from '@/components/dashboard/admin-overview/upcoming-appointments-table'
import { RemindersCardSkeleton } from '@/components/dashboard/reminders-card'

export default function DashboardLoading() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-label="Dashboard yukleniyor">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="hidden gap-2 lg:flex">
          <Skeleton className="h-11 w-36 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
          <Skeleton className="h-11 w-32 rounded-md" />
        </div>
      </div>

      <StatsGridSkeleton />
      <RemindersCardSkeleton />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.25fr_1.55fr]">
        <Card className="shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
            <Skeleton className="mb-3 h-1.5 w-full" />
            <ul className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <MiniCalendarSkeleton />
        <PriorityCardsSkeleton />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <UpcomingAppointmentsTableSkeleton />
        <Card className="hidden shadow-sm xl:block">
          <CardContent className="p-5">
            <Skeleton className="mb-4 h-4 w-28" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl border bg-white p-3">
                  <Skeleton className="mx-auto h-6 w-6 rounded-full" />
                  <Skeleton className="mx-auto mt-2 h-3 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

