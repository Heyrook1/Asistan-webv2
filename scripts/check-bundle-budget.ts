/**
 * I4 — fail CI when Next first-load JS budgets are exceeded.
 *
 * Reads `.next/diagnostics/route-bundle-stats.json` (produced by `pnpm build`)
 * and `config/ci-budgets.json`.
 *
 *   pnpm check:bundle-budget
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  evaluateBundleBudgets,
  formatBytes,
  loadBundleBudgetConfig,
  parseRouteBundleStats,
  sumGzipChunkBytes,
} from '../lib/ci/bundle-budget'

function main() {
  const root = process.cwd()
  const budgetPath = resolve(root, 'config/ci-budgets.json')
  if (!existsSync(budgetPath)) {
    console.error(`FAIL: missing ${budgetPath}`)
    process.exit(1)
  }

  const config = loadBundleBudgetConfig(
    JSON.parse(readFileSync(budgetPath, 'utf8'))
  )
  const statsPath = resolve(root, config.statsPath)
  if (!existsSync(statsPath)) {
    console.error(
      `FAIL: missing ${statsPath} — run \`pnpm build\` first (Next diagnostics).`
    )
    process.exit(1)
  }

  const stats = parseRouteBundleStats(
    JSON.parse(readFileSync(statsPath, 'utf8'))
  )

  const gzipByRoute: Record<string, number> = {}
  for (const route of Object.keys(config.routes)) {
    const row = stats.find((s) => s.route === route)
    if (!row) continue
    gzipByRoute[route] = sumGzipChunkBytes(row.firstLoadChunkPaths)
  }

  console.log('Bundle budget check (I4)')
  for (const route of Object.keys(config.routes)) {
    const row = stats.find((s) => s.route === route)
    if (!row) {
      console.log(`  ${route}: MISSING`)
      continue
    }
    const gzip = gzipByRoute[route] ?? 0
    console.log(
      `  ${route}: uncompressed ${formatBytes(row.firstLoadUncompressedJsBytes)} · gzip≈${formatBytes(gzip)}`
    )
  }

  const violations = evaluateBundleBudgets({ config, stats, gzipByRoute })
  if (violations.length === 0) {
    console.log('PASS: all route budgets within limits')
    process.exit(0)
  }

  console.error('\nFAIL: budget violations')
  for (const v of violations) {
    console.error(
      `  ${v.route} [${v.kind}] actual=${formatBytes(v.actual)} max=${formatBytes(v.max)}${v.detail ? ` — ${v.detail}` : ''}`
    )
  }
  process.exit(1)
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
