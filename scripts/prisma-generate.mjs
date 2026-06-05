import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL or a Vercel Postgres URL is required for prisma generate')
  process.exit(1)
}

const localPrisma = process.platform === 'win32'
  ? join(process.cwd(), 'node_modules', '.bin', 'prisma.cmd')
  : join(process.cwd(), 'node_modules', '.bin', 'prisma')

const command = existsSync(localPrisma) ? localPrisma : 'prisma'

const result = spawnSync(command, ['generate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
})

process.exit(result.status ?? 1)
