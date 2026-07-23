import { describe, expect, it } from 'vitest'

import {
  buildClinicHealthTimeline,
  buildPatientVisitTimeline,
  groupHealthTimelineByDay,
  toDayKey,
} from '@/lib/health-timeline'

describe('health timeline builders', () => {
  it('orders clinic items newest first and prefers entity dates', () => {
    const items = buildClinicHealthTimeline({
      appointments: [
        {
          id: 'a1',
          date: '2026-01-10T00:00:00.000Z',
          startTime: '09:00',
          status: 'COMPLETED',
          service: { name: 'Kontrol' },
          staff: { fullName: 'Dr. Ayşe' },
        },
      ],
      labResults: [
        {
          id: 'l1',
          title: 'Kan tahlili',
          resultDate: '2026-03-01T00:00:00.000Z',
          labName: 'Lab X',
        },
      ],
      medications: [
        {
          id: 'm1',
          name: 'İbuprofen',
          dosage: '400mg',
          startDate: '2026-02-15T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          active: true,
        },
      ],
      timeline: [
        {
          id: 't1',
          type: 'APPOINTMENT_COMPLETED',
          title: 'Randevu tamamlandı',
          createdAt: '2026-01-10T12:00:00.000Z',
        },
        {
          id: 't2',
          type: 'LAB_RESULT_ADDED',
          title: 'Tahlil eklendi',
          createdAt: '2026-03-01T08:00:00.000Z',
        },
        {
          id: 't3',
          type: 'PATIENT_UPDATED',
          title: 'Hasta güncellendi',
          createdAt: '2026-01-05T00:00:00.000Z',
        },
      ],
    })

    expect(items.map((i) => i.id)).toEqual([
      'lab:l1',
      'medication:m1',
      'visit:a1',
      'activity:t3',
    ])
    expect(items.find((i) => i.kind === 'visit')?.title).toBe('Kontrol')
  })

  it('respects note/file permission filters', () => {
    const items = buildClinicHealthTimeline({
      includeNotes: false,
      includeFiles: false,
      notes: [{ id: 'n1', title: 'Gizli not', createdAt: '2026-04-01T00:00:00.000Z' }],
      files: [
        {
          id: 'f1',
          fileName: 'scan.pdf',
          category: 'REPORT',
          uploadedAt: '2026-04-02T00:00:00.000Z',
        },
      ],
      timeline: [
        {
          id: 'tn',
          type: 'NOTE_ADDED',
          title: 'Not',
          createdAt: '2026-04-01T00:00:00.000Z',
        },
      ],
    })
    expect(items).toHaveLength(0)
  })

  it('builds patient visit timeline without chart PHI', () => {
    const items = buildPatientVisitTimeline([
      {
        id: 'v1',
        date: '2026-05-01',
        startTime: '14:30',
        status: 'CONFIRMED',
        clinic: { name: 'Lefkoşa Klinik' },
        service: { name: 'Diş temizliği' },
        doctor: { fullName: 'Dr. Ali', specialty: 'Diş' },
      },
      {
        id: 'v2',
        date: '2026-04-01',
        startTime: '10:00',
        status: 'COMPLETED',
        clinic: { name: 'Girne Klinik' },
        service: { name: 'Kontrol' },
      },
    ])

    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('visit:v1')
    expect(items[0].clinicName).toBe('Lefkoşa Klinik')
    expect(items.every((i) => i.kind === 'visit')).toBe(true)
  })

  it('groups by day with newest day first', () => {
    const groups = groupHealthTimelineByDay([
      {
        id: '1',
        kind: 'visit',
        occurredAt: '2026-01-02T10:00:00.000Z',
        title: 'A',
      },
      {
        id: '2',
        kind: 'lab',
        occurredAt: '2026-01-03T08:00:00.000Z',
        title: 'B',
      },
      {
        id: '3',
        kind: 'visit',
        occurredAt: '2026-01-02T15:00:00.000Z',
        title: 'C',
      },
    ])

    expect(groups.map((g) => g.dayKey)).toEqual([
      toDayKey('2026-01-03T08:00:00.000Z'),
      toDayKey('2026-01-02T10:00:00.000Z'),
    ])
    expect(groups[1].items.map((i) => i.id)).toEqual(['3', '1'])
  })

  it('returns empty groups for empty input', () => {
    expect(buildClinicHealthTimeline({})).toEqual([])
    expect(buildPatientVisitTimeline([])).toEqual([])
    expect(groupHealthTimelineByDay([])).toEqual([])
  })
})
