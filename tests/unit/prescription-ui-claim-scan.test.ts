import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { looksLikeForbiddenClaim, looksLikeForbiddenEreceteUx } from '@/lib/brand/claim-bank'
import {
  FORBIDDEN_ERECETE_UX_SNIPPETS,
  prescriptionUiCopy,
} from '@/lib/prescriptions/ui-copy'

const UI_TARGETS = [
  'components/dashboard/prescription-form-drawer.tsx',
  'lib/actions/prescriptions.ts',
] as const

function extractQuotedStrings(source: string): string[] {
  const out: string[] = []
  const re = /(['"`])((?:\\.|(?!\1).)*)\1/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) != null) {
    out.push(match[2])
  }
  return out
}

describe('printable clinic Rx copy (BUG-006)', () => {
  it('uses klinik reçete success language — not E-reçete oluşturuldu', () => {
    expect(prescriptionUiCopy.createSuccess('RX-1')).toBe('Klinik reçete oluşturuldu (RX-1)')
    expect(prescriptionUiCopy.createTitle).toBe('Klinik reçete oluştur')
    expect(looksLikeForbiddenEreceteUx(prescriptionUiCopy.createSuccess('RX-1'))).toBe(false)
    expect(looksLikeForbiddenClaim('E-reçete oluşturuldu')).toBe(true)
    expect(looksLikeForbiddenEreceteUx('E-recete olusturuldu')).toBe(true)
  })

  it('allows honesty denials about official e-reçete networks', () => {
    expect(
      looksLikeForbiddenEreceteUx('Yazdırılabilir klinik reçete. Resmi e-reçete ağı entegrasyonu yoktur.')
    ).toBe(false)
  })

  it('claim-bank forbidden scan — prescription UI/actions have no e-reçete UX', () => {
    for (const rel of UI_TARGETS) {
      const src = readFileSync(join(process.cwd(), rel), 'utf8')
      for (const snippet of FORBIDDEN_ERECETE_UX_SNIPPETS) {
        expect(src, `${rel} must not contain ${snippet}`).not.toContain(snippet)
      }
      for (const lit of extractQuotedStrings(src)) {
        expect(looksLikeForbiddenEreceteUx(lit), `${rel}: "${lit}"`).toBe(false)
      }
    }
  })
})
