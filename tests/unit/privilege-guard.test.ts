import { describe, expect, it } from 'vitest'

import {
  hostLooksLocal,
  postgresLooksLocal,
  requireElevatedOps,
} from '../../scripts/lib/privilege-guard.mjs'

describe('privilege-guard', () => {
  it('detects local hosts', () => {
    expect(hostLooksLocal('http://localhost:54321')).toBe(true)
    expect(hostLooksLocal('https://xyz.supabase.co')).toBe(false)
    expect(postgresLooksLocal('postgresql://postgres:x@localhost:5432/db')).toBe(true)
    expect(postgresLooksLocal('postgresql://postgres:x@db.abc.supabase.co:5432/db')).toBe(false)
  })

  it('allows local without confirm', () => {
    const exits: number[] = []
    const result = requireElevatedOps({
      script: 'unit',
      purpose: 'test',
      env: {
        SUPABASE_URL: 'http://127.0.0.1:54321',
        DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
      },
      argv: ['node', 'script.mjs'],
      exit: (code) => {
        exits.push(code)
      },
      log: () => {},
    })
    expect(result.ok).toBe(true)
    expect(exits).toEqual([])
  })

  it('refuses remote without confirm', () => {
    const exits: number[] = []
    const result = requireElevatedOps({
      script: 'unit',
      purpose: 'test',
      env: {
        SUPABASE_URL: 'https://abc.supabase.co',
        NODE_ENV: 'development',
      },
      argv: ['node', 'script.mjs'],
      exit: (code) => {
        exits.push(code)
      },
      log: () => {},
    })
    expect(result.ok).toBe(false)
    expect(exits).toEqual([1])
  })

  it('allows remote with --i-know-this-bypasses-rls', () => {
    const exits: number[] = []
    const result = requireElevatedOps({
      script: 'unit',
      purpose: 'test',
      env: {
        SUPABASE_URL: 'https://abc.supabase.co',
        ASISTAN_OPS_TARGET: 'production',
      },
      argv: ['node', 'script.mjs', '--i-know-this-bypasses-rls'],
      exit: (code) => {
        exits.push(code)
      },
      log: () => {},
    })
    expect(result.ok).toBe(true)
    expect(exits).toEqual([])
  })
})
