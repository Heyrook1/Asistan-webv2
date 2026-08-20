export default function TakimLoading() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Takım yükleniyor">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200/80" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />
    </div>
  )
}
