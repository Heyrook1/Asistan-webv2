import { CardSkeleton, SkeletonBlock } from '@/components/client/ui'

export default function DoctorLoading() {
  return (
    <div className="space-y-4 px-1 py-2">
      <SkeletonBlock className="h-28 w-full rounded-2xl" />
      <SkeletonBlock className="h-20 w-full rounded-2xl" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}
