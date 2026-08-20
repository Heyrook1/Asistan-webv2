import { CardSkeleton, SkeletonBlock } from '@/components/client/ui'

export default function ClinicDetailLoading() {
  return (
    <div className="space-y-4 px-1 py-2">
      <SkeletonBlock className="h-40 w-full rounded-3xl" />
      <SkeletonBlock className="h-6 w-2/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="space-y-3 pt-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
