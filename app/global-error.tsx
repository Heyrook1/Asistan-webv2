'use client'

import { useEffect, type CSSProperties } from 'react'
import * as Sentry from '@sentry/nextjs'

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

function linkStyle(primary: boolean): CSSProperties {
  return {
    display: 'inline-block',
    marginTop: 8,
    marginRight: 8,
    padding: '10px 16px',
    borderRadius: 10,
    border: primary ? 'none' : `1px solid ${brand.border}`,
    background: primary ? brand.blue : brand.card,
    color: primary ? '#FFFFFF' : brand.ink,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  }
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: 'global-error' },
      extra: error.digest ? { digest: error.digest } : undefined,
    })
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
              Güvenliğiniz için teknik detaylar gizlendi. Panele dönebilir veya destek sayfasını
              açabilirsiniz.
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
                Destek için kod: {error.digest}
              </p>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={linkStyle(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = brand.blueHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = brand.blue
                }}
              >
                Sayfayı yenile
              </button>
              <a href="/dashboard" style={linkStyle(false)}>
                Panele dön
              </a>
              <a href="/contact" style={linkStyle(false)}>
                Destek
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
