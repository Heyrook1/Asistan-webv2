import { describe, it, expect } from 'vitest'

import { parseAnalyticsMonthRange } from '@/lib/analytics-range'
import { estimateReadingMinutes, getGuideBySlug, guideWordCount, GUIDES } from '@/lib/resources/guides'
import {
  absoluteUrl,
  PUBLIC_SITEMAP_PATHS,
  SITE_URL,
  withCanonical,
} from '@/lib/seo'

describe('lib/seo', () => {
  it('builds absolute urls from site base', () => {
    expect(SITE_URL).toBe('https://kktc.asistan.online')
    expect(absoluteUrl('/urun')).toBe('https://kktc.asistan.online/urun')
    expect(absoluteUrl('privacy')).toBe('https://kktc.asistan.online/privacy')
  })

  it('attaches per-page canonical without forcing root', () => {
    const meta = withCanonical('/fiyatlandirma', { title: 'Fiyatlandırma' })
    // canonical stays relative — Next resolves it against metadataBase.
    expect(meta.alternates?.canonical).toBe('/fiyatlandirma')
    // og:url must be absolute: the Open Graph spec requires it, and relative
    // values break WhatsApp / Facebook link previews.
    expect(meta.openGraph?.url).toBe('https://kktc.asistan.online/fiyatlandirma')
    expect(meta.title).toBe('Fiyatlandırma')
  })

  it('includes core marketing paths and excludes dashboard', () => {
    expect(PUBLIC_SITEMAP_PATHS).toContain('/')
    expect(PUBLIC_SITEMAP_PATHS).toContain('/privacy')
    expect(PUBLIC_SITEMAP_PATHS).not.toContain('/dashboard')
  })
})

describe('lib/resources/guides', () => {
  it('resolves guides by slug', () => {
    expect(getGuideBySlug('hasta-hatirlatmalari')?.title).toContain('hatırlatma')
    expect(getGuideBySlug('missing')).toBeNull()
  })

  it('estimates reading time from content length', () => {
    for (const guide of GUIDES) {
      expect(estimateReadingMinutes(guide)).toBeGreaterThanOrEqual(2)
      expect(guideWordCount(guide)).toBeGreaterThanOrEqual(250)
    }
  })
})

describe('parseAnalyticsMonthRange', () => {
  it('accepts 3/6/12 and defaults to 6', () => {
    expect(parseAnalyticsMonthRange('3')).toBe(3)
    expect(parseAnalyticsMonthRange('12')).toBe(12)
    expect(parseAnalyticsMonthRange('99')).toBe(6)
    expect(parseAnalyticsMonthRange(undefined)).toBe(6)
  })
})
