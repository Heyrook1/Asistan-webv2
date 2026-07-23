import { describe, expect, it } from 'vitest'

import {
  evaluateBundleBudgets,
  formatBytes,
  loadBundleBudgetConfig,
  parseRouteBundleStats,
} from '@/lib/ci/bundle-budget'

describe('bundle budget (I4)', () => {
  const config = loadBundleBudgetConfig({
    bundle: {
      statsPath: '.next/diagnostics/route-bundle-stats.json',
      routes: {
        '/': {
          maxFirstLoadUncompressedJsBytes: 1_000_000,
          maxFirstLoadGzipJsBytes: 300_000,
        },
        '/book/[slug]': {
          maxFirstLoadUncompressedJsBytes: 800_000,
        },
      },
      global: { maxAnyRouteUncompressedJsBytes: 1_500_000 },
    },
  })

  it('parses Next route-bundle-stats rows', () => {
    const stats = parseRouteBundleStats([
      {
        route: '/',
        firstLoadUncompressedJsBytes: 500_000,
        firstLoadChunkPaths: ['.next/static/chunks/a.js'],
      },
    ])
    expect(stats[0]?.route).toBe('/')
    expect(stats[0]?.firstLoadUncompressedJsBytes).toBe(500_000)
  })

  it('passes when under budget', () => {
    const violations = evaluateBundleBudgets({
      config,
      stats: [
        {
          route: '/',
          firstLoadUncompressedJsBytes: 900_000,
          firstLoadChunkPaths: [],
        },
        {
          route: '/book/[slug]',
          firstLoadUncompressedJsBytes: 700_000,
          firstLoadChunkPaths: [],
        },
      ],
      gzipByRoute: { '/': 250_000 },
    })
    expect(violations).toEqual([])
  })

  it('flags uncompressed, gzip, missing route, and global max', () => {
    const violations = evaluateBundleBudgets({
      config,
      stats: [
        {
          route: '/',
          firstLoadUncompressedJsBytes: 1_200_000,
          firstLoadChunkPaths: [],
        },
        {
          route: '/dashboard/analitik',
          firstLoadUncompressedJsBytes: 1_800_000,
          firstLoadChunkPaths: [],
        },
      ],
      gzipByRoute: { '/': 350_000 },
    })
    const kinds = violations.map((v) => v.kind).sort()
    expect(kinds).toEqual(['global-max', 'gzip', 'missing-route', 'uncompressed'])
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
  })
})
