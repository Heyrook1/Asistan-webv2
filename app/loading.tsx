import { SectionSkeleton } from '@/components/sections/section-skeleton'

/** Root marketing / shared route loading — Suspense boundary for RSC. */
export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <SectionSkeleton lines={5} className="min-h-[50vh]" />
      <SectionSkeleton lines={3} />
    </div>
  )
}
