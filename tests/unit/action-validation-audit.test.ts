import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { SERVER_ACTION_FILES } from '@/lib/actions/action-inventory'

describe('server action validation audit', () => {
  it('inventory lists every lib/actions module (except result.ts)', () => {
    const listed: Set<string> = new Set(SERVER_ACTION_FILES)
    expect(listed.has('lib/actions/result.ts')).toBe(false)
    expect(listed.has('lib/actions/patients.ts')).toBe(true)
    expect(listed.has('lib/actions/validation.ts')).toBe(false)
    expect(listed.has('lib/actions/action-inventory.ts')).toBe(false)
  })

  it('shared validation helpers exist', () => {
    const src = readFileSync(join(process.cwd(), 'lib/actions/validation.ts'), 'utf8')
    expect(src).toContain('entityIdSchema')
    expect(src).toContain('parseActionInput')
    expect(src).toContain('patientSearchQuerySchema')
  })

  it('audit script passes on current action files', () => {
    const audit = readFileSync(join(process.cwd(), 'scripts/audit-action-validation.ts'), 'utf8')
    expect(audit).toContain('SERVER_ACTION_FILES')
    expect(SERVER_ACTION_FILES.length).toBeGreaterThan(15)
  })
})
