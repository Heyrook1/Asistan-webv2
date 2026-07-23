export default function AjandaLoading() {
  return (
    <div className="space-y-4 p-1" aria-busy="true" aria-label="Ajanda yükleniyor">
      <div className="flex gap-2">
        <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200/80" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200/80" />
      </div>
      <div className="h-[28rem] animate-pulse rounded-2xl bg-slate-200/60" />
    </div>
  )
}
