/**
 * I4 — Lighthouse floors for public surfaces (a11y / BP / SEO hard; performance warn).
 *
 * Requires a running server (default http://127.0.0.1:3000) and Chromium.
 * Uses the `lighthouse` CLI (v12, Node 20) to avoid TS/runtime coupling.
 *
 *   pnpm start &
 *   pnpm check:lighthouse
 *
 * Env:
 *   LH_BASE_URL          default http://127.0.0.1:3000
 *   LH_CHROME_PATH       optional Chrome/Chromium binary
 *   LH_SKIP_PERFORMANCE  if "1", ignore performance warn floor
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

type LighthouseBudget = {
  urls: string[]
  minScores: Record<string, number>
  warnScores?: Record<string, number>
  maxScriptTransferBytes?: number
}

type CiBudgets = {
  lighthouse: LighthouseBudget
}

type Lhr = {
  categories?: Record<string, { score: number | null } | undefined>
  audits?: Record<
    string,
    {
      details?: {
        items?: Array<{ resourceType?: string; transferSize?: number }>
      }
    }
  >
}

type Finding = {
  url: string
  level: 'error' | 'warn'
  message: string
}

function runLighthouseCli(url: string, outPath: string): Lhr {
  const chromeFlags = '--headless --no-sandbox --disable-gpu'
  const args = [
    'exec',
    'lighthouse',
    url,
    '--quiet',
    '--chrome-flags=' + chromeFlags,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json',
    `--output-path=${outPath}`,
  ]

  const env = { ...process.env }
  if (process.env.LH_CHROME_PATH) {
    env.CHROME_PATH = process.env.LH_CHROME_PATH
  }

  const result = spawnSync('pnpm', args, {
    env,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 20 * 1024 * 1024,
  })

  if (result.status !== 0) {
    throw new Error(
      `lighthouse CLI failed (${result.status}): ${result.stderr || result.stdout || 'no output'}`
    )
  }
  if (!existsSync(outPath)) {
    throw new Error(`lighthouse did not write ${outPath}`)
  }
  return JSON.parse(readFileSync(outPath, 'utf8')) as Lhr
}

function main() {
  const root = process.cwd()
  const budgetPath = resolve(root, 'config/ci-budgets.json')
  if (!existsSync(budgetPath)) {
    console.error(`FAIL: missing ${budgetPath}`)
    process.exit(1)
  }

  const budgets = JSON.parse(readFileSync(budgetPath, 'utf8')) as CiBudgets
  const lh = budgets.lighthouse
  if (!lh?.urls?.length) {
    console.error('FAIL: config/ci-budgets.json lighthouse.urls empty')
    process.exit(1)
  }

  const base = (process.env.LH_BASE_URL ?? 'http://127.0.0.1:3000').replace(
    /\/$/,
    ''
  )
  const outDir = resolve(root, '.lighthouseci')
  mkdirSync(outDir, { recursive: true })

  const findings: Finding[] = []

  for (const path of lh.urls) {
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
    const outPath = resolve(
      outDir,
      `lhr${path.replace(/\W+/g, '_') || '_root'}.json`
    )
    if (existsSync(outPath)) rmSync(outPath)

    console.log(`\nLighthouse → ${url}`)
    const lhr = runLighthouseCli(url, outPath)

    for (const [cat, min] of Object.entries(lh.minScores ?? {})) {
      const score = lhr.categories?.[cat]?.score
      if (score == null) {
        findings.push({
          url,
          level: 'error',
          message: `category ${cat} missing`,
        })
        continue
      }
      const pct = Math.round(score * 100)
      console.log(`  ${cat}: ${pct}`)
      if (score < min) {
        findings.push({
          url,
          level: 'error',
          message: `${cat} score ${pct} < min ${Math.round(min * 100)}`,
        })
      }
    }

    if (process.env.LH_SKIP_PERFORMANCE !== '1') {
      for (const [cat, min] of Object.entries(lh.warnScores ?? {})) {
        const score = lhr.categories?.[cat]?.score
        if (score == null) continue
        const pct = Math.round(score * 100)
        console.log(`  ${cat} (warn floor): ${pct}`)
        if (score < min) {
          findings.push({
            url,
            level: 'warn',
            message: `${cat} score ${pct} < warn floor ${Math.round(min * 100)}`,
          })
        }
      }
    }

    const maxScript = lh.maxScriptTransferBytes
    if (maxScript != null) {
      const details = lhr.audits?.['resource-summary']?.details
      const scriptItem = details?.items?.find((i) => i.resourceType === 'script')
      const transfer = scriptItem?.transferSize ?? 0
      console.log(`  script transfer: ${transfer} B (max ${maxScript})`)
      if (transfer > maxScript) {
        findings.push({
          url,
          level: 'error',
          message: `script transfer ${transfer} > max ${maxScript}`,
        })
      }
    }
  }

  const errors = findings.filter((f) => f.level === 'error')
  const warns = findings.filter((f) => f.level === 'warn')

  for (const w of warns) {
    console.warn(`WARN ${w.url}: ${w.message}`)
  }

  if (errors.length > 0) {
    console.error('\nFAIL: Lighthouse hard floors')
    for (const e of errors) {
      console.error(`  ${e.url}: ${e.message}`)
    }
    process.exit(1)
  }

  console.log('\nPASS: Lighthouse hard floors met')
  if (warns.length) {
    console.log(`(${warns.length} performance warn(s) — non-blocking)`)
  }
  process.exit(0)
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
