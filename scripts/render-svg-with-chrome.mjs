import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const endpoint = 'http://127.0.0.1:9223'
let nextCommandId = 1

async function send(socket, method, params = {}) {
  const id = nextCommandId++

  return new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${method} timed out.`)), 30000)

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id !== id) return

      clearTimeout(timeout)
      if (message.error) {
        reject(new Error(message.error.message))
        return
      }

      resolvePromise(message.result)
    })

    socket.send(JSON.stringify({ id, method, params }))
  })
}

const source = resolve(process.argv[2])
const destination = resolve(process.argv[3])
const svg = await readFile(source, 'utf8')
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(dataUrl)}`, { method: 'PUT' }).then((response) =>
  response.json(),
)
const socket = new WebSocket(target.webSocketDebuggerUrl)

await new Promise((resolvePromise, reject) => {
  socket.addEventListener('open', resolvePromise, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

await send(socket, 'Emulation.setDeviceMetricsOverride', {
  width: 720,
  height: 1280,
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
const screenshot = await send(socket, 'Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: false,
  fromSurface: true,
})
await writeFile(destination, Buffer.from(screenshot.data, 'base64'))
await send(socket, 'Page.close')
socket.close()

console.log(`Rendered ${source} to ${destination}`)
