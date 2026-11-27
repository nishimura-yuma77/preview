import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createServer } from 'node:net'
import { promisify } from 'node:util'
import { test } from 'node:test'
import { fetchOpenCode } from './opencode-http.mjs'
import { observeOpenCodeEvents } from './opencode-events.mjs'

const run = promisify(execFile)
const probe = new URL('./fixtures/http-client-probe.mjs', import.meta.url)

for (const scenario of ['length', 'eof', 'short-length', 'short-chunked', 'timeout']) {
  test(`built-in HTTP client handles delayed body consumption and ${scenario}`, async () => {
    const { stdout } = await run(process.execPath, [probe.pathname, scenario], { timeout: 8000 })
    assert.equal(stdout.trim(), `PASS ${scenario}`)
  })
}

test('built-in client receives a history-sized response completely after peer FIN', async () => {
  const { stdout } = await run(process.execPath, [probe.pathname, 'length', '--body-bytes=935771'], { timeout: 8000 })
  assert.equal(stdout.trim(), 'PASS length')
})

test('connection refusal is a catchable request failure', async () => {
  const server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  await assert.rejects(fetchOpenCode(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(3000) }),
    error => error.cause?.code === 'ECONNREFUSED')
})

test('SSE uses the built-in client across peer close, reconnect and stop', async () => {
  const controller = new AbortController()
  const events = [], delays = [], sockets = new Set()
  let connections = 0
  const server = createServer(socket => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
    socket.on('error', () => {})
    socket.once('data', () => {
      connections++
      const body = `data: ${JSON.stringify({ type: 'session.error', properties: {
        sessionID: 'ses_test', error: { name: 'APIError', data: { message: 'upstream failed' } },
      } })}\n\n`
      socket.end(`HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nConnection: close\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`)
    })
  })
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    await observeOpenCodeEvents({
      signal: controller.signal,
      connect: signal => fetchOpenCode(`http://127.0.0.1:${server.address().port}/event`, { signal }),
      emit: (level, event, fields) => {
        if (event === 'opencode.session.error') {
          events.push(fields)
          if (events.length === 2) controller.abort()
        }
      },
      pause: async delay => { delays.push(delay) },
    })
    assert.equal(connections, 2)
    assert.equal(events.length, 2)
    assert.equal(events[0].error.message, 'upstream failed')
    assert.deepEqual(delays, [1000])
  } finally {
    controller.abort()
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => server.close(resolve))
  }
})
