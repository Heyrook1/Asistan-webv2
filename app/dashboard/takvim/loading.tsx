export default function TakvimLoading() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Takvim yükleniyor">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200/80" />
      <div className="h-[28rem] animate-pulse rounded-2xl bg-slate-200/60" />
    </div>
  )
}
