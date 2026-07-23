import { describe, expect, it } from 'vitest'

import {
  OUTCOME_CASES,
  SIGNED_METRIC_CASE_TEMPLATE,
  getOutcomeCaseById,
  listPublishedOutcomeCases,
} from '@/lib/brand/outcome-cases'

describe('lib/brand/outcome-cases', () => {
  it('publishes exactly three process-pilot cards', () => {
    const published = listPublishedOutcomeCases()
    expect(published).toHaveLength(3)
    expect(published.every((item) => item.status === 'published')).toBe(true)
    expect(published.every((item) => item.source === 'process_pilot')).toBe(true)
  })

  it('keeps signed %/NPS template draft and unpublished', () => {
    expect(SIGNED_METRIC_CASE_TEMPLATE.status).toBe('draft')
    expect(SIGNED_METRIC_CASE_TEMPLATE.source).toBe('signed_pilot')
    expect(listPublishedOutcomeCases().find((c) => c.id === SIGNED_METRIC_CASE_TEMPLATE.id)).toBeUndefined()
  })

  it('does not invent percentage no-show or NPS on published cards', () => {
    for (const item of listPublishedOutcomeCases()) {
      for (const metric of item.metrics) {
        expect(metric.before).not.toMatch(/%\d/)
        expect(metric.after).not.toMatch(/%\d/)
        expect(metric.label.tr.toLowerCase()).not.toContain('nps')
      }
    }
  })

  it('uses anonymized clinic types — no trade-name endorsements', () => {
    for (const item of OUTCOME_CASES) {
      expect(item.clinicType.tr.toLowerCase()).not.toMatch(/dişçim|klinik adı|dr\./)
      expect(item.region.tr.toLowerCase()).toContain('anonim')
      expect(item.sourceLabel.tr.toLowerCase()).toMatch(/anonim|imzalı/)
    }
  })

  it('resolves cases by id', () => {
    expect(getOutcomeCaseById('kktc-dental-single-agenda')?.headline.tr).toContain('tek ajanda')
    expect(getOutcomeCaseById('missing')).toBeNull()
  })
})
