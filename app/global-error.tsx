'use client'

import { useEffect } from 'react'

/**
 * Root-level error boundary — replaces the root layout, so we cannot rely on
 * Tailwind classes from the app shell. Inline styles use the same brand hex
 * values as :root tokens in globals.css (--primary / --brand-blue).
 */
const brand = {
  ink: '#1D1D1F',
  muted: '#5D6068',
  blue: '#0071E3',
  blueHover: '#0063C8',
  surface: '#F7F9FB',
  border: '#E0E2E7',
  card: '#FFFFFF',
} as const

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <html lang="tr">
      <body style={{ margin: 0, background: brand.surface, color: brand.ink }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <section
            style={{
              maxWidth: 420,
              width: '100%',
              textAlign: 'center',
              background: brand.card,
              border: `1px solid ${brand.border}`,
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: brand.ink }}>
              Bir hata oluştu
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: brand.muted }}>
              Güvenliğiniz için teknik detaylar gizlendi. Lütfen sayfayı yenileyin.
            </p>
            {error.digest ? (
              <p
                style={{
                  margin: '12px 0 0',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: brand.surface,
                  fontSize: 12,
                  color: brand.muted,
                }}
              >
                Hata kodu: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: brand.blue,
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = brand.blueHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = brand.blue
              }}
            >
              Sayfayı yenile
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
