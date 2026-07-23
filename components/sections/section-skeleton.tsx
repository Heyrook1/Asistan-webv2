export function SectionSkeleton({
  lines = 3,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <section className={`px-4 py-14 sm:px-6 lg:py-20 ${className}`.trim()}>
      <div className="mx-auto w-full max-w-[1220px] space-y-3 rounded-3xl border border-black/7 bg-white/60 p-6 shadow-glass-soft backdrop-blur-md">
        <div className="h-4 w-32 shimmer rounded-full bg-black/8" />
        <div className="h-10 w-full max-w-2xl shimmer rounded-2xl bg-black/8" />
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-4 shimmer rounded-full bg-black/8" />
        ))}
      </div>
    </section>
  )
}

