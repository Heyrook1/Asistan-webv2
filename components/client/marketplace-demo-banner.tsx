'use client'

import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Visible when public catalog is empty or staging shows test clinics.
 *
 * Client component on purpose: rendered from both a Server Component
 * (app/client/clinics/page.tsx) and a Client Component (web-mobile/home-hub.tsx).
 * LanguageProvider is seeded server-side from the `asistan-lang` cookie, so SSR
 * already paints the right locale.
 */
export function ClientMarketplaceDemoBanner({
  mode,
}: {
  mode: 'empty-catalog' | 'test-clinics-visible'
}) {
  const { t } = useLanguage()

  const copy =
    mode === 'test-clinics-visible'
      ? {
          title: t({ tr: 'Demo ortamı', en: 'Demo environment' }),
          body: t({
            tr: 'Listede görünen klinikler test seed kayıtlarıdır — canlı müşteri kataloğu değildir.',
            en: 'The clinics listed here are test seed records — not the live customer catalogue.',
          }),
        }
      : {
          title: t({ tr: 'Henüz canlı klinik yok', en: 'No live clinics yet' }),
          body: t({
            tr: 'Public listede test klinikleri gösterilmez. Gerçek klinikler onaya girdikçe burada görünür.',
            en: 'Test clinics are not shown in the public list. Real clinics appear here as they are approved.',
          }),
        }

  return (
    <div
      role="status"
      className="rounded-[1.1rem] border border-amber-200/90 bg-amber-50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-950"
    >
      <p className="font-bold">{copy.title}</p>
      <p className="mt-0.5 text-amber-900/90">{copy.body}</p>
    </div>
  )
}
