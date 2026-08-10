import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  OUTCOME_CASES,
  SIGNED_METRIC_CASE_TEMPLATE,
  getOutcomeCaseById,
  getPublicOutcomeCaseById,
  listAllOutcomeCases,
  listPublicOutcomeCases,
  listPublishedOutcomeCases,
} from '@/lib/brand/outcome-cases'

const DRAFT_MARKERS = [
  'kktc-signed-noshow-template',
  'status=draft',
  'status":"draft"',
  '"status":"draft"',
  'İmzalı metrik şablonu',
  'Innovation pillar',
  '90 günlük',
  '60 günlük',
  '45 günlük',
] as const

describe('lib/brand/outcome-cases', () => {
  it('publishes zero invented process-pilot cards until proof gate opens', () => {
    expect(listPublicOutcomeCases()).toHaveLength(0)
    expect(listPublishedOutcomeCases()).toHaveLength(0)
    expect(OUTCOME_CASES.every((item) => item.status === 'draft')).toBe(true)
  })

  it('keeps signed %/NPS template draft and unpublished', () => {
    expect(SIGNED_METRIC_CASE_TEMPLATE.status).toBe('draft')
    expect(SIGNED_METRIC_CASE_TEMPLATE.source).toBe('signed_pilot')
    expect(listAllOutcomeCases().some((c) => c.id === SIGNED_METRIC_CASE_TEMPLATE.id)).toBe(true)
    expect(getPublicOutcomeCaseById(SIGNED_METRIC_CASE_TEMPLATE.id)).toBeNull()
  })

  it('stores process drafts internally without public duration claims', () => {
    for (const item of OUTCOME_CASES) {
      expect(item.status).toBe('draft')
      expect(item.source).toBe('process_pilot')
    }
  })

  it('uses anonymized clinic types — no trade-name endorsements', () => {
    for (const item of OUTCOME_CASES) {
      expect(item.clinicType.tr.toLowerCase()).not.toMatch(/dişçim|klinik adı|dr\./)
      expect(item.region.tr.toLowerCase()).toContain('anonim')
    }
  })

  it('resolves internal cases by id but public lookup rejects drafts', () => {
    expect(getOutcomeCaseById('kktc-dental-single-agenda')?.headline.tr).toContain('tek ajanda')
    expect(getOutcomeCaseById('missing')).toBeNull()
    expect(getPublicOutcomeCaseById('kktc-dental-single-agenda')).toBeNull()
    expect(getPublicOutcomeCaseById(SIGNED_METRIC_CASE_TEMPLATE.id)).toBeNull()
  })

  it('public DTO omits status, source, internal keys, and duration claims', () => {
    const payload = JSON.stringify(listPublicOutcomeCases())
    expect(payload).toBe('[]')
    for (const marker of DRAFT_MARKERS) {
      expect(payload).not.toContain(marker)
    }
  })
})

describe('public /sonuclar surface', () => {
  it('page module does not import or render draft template markers', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/sonuclar/page.tsx'), 'utf8')
    expect(pageSource).not.toContain('SIGNED_METRIC_CASE_TEMPLATE')
    expect(pageSource).not.toContain('listAllOutcomeCases')
    expect(pageSource).not.toContain('Innovation pillar')
    expect(pageSource).not.toContain('90 günlük')
    expect(pageSource).not.toContain('60 günlük')
    expect(pageSource).not.toContain('45 günlük')
  })

  it('integration: public query serialization never includes draft result', () => {
    const publicRows = listPublicOutcomeCases()
    const serialized = JSON.stringify({ cases: publicRows })

    expect(publicRows).toHaveLength(0)
    expect(serialized).not.toMatch(/kktc-signed-noshow-template/i)
    expect(serialized).not.toMatch(/90 günlük|60 günlük|45 günlük/)
    expect(serialized).not.toMatch(/status\s*=\s*draft/i)
  })
})
