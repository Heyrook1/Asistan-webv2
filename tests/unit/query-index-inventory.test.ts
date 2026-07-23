import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PRODUCTION_QUERY_INDEXES,
  PRODUCTION_QUERY_INDEX_MIGRATION,
} from '@/lib/security/query-index-inventory'

describe('production query indexes', () => {
  it('migration is wired into ensure-db-ready stack', () => {
    const stack = readFileSync(join(process.cwd(), 'scripts', 'lib', 'rls-stack.mjs'), 'utf8')
    expect(stack).toContain(PRODUCTION_QUERY_INDEX_MIGRATION)
  })

  it('migration SQL creates every confirmed index', () => {
    const sql = readFileSync(
      join(process.cwd(), 'supabase', 'migrations', PRODUCTION_QUERY_INDEX_MIGRATION),
      'utf8'
    )
    for (const name of PRODUCTION_QUERY_INDEXES) {
      expect(sql).toContain(`"${name}"`)
    }
    expect(sql).toMatch(/create extension if not exists pg_trgm/i)
  })

  it('prisma schema documents btree composites for appointment + patient + notification', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')
    expect(schema).toContain('@@index([businessId, staffId, date, status])')
    expect(schema).toContain('@@index([businessId, status, date, startTime])')
    expect(schema).toContain('@@index([businessId, isArchived, updatedAt])')
    expect(schema).toContain('@@index([businessId, personId])')
    expect(schema).toContain('@@index([businessId, userId, archivedAt, createdAt])')
    expect(schema).toContain('@@index([clientUserId, createdAt])')
  })
})
