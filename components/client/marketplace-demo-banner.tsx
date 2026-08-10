/** Visible when public catalog is empty or staging shows test clinics. */
export function ClientMarketplaceDemoBanner({
  mode,
}: {
  mode: 'empty-catalog' | 'test-clinics-visible'
}) {
  return (
    <div
      role="status"
      className="rounded-[1.1rem] border border-amber-200/90 bg-amber-50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-950"
    >
      {mode === 'test-clinics-visible' ? (
        <>
          <p className="font-bold">Demo ortamı</p>
          <p className="mt-0.5 text-amber-900/90">
            Listede görünen klinikler test seed kayıtlarıdır — canlı müşteri kataloğu değildir.
          </p>
        </>
      ) : (
        <>
          <p className="font-bold">Henüz canlı klinik yok</p>
          <p className="mt-0.5 text-amber-900/90">
            Public listede test klinikleri gösterilmez. Gerçek klinikler onaya girdikçe burada
            görünür.
          </p>
        </>
      )}
    </div>
  )
}
