import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Trust Center clinic assurances', () => {
  it('explains three immediate clinic outcomes before the technical control matrix', () => {
    const page = readFileSync(join(process.cwd(), 'app/guven/page.tsx'), 'utf8')
    const assurancesHeading = page.indexOf('Klinik için bugün ne anlama geliyor?')
    const matrixHeading = page.indexOf('Kontrol matrisi')

    expect(assurancesHeading).toBeGreaterThan(-1)
    expect(assurancesHeading).toBeLessThan(matrixHeading)
    expect(page).toContain('Hasta bilgileri klinik sınırları içinde kalır')
    expect(page).toContain('Ekip erişimi görevle sınırlanır')
    expect(page).toContain('Ne hazırsa açıkça görürsünüz')
  })
})
