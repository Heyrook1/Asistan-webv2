import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const endpoint = 'http://127.0.0.1:9223'
let nextCommandId = 1

async function send(socket, method, params = {}) {
  const id = nextCommandId++

  return new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${method} timed out.`)), 30000)

    const handleMessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id !== id) return

      clearTimeout(timeout)
      socket.removeEventListener('message', handleMessage)
      if (message.error) {
        reject(new Error(message.error.message))
        return
      }

      resolvePromise(message.result)
    }

    socket.addEventListener('message', handleMessage)

    socket.send(JSON.stringify({ id, method, params }))
  })
}

const source = resolve(process.argv[2])
const destination = resolve(process.argv[3])
const duration = Number(process.argv[4] ?? 14)
const fps = Number(process.argv[5] ?? 24)
const width = Number(process.argv[6] ?? 720)
const height = Number(process.argv[7] ?? 1280)
const totalFrames = Math.round(duration * fps)

await mkdir(destination, { recursive: true })
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(pathToFileURL(source).href)}`, { method: 'PUT' }).then(
  (response) => response.json(),
)
const socket = new WebSocket(target.webSocketDebuggerUrl)

await new Promise((resolvePromise, reject) => {
  socket.addEventListener('open', resolvePromise, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

await send(socket, 'Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
})
await send(socket, 'Runtime.evaluate', {
  expression: `new Promise((resolve) => {
    if (document.readyState === 'complete') return resolve()
    window.addEventListener('load', resolve, { once: true })
  })`,
  awaitPromise: true,
})

for (let frame = 0; frame < totalFrames; frame += 1) {
  const time = frame / fps
  await send(socket, 'Runtime.evaluate', {
    expression: `window.renderAt(${time})`,
    awaitPromise: true,
  })
  const screenshot = await send(socket, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  })
  const filename = `${String(frame + 1).padStart(4, '0')}.png`
  await writeFile(resolve(destination, filename), Buffer.from(screenshot.data, 'base64'))

  if ((frame + 1) % fps === 0 || frame + 1 === totalFrames) {
    console.log(`Rendered ${frame + 1}/${totalFrames} frames`)
  }
}

await send(socket, 'Page.close')
socket.close()

console.log(`Rendered ${totalFrames} frames from ${source} to ${destination}`)
