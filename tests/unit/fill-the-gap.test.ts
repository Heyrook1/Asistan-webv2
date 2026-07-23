import { describe, expect, it } from 'vitest'

import { buildFillGapCopy, clustersForDate } from '@/lib/ops/fill-the-gap-copy'

describe('fill-the-gap copy', () => {
  it('returns null headline when there are no clusters', () => {
    const copy = buildFillGapCopy({ clusters: [], patientCount: 0 })
    expect(copy.headline).toBeNull()
    expect(copy.detail).toBeNull()
  })

  it('builds honest ops copy without inventing fill percentages', () => {
    const copy = buildFillGapCopy({
      clusters: [
        {
          date: '2026-07-21',
          weekdayLabel: 'Salı',
          doctorId: 'd1',
          doctorName: 'Dr. Ayşe',
          serviceId: 's1',
          serviceName: 'Kontrol',
          slotCount: 3,
          sampleTimes: ['14:00', '14:30', '15:00'],
        },
      ],
      patientCount: 12,
    })

    expect(copy.headline).toBe('Salı 14:00–15:00 saatinde 3 boş slot')
    expect(copy.detail).toContain('Dr. Ayşe · Kontrol')
    expect(copy.detail).toContain('12 dönen hastaya')
    expect(copy.detail).toContain('bekleme listesi')
    expect(copy.detail).not.toMatch(/\d+\s*%/)
    expect(copy.ajandaHref).toContain('date=2026-07-21')
  })

  it('filters clusters by day', () => {
    const rows = clustersForDate(
      [
        {
          date: '2026-07-21',
          weekdayLabel: 'Salı',
          doctorId: 'd1',
          doctorName: 'Dr. A',
          serviceId: 's1',
          serviceName: 'Kontrol',
          slotCount: 2,
          sampleTimes: ['14:00'],
        },
        {
          date: '2026-07-22',
          weekdayLabel: 'Çarşamba',
          doctorId: 'd1',
          doctorName: 'Dr. A',
          serviceId: 's1',
          serviceName: 'Kontrol',
          slotCount: 1,
          sampleTimes: ['10:00'],
        },
      ],
      '2026-07-21'
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].slotCount).toBe(2)
  })
})
