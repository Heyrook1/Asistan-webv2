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

async function inspect(socket, url) {
  await send(socket, 'Runtime.evaluate', {
    expression: `location.href = ${JSON.stringify(url)}`,
  })
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 5000))

  const snapshot = await send(socket, 'Runtime.evaluate', {
    expression: `JSON.stringify({
      url: location.href,
      body: document.body.innerText.replace(/\\n{3,}/g, '\\n\\n'),
      images: [...document.querySelectorAll('img')].map((img) => ({
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
      videos: [...document.querySelectorAll('video')].map((video) => ({
        duration: video.duration,
        muted: video.muted,
        width: video.videoWidth,
        height: video.videoHeight,
      })),
    }, null, 2)`,
    returnByValue: true,
  })

  console.log(snapshot.result.value)
  console.log('\\n--- ITEM END ---\\n')
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

for (const url of process.argv.slice(2)) {
  await inspect(socket, url)
}

await send(socket, 'Runtime.evaluate', {
  expression: `location.href = 'https://www.instagram.com/asistan.kktc/'`,
})
socket.close()
