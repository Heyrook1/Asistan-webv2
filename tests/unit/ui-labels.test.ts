import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  labelAllergySeverity,
  labelAuditSeverity,
  labelIdentityMatchMethod,
  labelIntakeFieldType,
  labelIntakeInviteStatus,
  labelInvoiceStatus,
  looksLikeUserFacingTechLeak,
} from '@/lib/ui-labels'

/** Clinic product surfaces that must not render raw enums / runbook jargon. */
const CLINIC_COPY_SURFACES = [
  'components/intake/intake-form-editor.tsx',
  'components/intake/intake-response-panel.tsx',
  'components/dashboard/clinic-invoices-board.tsx',
  'components/dashboard/analitik-deprecated-panel.tsx',
  'app/dashboard/kimlik-eslesmeleri/identity-match-board.tsx',
  'app/dashboard/denetim/page.tsx',
  'components/dashboard/support-mode-banner.tsx',
  'components/dashboard/patient-chart-tabs.tsx',
  'app/auth/error/page.tsx',
]

describe('ui labels (P1-07)', () => {
  it('maps allergy severity with Turkish characters', () => {
    expect(labelAllergySeverity('SIDDETLI')).toBe('Şiddetli')
    expect(labelAllergySeverity('HAFIF')).toBe('Hafif')
  })

  it('maps intake field types to clinic language', () => {
    expect(labelIntakeFieldType('TEXTAREA')).toBe('Uzun metin')
    expect(labelIntakeFieldType('CHECKBOX')).toBe('Onay kutusu')
    expect(labelIntakeFieldType('PHONE')).toBe('Telefon')
  })

  it('humanizes identity match methods', () => {
    expect(labelIdentityMatchMethod('suggest:weak-signal')).toBe('Zayıf sinyal önerisi')
    expect(labelIdentityMatchMethod('suggest:weak-signal|accept')).toContain('kabul')
  })

  it('maps invite / invoice / audit codes', () => {
    expect(labelIntakeInviteStatus('PENDING')).toBe('Bekliyor')
    expect(labelInvoiceStatus('READY')).toBe('Yazdırılabilir')
    expect(labelAuditSeverity('WARN')).toBe('Uyarı')
  })

  it('detects tech leak samples', () => {
    expect(looksLikeUserFacingTechLeak('suggest:weak-signal')).toBe(true)
    expect(looksLikeUserFacingTechLeak('READY yap')).toBe(true)
    expect(looksLikeUserFacingTechLeak('ASISTAN_FLAG_CLINIC_ANALYTICS=true')).toBe(true)
    expect(looksLikeUserFacingTechLeak('Zayıf sinyal önerisi')).toBe(false)
  })

  it('clinic surfaces do not expose raw enum / env runbook copy', () => {
    const root = process.cwd()
    for (const rel of CLINIC_COPY_SURFACES) {
      const text = readFileSync(join(root, rel), 'utf8')
      expect(text.includes('suggest:weak-signal'), rel).toBe(false)
      expect(text.includes('READY yap'), rel).toBe(false)
      expect(text.includes('Yazdırılabilir READY'), rel).toBe(false)
      expect(text.includes('ASISTAN_FLAG_'), rel).toBe(false)
      expect(text.includes('env ile'), rel).toBe(false)
      expect(text.includes('>{t}<'), rel).toBe(false)
      expect(/\n\s*\{t\}\s*\n/.test(text), `${rel} raw type option`).toBe(false)
      expect(text.includes('Placeholder'), rel).toBe(false)
      expect(text.includes('{match.method}'), rel).toBe(false)
      expect(text.includes('{invite.status}'), rel).toBe(false)
      expect(text.includes('{log.severity}'), rel).toBe(false)
      expect(text.includes('Support mode'), rel).toBe(false)
    }
  })
})
