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
] as const

describe('lib/brand/outcome-cases', () => {
  it('publishes exactly three process-pilot cards via public DTO', () => {
    const published = listPublicOutcomeCases()
    expect(published).toHaveLength(3)
    expect(listPublishedOutcomeCases()).toHaveLength(3)
  })

  it('keeps signed %/NPS template draft and unpublished', () => {
    expect(SIGNED_METRIC_CASE_TEMPLATE.status).toBe('draft')
    expect(SIGNED_METRIC_CASE_TEMPLATE.source).toBe('signed_pilot')
    expect(listAllOutcomeCases().some((c) => c.id === SIGNED_METRIC_CASE_TEMPLATE.id)).toBe(true)
    expect(getPublicOutcomeCaseById(SIGNED_METRIC_CASE_TEMPLATE.id)).toBeNull()
  })

  it('does not invent percentage no-show or NPS on published cards', () => {
    for (const item of listPublicOutcomeCases()) {
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

  it('resolves internal cases by id but public lookup rejects drafts', () => {
    expect(getOutcomeCaseById('kktc-dental-single-agenda')?.headline.tr).toContain('tek ajanda')
    expect(getOutcomeCaseById('missing')).toBeNull()
    expect(getOutcomeCaseById(SIGNED_METRIC_CASE_TEMPLATE.id)?.status).toBe('draft')
    expect(getPublicOutcomeCaseById(SIGNED_METRIC_CASE_TEMPLATE.id)).toBeNull()
  })

  it('public DTO omits status, source, and internal document keys', () => {
    const payload = JSON.stringify(listPublicOutcomeCases())
    expect(payload).not.toContain('"status"')
    expect(payload).not.toContain('"source"')
    expect(payload).not.toContain('kktc-')
    expect(payload).not.toContain('process_pilot')
    expect(payload).not.toContain('signed_pilot')
    expect(payload).not.toContain('draft')
    for (const marker of DRAFT_MARKERS) {
      expect(payload).not.toContain(marker)
    }
  })
})

describe('public /sonuclar surface', () => {
  it('page module does not import or render draft template markers', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/sonuclar/page.tsx'), 'utf8')
    expect(pageSource).not.toContain('SIGNED_METRIC_CASE_TEMPLATE')
    expect(pageSource).not.toContain('listPublishedOutcomeCases')
    expect(pageSource).not.toContain('listAllOutcomeCases')
    for (const marker of DRAFT_MARKERS) {
      expect(pageSource).not.toContain(marker)
    }
  })

  it('integration: public query serialization never includes draft result', () => {
    const publicRows = listPublicOutcomeCases()
    const serialized = JSON.stringify({
      cases: publicRows,
      disclaimer: {
        tr: 'Erken erişim kliniklerinde gözlemlediğimiz operasyonel değişimleri şeffaf biçimde paylaşıyoruz.',
      },
    })

    expect(publicRows.every((row) => row.iconKey !== 'generic')).toBe(true)
    expect(serialized).not.toMatch(/kktc-signed-noshow-template/i)
    expect(serialized).not.toMatch(/status\s*=\s*draft/i)
    expect(serialized).not.toMatch(/"status"\s*:\s*"draft"/i)
    expect(serialized).not.toContain('İmzalı metrik şablonu')
  })
})
