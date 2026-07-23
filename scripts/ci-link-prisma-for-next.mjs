/**
 * Next 16 Turbopack externalizes Prisma into `.next/node_modules/@prisma/client-*`
 * stubs that `require('.prisma/client/default')`. After downloading a `.next`
 * artifact onto a fresh runner, link the generated client where those stubs resolve.
 *
 *   pnpm db:generate && node scripts/ci-link-prisma-for-next.mjs
 */
import { existsSync, mkdirSync, rmSync, symlinkSync, realpathSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function findPrismaClientDir(dir, depth = 0) {
  if (depth > 12 || !existsSync(dir)) return null
  const marker = join(dir, 'default.js')
  if (existsSync(marker) && dir.replace(/\\/g, '/').includes('/.prisma/client')) {
    return dir
  }
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return null
  }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue
    if (ent.name === '.bin' || ent.name === 'next' || ent.name === '.cache') continue
    const hit = findPrismaClientDir(join(dir, ent.name), depth + 1)
    if (hit) return hit
  }
  return null
}

function ensureSymlink(linkPath, targetPath) {
  mkdirSync(dirname(linkPath), { recursive: true })
  if (existsSync(linkPath)) rmSync(linkPath, { recursive: true, force: true })
  const rel = relative(dirname(linkPath), targetPath)
  symlinkSync(rel || targetPath, linkPath)
  console.log(`linked ${linkPath} → ${rel}`)
}

const topLevel = join(root, 'node_modules', '.prisma', 'client')
let clientDir =
  existsSync(join(topLevel, 'default.js')) || existsSync(join(topLevel, 'index.js'))
    ? realpathSync(topLevel)
    : null

if (!clientDir) {
  const found = findPrismaClientDir(join(root, 'node_modules'))
  clientDir = found ? realpathSync(found) : null
}

if (!clientDir) {
  console.error('FAIL: could not find generated .prisma/client — run pnpm db:generate first')
  process.exit(1)
}

console.log(`Prisma client: ${clientDir}`)
ensureSymlink(join(root, 'node_modules', '.prisma', 'client'), clientDir)
ensureSymlink(join(root, '.next', 'node_modules', '.prisma', 'client'), clientDir)

const linkedDefault = join(root, '.next', 'node_modules', '.prisma', 'client', 'default.js')
const linkedIndex = join(root, '.next', 'node_modules', '.prisma', 'client', 'index.js')
if (!existsSync(linkedDefault) && !existsSync(linkedIndex)) {
  console.error('FAIL: symlink did not expose Prisma client entry')
  process.exit(1)
}

console.log('PASS: Prisma client linked for Next/.next runtime')
