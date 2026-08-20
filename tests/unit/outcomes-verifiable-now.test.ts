import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Outcomes verifiable-now section', () => {
  it('shows the proof process without publishing unverified metrics', () => {
    const page = readFileSync(join(process.cwd(), 'app/sonuclar/page.tsx'), 'utf8')

    expect(page).toContain('Şu anda doğrulayabileceğiniz şeyler')
    expect(page).toContain('Pilot süreci')
    expect(page).toContain('Ölçüm yöntemi')
    expect(page).toContain('Erişim kontrolü')
    expect(page).toContain('Sonraki kanıt adımı')
    expect(page).not.toMatch(/90 günlük|60 günlük|45 günlük/)
  })
})
