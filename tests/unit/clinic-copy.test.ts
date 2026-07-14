import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

import { ASCII_TR_SMELLS, CLINIC_COPY_PREFERENCES, preferClinicCopy } from '@/lib/brand/clinic-copy'

describe('lib/brand/clinic-copy', () => {
  it('maps jargon to clinic-friendly Turkish', () => {
    expect(preferClinicCopy('Multi-Branch + RLS Orkestrasyon')).toContain('Çok şubeli')
    expect(preferClinicCopy('Multi-Branch + RLS Orkestrasyon')).toContain('işletme bazlı veri ayrımı')
    expect(preferClinicCopy('Multi-Branch + RLS Orkestrasyon')).toContain('randevu düzeni')
    expect(CLINIC_COPY_PREFERENCES.length).toBeGreaterThan(5)
  })

  it('keeps core marketing pages free of common ASCII TR typos', () => {
    const roots = [
      path.join(process.cwd(), 'app/cozumler/page.tsx'),
      path.join(process.cwd(), 'app/cozumler/[industry]/page.tsx'),
      path.join(process.cwd(), 'app/urun/page.tsx'),
      path.join(process.cwd(), 'app/fiyatlandirma/page.tsx'),
      path.join(process.cwd(), 'components/marketing/pricing-page-sections.tsx'),
    ]
    for (const file of roots) {
      const source = readFileSync(file, 'utf8')
      for (const smell of ASCII_TR_SMELLS) {
        expect(source, `${file} matches ${smell}`).not.toMatch(smell)
      }
      expect(source).not.toMatch(/\bRLS\b/)
      expect(source).not.toMatch(/webhook/i)
      expect(source).not.toMatch(/tenant/i)
    }
  })
})
