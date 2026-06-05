'use client'

import { useEffect } from 'react'

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
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <section style={{ maxWidth: 420, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Bir hata oluştu</h1>
            <p>Güvenliğiniz için teknik detaylar gizlendi. Lütfen sayfayı yenileyin.</p>
            {error.digest ? <p>Hata kodu: {error.digest}</p> : null}
          </section>
        </main>
      </body>
    </html>
  )
}
