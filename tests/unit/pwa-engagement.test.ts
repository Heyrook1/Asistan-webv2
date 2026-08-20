import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  hasPwaEngagement,
  markPwaEngagement,
  PWA_ENGAGEMENT_KEY,
} from '@/lib/pwa/engagement'

describe('pwa engagement gate', () => {
  afterEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('starts unengaged', () => {
    expect(hasPwaEngagement()).toBe(false)
  })

  it('marks engagement once and dispatches event', () => {
    const spy = vi.fn()
    window.addEventListener('asistan:pwa-engaged', spy)
    markPwaEngagement('clinic_search')
    expect(hasPwaEngagement()).toBe(true)
    expect(window.localStorage.getItem(PWA_ENGAGEMENT_KEY)).toBe('1')
    expect(spy).toHaveBeenCalledTimes(1)
    markPwaEngagement('clinic_view')
    expect(spy).toHaveBeenCalledTimes(1)
    window.removeEventListener('asistan:pwa-engaged', spy)
  })
})
