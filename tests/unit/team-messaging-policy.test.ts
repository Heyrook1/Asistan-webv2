import { describe, expect, it } from 'vitest'

import { isFeatureEnabled } from '@/lib/feature-flags'
import {
  TEAM_MESSAGING_DISABLED_MESSAGE,
  isTeamMessagingEnabled,
  teamMessagingDisabledResult,
} from '@/lib/messaging/policy'

describe('team messaging deprecation', () => {
  it('keeps teamMessaging off by default', () => {
    expect(isFeatureEnabled('teamMessaging')).toBe(false)
    expect(isTeamMessagingEnabled()).toBe(false)
  })

  it('returns a clear ActionResult when disabled', () => {
    const result = teamMessagingDisabledResult()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(TEAM_MESSAGING_DISABLED_MESSAGE)
    }
  })
})
