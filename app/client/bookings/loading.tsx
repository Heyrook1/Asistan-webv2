import { ListSkeleton, SkeletonBlock } from '@/components/client/ui'

export default function BookingsLoading() {
  return (
    <div className="space-y-4 px-1 py-2">
      <SkeletonBlock className="h-9 w-40" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-9 w-24 rounded-full" />
        <SkeletonBlock className="h-9 w-20 rounded-full" />
        <SkeletonBlock className="h-9 w-24 rounded-full" />
      </div>
      <ListSkeleton count={4} />
    </div>
  )
}
