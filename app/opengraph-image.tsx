import { ImageResponse } from 'next/og'

import { brandTagline, productName } from '@/lib/brand/masterbrand'
import { getLiveHub } from '@/lib/brand/regional-hubs'

export const runtime = 'edge'
export const alt = 'Asistan Health — KKTC klinik randevu ve operasyon paneli'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Canonical share card — 1200×630 (not a cropped wordmark). */
export default function OpenGraphImage() {
  const title = productName('health', 'tr')
  const subtitle = brandTagline('health', 'tr')
  const host = getLiveHub().host

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #F7F7F5 0%, #EEF6FF 48%, #E8F1FB 100%)',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#0071E3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1D1D1F', letterSpacing: -0.5 }}>
              Asistan
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#0071E3' }}>Health</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 920 }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              color: '#1D1D1F',
              lineHeight: 1.15,
              letterSpacing: -1.2,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, color: '#5D6068', lineHeight: 1.35 }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600, color: '#5D6068' }}>
            {host}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 20px',
              borderRadius: 999,
              background: '#0071E3',
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            KKTC önce · kanıtlı operasyon
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
