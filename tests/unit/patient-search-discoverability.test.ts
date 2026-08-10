import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('patient search discoverability (P1-10)', () => {
  it('patients list toolbar debounces and exposes a visible Ara action', () => {
    const src = readFileSync(join(process.cwd(), 'app/dashboard/hastalar/patients-toolbar.tsx'), 'utf8')
    const debounce = src.match(/SEARCH_DEBOUNCE_MS\s*=\s*(\d+)/)
    expect(debounce, 'debounce constant').toBeTruthy()
    const ms = Number(debounce![1])
    expect(ms).toBeGreaterThanOrEqual(250)
    expect(ms).toBeLessThanOrEqual(350)
    expect(src).toContain('scheduleQuery')
    expect(src).toMatch(/>\s*Ara\s*</)
    expect(src).toContain('role="search"')
    expect(src).toContain('enterKeyHint="search"')
  })

  it('header patient search uses debounce in the 250–350ms band', () => {
    const src = readFileSync(join(process.cwd(), 'components/dashboard/patient-search.tsx'), 'utf8')
    const debounce = src.match(/SEARCH_DEBOUNCE_MS\s*=\s*(\d+)/)
    expect(debounce).toBeTruthy()
    const ms = Number(debounce![1])
    expect(ms).toBeGreaterThanOrEqual(250)
    expect(ms).toBeLessThanOrEqual(350)
  })
})
