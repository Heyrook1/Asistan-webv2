import { CardSkeleton, SkeletonBlock } from '@/components/client/ui'

export default function HealthLoading() {
  return (
    <div className="space-y-4 px-1 py-2">
      <SkeletonBlock className="h-9 w-48" />
      <SkeletonBlock className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-24 rounded-2xl" />
        <SkeletonBlock className="h-24 rounded-2xl" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}
