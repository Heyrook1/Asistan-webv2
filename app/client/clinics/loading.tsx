import { ListSkeleton, SkeletonBlock } from '@/components/client/ui'

export default function ClinicsLoading() {
  return (
    <div className="space-y-4 px-1 py-2">
      <SkeletonBlock className="h-11 w-full rounded-full" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-8 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <ListSkeleton count={5} />
    </div>
  )
}
