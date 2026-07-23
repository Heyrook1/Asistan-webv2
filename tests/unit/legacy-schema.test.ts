import { describe, expect, it } from 'vitest'

import {
  LEGACY_PUBLIC_TABLES_DROP_ORDER,
  LEGACY_SNAKE_RLS_TABLES,
  listLegacyPublicTables,
} from '@/lib/security/legacy-schema'
import { listRequiredRlsTableNames } from '@/lib/security/rls-inventory'

describe('legacy public schema inventory', () => {
  it('lists all snake_case prototype tables for drop', () => {
    expect(LEGACY_PUBLIC_TABLES_DROP_ORDER).toContain('providers')
    expect(LEGACY_PUBLIC_TABLES_DROP_ORDER).toContain('users')
    expect(LEGACY_PUBLIC_TABLES_DROP_ORDER).toContain('activity_logs')
    expect(LEGACY_PUBLIC_TABLES_DROP_ORDER).toContain('appointment_status_history')
    expect(listLegacyPublicTables().length).toBe(16)
  })

  it('keeps legacy tables out of required PascalCase RLS set', () => {
    const required = new Set(listRequiredRlsTableNames())
    for (const legacy of LEGACY_SNAKE_RLS_TABLES) {
      expect(required.has(legacy)).toBe(false)
    }
  })

  it('does not collide with live PascalCase Notification table name', () => {
    const required = listRequiredRlsTableNames()
    expect(required).toContain('Notification')
    expect(LEGACY_SNAKE_RLS_TABLES).toContain('notifications')
    expect(required).not.toContain('notifications')
  })
})
