import { gzipSync } from 'node:zlib'
import { readFileSync, existsSync } from 'node:fs'

export type RouteBudget = {
  maxFirstLoadUncompressedJsBytes?: number
  maxFirstLoadGzipJsBytes?: number
}

export type BundleBudgetConfig = {
  statsPath: string
  routes: Record<string, RouteBudget>
  global?: { maxAnyRouteUncompressedJsBytes?: number }
}

export type RouteBundleStat = {
  route: string
  firstLoadUncompressedJsBytes: number
  firstLoadChunkPaths: string[]
}

export type BudgetViolation = {
  route: string
  kind: 'uncompressed' | 'gzip' | 'global-max' | 'missing-route'
  actual: number
  max: number
  detail?: string
}

export function loadBundleBudgetConfig(raw: unknown): BundleBudgetConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('ci-budgets.json: invalid root')
  }
  const bundle = (raw as { bundle?: unknown }).bundle
  if (!bundle || typeof bundle !== 'object') {
    throw new Error('ci-budgets.json: missing bundle')
  }
  const b = bundle as BundleBudgetConfig
  if (!b.statsPath || !b.routes || typeof b.routes !== 'object') {
    throw new Error('ci-budgets.json: bundle.statsPath / routes required')
  }
  return b
}

export function parseRouteBundleStats(raw: unknown): RouteBundleStat[] {
  if (!Array.isArray(raw)) {
    throw new Error('route-bundle-stats.json must be an array')
  }
  return raw.map((row, i) => {
    if (!row || typeof row !== 'object') {
      throw new Error(`route-bundle-stats[${i}] invalid`)
    }
    const r = row as Record<string, unknown>
    if (typeof r.route !== 'string') {
      throw new Error(`route-bundle-stats[${i}].route missing`)
    }
    const bytes = Number(r.firstLoadUncompressedJsBytes)
    if (!Number.isFinite(bytes) || bytes < 0) {
      throw new Error(`route-bundle-stats[${i}].firstLoadUncompressedJsBytes invalid`)
    }
    const paths = Array.isArray(r.firstLoadChunkPaths)
      ? r.firstLoadChunkPaths.filter((p): p is string => typeof p === 'string')
      : []
    return {
      route: r.route,
      firstLoadUncompressedJsBytes: bytes,
      firstLoadChunkPaths: paths,
    }
  })
}

/** Gzip size of chunk files (sum of per-file gzip). */
export function sumGzipChunkBytes(chunkPaths: string[]): number {
  let total = 0
  for (const rel of chunkPaths) {
    const path = rel.replace(/\\/g, '/')
    if (!existsSync(path)) continue
    const buf = readFileSync(path)
    total += gzipSync(buf, { level: 9 }).length
  }
  return total
}

export function evaluateBundleBudgets(opts: {
  config: BundleBudgetConfig
  stats: RouteBundleStat[]
  gzipByRoute?: Record<string, number>
}): BudgetViolation[] {
  const { config, stats, gzipByRoute = {} } = opts
  const byRoute = new Map(stats.map((s) => [s.route, s]))
  const violations: BudgetViolation[] = []

  for (const [route, budget] of Object.entries(config.routes)) {
    const row = byRoute.get(route)
    if (!row) {
      violations.push({
        route,
        kind: 'missing-route',
        actual: 0,
        max: 0,
        detail: 'route missing from Next diagnostics — rebuild before check',
      })
      continue
    }
    if (
      budget.maxFirstLoadUncompressedJsBytes != null &&
      row.firstLoadUncompressedJsBytes > budget.maxFirstLoadUncompressedJsBytes
    ) {
      violations.push({
        route,
        kind: 'uncompressed',
        actual: row.firstLoadUncompressedJsBytes,
        max: budget.maxFirstLoadUncompressedJsBytes,
      })
    }
    const gzip = gzipByRoute[route]
    if (
      gzip != null &&
      budget.maxFirstLoadGzipJsBytes != null &&
      gzip > budget.maxFirstLoadGzipJsBytes
    ) {
      violations.push({
        route,
        kind: 'gzip',
        actual: gzip,
        max: budget.maxFirstLoadGzipJsBytes,
      })
    }
  }

  const globalMax = config.global?.maxAnyRouteUncompressedJsBytes
  if (globalMax != null) {
    for (const row of stats) {
      if (row.firstLoadUncompressedJsBytes > globalMax) {
        violations.push({
          route: row.route,
          kind: 'global-max',
          actual: row.firstLoadUncompressedJsBytes,
          max: globalMax,
        })
      }
    }
  }

  return violations
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}
