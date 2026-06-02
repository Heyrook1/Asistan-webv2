const endpoint = 'http://127.0.0.1:9223/json/list'
let nextCommandId = 1

async function getFlowTarget() {
  const targets = await fetch(endpoint).then((response) => response.json())
  const target = targets.find(
    (item) => item.type === 'page' && item.url.includes('labs.google/fx') && item.url.includes('/project/'),
  )

  if (!target) {
    throw new Error('Open Google Flow project tab was not found.')
  }

  return target
}

async function evaluate(expression) {
  const target = await getFlowTarget()
  const socket = new WebSocket(target.webSocketDebuggerUrl)

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  const result = await send(socket, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })

  socket.close()
  return result.result.value
}

async function send(socket, method, params = {}) {
  const id = nextCommandId++
  const result = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('CDP evaluation timed out.')), 30000)

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id !== id) return

      clearTimeout(timeout)
      if (message.error) {
        reject(new Error(message.error.message))
        return
      }

      if (message.result.exceptionDetails) {
        reject(new Error(message.result.exceptionDetails.text))
        return
      }

      resolve(message.result)
    })

    socket.send(
      JSON.stringify({
        id,
        method,
        params,
      }),
    )
  })

  return result
}

async function clickReal(text) {
  const target = await getFlowTarget()
  const socket = new WebSocket(target.webSocketDebuggerUrl)

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  const expression = `(() => {
    const text = ${JSON.stringify(text)}
    const element = [...document.querySelectorAll('button,[role=button],[role=menuitem],[role=option],[role=tab]')]
      .find((item) => (item.innerText || item.textContent || '').replace(/\\s+/g, ' ').trim().includes(text))
    if (!element) throw new Error('Element not found: ' + text)
    const rect = element.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })()`
  const position = (await send(socket, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })).result.value

  await send(socket, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: position.x,
    y: position.y,
    button: 'left',
    clickCount: 1,
  })
  await send(socket, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: position.x,
    y: position.y,
    button: 'left',
    clickCount: 1,
  })

  socket.close()
  return `clicked: ${text}`
}

async function typeTextbox(text) {
  const target = await getFlowTarget()
  const socket = new WebSocket(target.webSocketDebuggerUrl)

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  const position = (await send(socket, 'Runtime.evaluate', {
    expression: `(() => {
      const element = document.querySelector('[contenteditable=true][role=textbox]')
      if (!element) throw new Error('Prompt textbox was not found.')
      const rect = element.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })).result.value

  await send(socket, 'Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
  })
  await send(socket, 'Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
  })
  await send(socket, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: position.x,
    y: position.y,
    button: 'left',
    clickCount: 1,
  })
  await send(socket, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: position.x,
    y: position.y,
    button: 'left',
    clickCount: 1,
  })
  await send(socket, 'Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
  })
  await send(socket, 'Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
  })
  await send(socket, 'Input.insertText', { text })

  socket.close()
  return 'typed prompt'
}

const [command, ...args] = process.argv.slice(2)

if (command === 'body') {
  console.log(
    await evaluate(`document.body.innerText.replace(/\\s+/g, ' ').slice(${Number(args[0] ?? 0)}, ${Number(args[1] ?? 12000)})`),
  )
} else if (command === 'buttons') {
  console.log(
    await evaluate(`JSON.stringify([...document.querySelectorAll('button,[role=button],[role=menuitem],[role=option]')].map((element, index) => ({
      index,
      tag: element.tagName,
      role: element.getAttribute('role'),
      text: (element.innerText || element.textContent || '').replace(/\\s+/g, ' ').trim(),
      aria: element.getAttribute('aria-label'),
      disabled: Boolean(element.disabled),
    })).filter((item) => item.text || item.aria), null, 2)`),
  )
} else if (command === 'click-text') {
  const text = JSON.stringify(args.join(' '))
  console.log(
    await evaluate(`(() => {
      const text = ${text}
      const element = [...document.querySelectorAll('button,[role=button],[role=menuitem],[role=option]')]
        .find((item) => (item.innerText || item.textContent || '').includes(text))
      if (!element) throw new Error('Element not found: ' + text)
      element.click()
      return 'clicked: ' + text
    })()`),
  )
} else if (command === 'click-real-text') {
  console.log(await clickReal(args.join(' ')))
} else if (command === 'type-textbox') {
  console.log(await typeTextbox(args.join(' ')))
} else if (command === 'eval') {
  console.log(await evaluate(args.join(' ')))
} else {
  throw new Error('Usage: node scripts/flow-cdp.mjs body|buttons|click-text|eval [...args]')
}
