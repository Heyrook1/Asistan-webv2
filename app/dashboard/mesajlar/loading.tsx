export default function MesajlarLoading() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Mesajlar yükleniyor">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200/80" />
      <div className="grid gap-3 md:grid-cols-[16rem_1fr]">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200/60" />
      </div>
    </div>
  )
}
