import { describe, expect, it } from 'vitest'

import { LOCATION_REQUIRED_ERROR, LOCATION_SETUP_HREF } from '@/lib/locations/constants'

describe('P0-08 location setup contract', () => {
  it('points appointment UI to settings şube section', () => {
    expect(LOCATION_SETUP_HREF).toBe('/dashboard/ayarlar?tab=isletme#settings-locations')
  })

  it('exposes a stable backend error for missing branch', () => {
    expect(LOCATION_REQUIRED_ERROR).toMatch(/şube/i)
    expect(LOCATION_REQUIRED_ERROR).not.toMatch(/Merkez|varsayılan|otomatik/i)
  })
})
