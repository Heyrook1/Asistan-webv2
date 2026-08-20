import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import { noStore, apiSuccess } from '@/lib/api-response'
import { PERSON_DOCUMENT_SIGNED_URL_TTL_SECONDS } from '@/lib/storage-constants'
import { TENANT_SCOPED_MODELS } from '@/lib/security/tenant-guard'
import { RLS_DENY_POSTGREST_TABLES, RLS_BUSINESS_ID_SCOPED_TABLES } from '@/lib/security/rls-policy-inventory'
import { emitHealthRecordEvent } from '@/lib/client-marketplace/health-records/events'
import { log } from '@/lib/observability/logger'

function walkTs(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkTs(full))
    else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) out.push(full)
  }
  return out
}

describe('health-record caching', () => {
  it('noStore sets private, uncacheable headers', async () => {
    const response = noStore(apiSuccess({ ok: true }))
    expect(response.headers.get('Cache-Control')).toMatch(/no-store/)
    expect(response.headers.get('Pragma')).toBe('no-cache')
  })

  it('every /api/client/health route is force-dynamic and uses noStore', () => {
    const root = join(process.cwd(), 'app', 'api', 'client', 'health')
    const files = walkTs(root).filter((f) => f.endsWith('route.ts'))
    expect(files.length).toBeGreaterThan(5)
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      expect(src, file).toContain("export const dynamic = 'force-dynamic'")
      expect(src, file).toContain('noStore')
    }
  })

  it('passport route is uncached once it carries health counts', () => {
    const src = readFileSync(join(process.cwd(), 'app', 'api', 'client', 'passport', 'route.ts'), 'utf8')
    expect(src).toContain("export const dynamic = 'force-dynamic'")
    expect(src).toContain('noStore')
  })
})

describe('health-record PHI logging', () => {
  it('service + route files never log names, titles, notes, or storage keys', () => {
    const roots = [
      join(process.cwd(), 'lib', 'client-marketplace', 'health-records'),
      join(process.cwd(), 'app', 'api', 'client', 'health'),
      join(process.cwd(), 'lib', 'storage', 'documents-storage.ts'),
    ]
    const files = roots.flatMap((root) => {
      const st = statSync(root)
      return st.isDirectory() ? walkTs(root) : [root]
    })
    const logPhi = /console\.(log|warn|error|info)\([\s\S]{0,200}\b(storageKey|fullName|notes|title)\b/
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      expect(src, file).not.toMatch(logPhi)
    }
  })

  it('emits safe mutation events with ids/status only', () => {
    const spy = vi.spyOn(log, 'info').mockImplementation(() => undefined)
    emitHealthRecordEvent('medication_created', { id: 'med-1', status: 'ACTIVE' })
    expect(spy).toHaveBeenCalledWith('medication_created', { id: 'med-1', status: 'ACTIVE' })
    const payload = spy.mock.calls[0]?.[1] as Record<string, unknown>
    expect(payload).not.toHaveProperty('name')
    expect(payload).not.toHaveProperty('title')
    expect(payload).not.toHaveProperty('notes')
    spy.mockRestore()
  })
})

describe('document signed-URL TTL', () => {
  it('is short-lived (5 minutes)', () => {
    expect(PERSON_DOCUMENT_SIGNED_URL_TTL_SECONDS).toBe(60 * 5)
  })
})

describe('person health records are not clinic-tenant models', () => {
  it('are excluded from TENANT_SCOPED_MODELS (person GUC, not businessId)', () => {
    expect(TENANT_SCOPED_MODELS.has('PersonMedication')).toBe(false)
    expect(TENANT_SCOPED_MODELS.has('PersonAllergy')).toBe(false)
    expect(TENANT_SCOPED_MODELS.has('PersonDocument')).toBe(false)
  })

  it('are classified as PostgREST-deny (not business-scoped PHI tables)', () => {
    expect(RLS_DENY_POSTGREST_TABLES).toEqual(
      expect.arrayContaining(['PersonMedication', 'PersonAllergy', 'PersonDocument'])
    )
    expect(RLS_BUSINESS_ID_SCOPED_TABLES).not.toContain('PersonMedication')
    expect(RLS_BUSINESS_ID_SCOPED_TABLES).not.toContain('PersonDocument')
  })
})
