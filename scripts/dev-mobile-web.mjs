import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function run(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    windowsHide: false,
  })

  child.on('error', (error) => {
    console.error(`[dev-mobile-web] Failed to start ${command}:`, error)
  })

  return child
}

function isPortInUse(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket()

    socket
      .once('connect', () => {
        socket.destroy()
        resolve(true)
      })
      .once('error', () => {
        resolve(false)
      })
      .once('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      .connect(port, host)

    socket.setTimeout(400)
  })
}

async function findFreePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    const inUse = await isPortInUse(port)
    if (!inUse) return port
  }
  throw new Error(`No free port found between ${startPort} and ${endPort}`)
}

function killTree(pid) {
  if (!pid) return
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(pid), '/T', '/F'], {
      stdio: 'ignore',
      shell: true,
      windowsHide: true,
    })
    return
  }

  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    // Process might already be closed.
  }
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const rootCwd = path.resolve(scriptDir, '..')
  const backendPort = 3000
  const backendAlreadyRunning = await isPortInUse(backendPort)

  let backend = null
  if (backendAlreadyRunning) {
    console.log(`[dev-mobile-web] Reusing existing backend at http://localhost:${backendPort}.`)
  } else {
    console.log(`[dev-mobile-web] Starting Next.js backend on :${backendPort}...`)
    backend = run('npm', ['run', 'dev', '--', '--port', String(backendPort)], rootCwd)
  }

  const webPort = await findFreePort(8081, 8100)
  console.log(`[dev-mobile-web] Starting Expo Web client on :${webPort}...`)
  const mobileWeb = run(
    'npm',
    ['--prefix', 'mobile', 'run', 'web', '--', '--port', String(webPort), '--offline', '--clear'],
    rootCwd
  )

  let shuttingDown = false
  function shutdown(code = 0) {
    if (shuttingDown) return
    shuttingDown = true
    if (backend?.pid) killTree(backend.pid)
    if (mobileWeb?.pid) killTree(mobileWeb.pid)
    setTimeout(() => process.exit(code), 250)
  }

  if (backend) {
    backend.on('exit', (code) => {
      console.log(`[dev-mobile-web] Backend exited (${code ?? 'unknown'}).`)
      shutdown(code ?? 0)
    })
  }

  mobileWeb.on('exit', (code) => {
    console.log(`[dev-mobile-web] Expo Web exited (${code ?? 'unknown'}).`)
    shutdown(code ?? 0)
  })

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))
}

main().catch((error) => {
  console.error('[dev-mobile-web] Failed to start:', error)
  process.exit(1)
})
