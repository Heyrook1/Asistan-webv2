#!/usr/bin/env node
/**
 * Fail when a server action file lacks Zod or an exported action skips validation.
 *
 * Rule: every `export async function` in action files must either
 *  - take no user input (allowlisted), or
 *  - call `.safeParse(` / `parseActionInput` / `parseEntityId` before `prisma.`
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  SERVER_ACTION_FILES,
  SERVER_ACTION_NO_INPUT,
} from '../lib/actions/action-inventory'

const ROOT = process.cwd()
const EXPORT_FN = /export async function (\w+)\s*\([^)]*\)\s*\{/g
const HAS_ZOD_IMPORT =
  /from ['"]zod['"]|from ['"]@\/lib\/actions\/validation['"]|from ['"]\.\/validation['"]/
const VALIDATES =
  /\.safeParse\s*\(|parseActionInput\s*\(|parseEntityId\s*\(|entityIdSchema\.safeParse|patientSearchQuerySchema\.safeParse|paletteSearchQuerySchema\.safeParse|emailInputSchema\.safeParse/

function sliceFunctionBody(source: string, openBraceIndex: number) {
  let depth = 0
  for (let i = openBraceIndex; i < source.length; i++) {
    const ch = source[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return source.slice(openBraceIndex, i + 1)
    }
  }
  return source.slice(openBraceIndex)
}

function auditFile(relPath: string) {
  const abs = join(ROOT, relPath)
  const source = readFileSync(abs, 'utf8')
  const errors: string[] = []

  if (!HAS_ZOD_IMPORT.test(source)) {
    errors.push(`${relPath}: missing zod import`)
  }

  for (const match of source.matchAll(EXPORT_FN)) {
    const name = match[1]
    const bodyStart = match.index! + match[0].length - 1
    const body = sliceFunctionBody(source, bodyStart)
    const beforeDb = body.split(/\bprisma\./)[0] ?? body

    if (SERVER_ACTION_NO_INPUT.has(name)) continue

    if (!VALIDATES.test(beforeDb)) {
      errors.push(`${relPath}::${name}: no Zod validation before database access`)
    }
  }

  return errors
}

const allErrors = SERVER_ACTION_FILES.flatMap(auditFile)
if (allErrors.length > 0) {
  console.error('Server action validation audit FAILED:\n')
  for (const line of allErrors) console.error(`  - ${line}`)
  process.exit(1)
}

console.log(`OK — ${SERVER_ACTION_FILES.length} server action files validated`)
