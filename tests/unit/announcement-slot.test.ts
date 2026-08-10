import { describe, expect, it } from 'vitest'

import {
  getActiveAnnouncements,
  pickAnnouncementSlot,
  type DashboardAnnouncement,
} from '@/lib/announcements'

describe('announcement slot (banner density)', () => {
  it('returns at most one undismissed announcement', () => {
    const items: DashboardAnnouncement[] = [
      { id: 'a', title: 'A', body: 'one' },
      { id: 'b', title: 'B', body: 'two' },
    ]
    expect(pickAnnouncementSlot(items)?.id).toBe('a')
    expect(pickAnnouncementSlot(items, ['a'])?.id).toBe('b')
    expect(pickAnnouncementSlot(items, ['a', 'b'])).toBeNull()
  })

  it('hides expired catalog entries', () => {
    const active = getActiveAnnouncements(new Date('2027-01-15T00:00:00Z'))
    expect(active.every((item) => !item.endsAt || new Date(item.endsAt) >= new Date('2027-01-15'))).toBe(
      true,
    )
  })
})
