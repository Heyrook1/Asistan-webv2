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

const url = process.argv[2]
if (!url) throw new Error('Usage: node scripts/audit-public-page.mjs <url>')

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then((response) =>
  response.json(),
)
const socket = new WebSocket(target.webSocketDebuggerUrl)

await new Promise((resolvePromise, reject) => {
  socket.addEventListener('open', resolvePromise, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
await new Promise((resolvePromise) => setTimeout(resolvePromise, 6500))

const result = await send(socket, 'Runtime.evaluate', {
  expression: `JSON.stringify({
    url: location.href,
    title: document.title,
    body: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 12000),
    links: [...document.querySelectorAll('a')].map((a) => ({
      text: (a.innerText || '').replace(/\\s+/g, ' ').trim(),
      href: a.href,
    })).filter((item) => item.text).slice(0, 80),
  }, null, 2)`,
  returnByValue: true,
})

console.log(result.result.value)
await send(socket, 'Page.close')
socket.close()
