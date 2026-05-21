import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-4 lg:space-y-5" aria-label="Dashboard yükleniyor">
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

      <div className="grid grid-cols-2 gap-2.5 md:gap-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-white p-3 md:p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-40 rounded-xl" />

      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="hidden h-72 rounded-xl xl:block" />
      </div>
    </div>
  )
}
