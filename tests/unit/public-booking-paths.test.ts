import { describe, expect, it } from 'vitest'

import {
  buildPublicBookEmbedSnippet,
  getPublicBookEmbedPath,
  getPublicBookPath,
} from '@/lib/public-booking/paths'

describe('public booking paths', () => {
  it('normalizes clinic slug paths', () => {
    expect(getPublicBookPath(' Demo-Klinik ')).toBe('/book/demo-klinik')
    expect(getPublicBookEmbedPath('Demo-Klinik')).toBe('/book/demo-klinik?embed=1')
  })

  it('builds an iframe embed snippet', () => {
    const snippet = buildPublicBookEmbedSnippet('https://kktc.asistan.online/book/demo', 'Demo Klinik')
    expect(snippet).toContain('src="https://kktc.asistan.online/book/demo?embed=1"')
    expect(snippet).toContain('iframe')
  })
})
