import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const endpoint = 'http://127.0.0.1:9223/json/list'
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

      if (message.result?.exceptionDetails) {
        reject(new Error(message.result.exceptionDetails.text))
        return
      }

      resolvePromise(message.result)
    }

    socket.addEventListener('message', handleMessage)
    socket.send(JSON.stringify({ id, method, params }))
  })
}

const targets = await fetch(endpoint).then((response) => response.json())
const target = targets.find((item) => item.type === 'page' && item.url.includes('instagram.com/asistan.kktc'))

if (!target) {
  throw new Error('Open Instagram profile tab was not found.')
}

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolvePromise, reject) => {
  socket.addEventListener('open', resolvePromise, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

await send(socket, 'Runtime.evaluate', {
  expression: `location.href = 'https://www.instagram.com/asistan.kktc/'`,
})
await new Promise((resolvePromise) => setTimeout(resolvePromise, 6000))

const snapshot = await send(socket, 'Runtime.evaluate', {
  expression: `JSON.stringify({
    url: location.href,
    title: document.title,
    body: document.body.innerText,
    links: [...document.querySelectorAll('a')].map((a) => ({
      text: (a.innerText || a.textContent || '').replace(/\\s+/g, ' ').trim(),
      href: a.href,
      aria: a.getAttribute('aria-label'),
    })).filter((item) => item.href),
    images: [...document.querySelectorAll('img')].map((img) => ({
      alt: img.alt,
      src: img.currentSrc || img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
    })),
  }, null, 2)`,
  returnByValue: true,
})

const destination = resolve('social-media-posts/audits/instagram-profile-live.png')
await mkdir(resolve('social-media-posts/audits'), { recursive: true })
const screenshot = await send(socket, 'Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: false,
  fromSurface: true,
})
await writeFile(destination, Buffer.from(screenshot.data, 'base64'))

socket.close()
console.log(snapshot.result.value)
console.log(`SCREENSHOT=${destination}`)
