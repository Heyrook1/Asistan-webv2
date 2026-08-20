import { SectionSkeleton } from '@/components/sections/section-skeleton'

export default function ClientLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <SectionSkeleton lines={4} />
    </div>
  )
}
