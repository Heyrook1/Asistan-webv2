import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=')
          return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
        })
    )
  } catch {
    return {}
  }
}

function base64UrlDecode(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function decodeJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    return JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    return null
  }
}

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return null
  }
}

async function testKey(url, name, value, urlRef) {
  console.log(`\n${name}: ${value ? 'present' : 'missing'}`)
  if (!value) return false

  if (value.startsWith('sb_secret_')) {
    console.log('Key shape: new Supabase secret key')
  } else {
    const decoded = decodeJwt(value)
    if (!decoded) {
      console.log('Key shape: invalid format')
      return false
    }

    console.log(`Key shape: legacy JWT role=${decoded.role ?? 'unknown'} ref=${decoded.ref ?? 'missing'}`)
    if (decoded.role !== 'service_role') {
      console.log('Shape check: failed; role must be service_role')
      return false
    }
    if (urlRef && decoded.ref && urlRef !== decoded.ref) {
      console.log('Shape check: failed; key belongs to a different project than the URL')
      return false
    }
  }

  const supabase = createClient(url, value, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (error) {
    console.log(`Admin API check: failed (${error.message})`)
    return false
  }

  console.log('Admin API check: ok')
  return true
}

const env = {
  ...parseEnvFile('.env'),
  ...parseEnvFile('.env.local'),
  ...process.env,
}

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL
const urlRef = url ? projectRefFromUrl(url) : null

console.log(`Supabase URL project ref: ${urlRef ?? 'missing'}`)
if (!url) {
  console.log('Status: missing Supabase URL')
  process.exit(1)
}

const serviceRoleOk = await testKey(url, 'SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY, urlRef)
const secretOk = await testKey(url, 'SUPABASE_SECRET_KEY', env.SUPABASE_SECRET_KEY, urlRef)

if (!serviceRoleOk && !secretOk) {
  console.log('\nStatus: no configured admin key is accepted by Supabase Auth Admin API')
  process.exit(1)
}

console.log(`\nStatus: usable admin key found (${serviceRoleOk ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_SECRET_KEY'})`)
