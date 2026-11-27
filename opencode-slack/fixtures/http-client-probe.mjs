// Keep this regression probe in a child process: affected older Node versions can terminate
// from its socket event handler before a promise catch can run.
import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { setTimeout as sleep } from 'node:timers/promises'
import { fetchOpenCode } from '../opencode-http.mjs'

const scenario = process.argv[2]
const fetch = fetchOpenCode
const bodyBytes = Number(process.argv.find(arg => arg.startsWith('--body-bytes='))?.split('=')[1] ?? 64 * 1024)
const body = Buffer.alloc(bodyBytes, 0x61)
const sockets = new Set()
const server = createServer(socket => {
  sockets.add(socket)
  socket.on('close', () => sockets.delete(socket))
  socket.on('error', () => {})
  socket.once('data', () => {
    if (scenario === 'timeout') {
      socket.write('HTTP/1.1 200 OK\r\nContent-Length: 65536\r\nConnection: close\r\n\r\n')
      return
    }
    let headers = ''
    let payload = body
    if (scenario === 'length') headers = `Content-Length: ${body.length}\r\n`
    else if (scenario === 'eof') headers = ''
    else if (scenario === 'short-length') headers = `Content-Length: ${body.length + 1}\r\n`
    else if (scenario === 'short-chunked') {
      headers = 'Transfer-Encoding: chunked\r\n'
      payload = Buffer.concat([Buffer.from(`${body.length.toString(16)}\r\n`), body])
    } else throw Error(`Unknown scenario: ${scenario}`)
    socket.write(`HTTP/1.1 200 OK\r\n${headers}Connection: close\r\n\r\n`)
    socket.write(payload)
    socket.end()
  })
})

try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const signal = AbortSignal.timeout(scenario === 'timeout' ? 300 : 3000)
  const response = await fetch(`http://127.0.0.1:${server.address().port}/`, { signal })
  // Let FIN arrive before consuming: immediate .text() would miss the bug.
  await sleep(100)
  if (scenario.startsWith('short-')) {
    await assert.rejects(response.text(), error => {
      assert.ok(error instanceof Error)
      assert.equal(error.name, 'TypeError')
      if (scenario === 'short-length') assert.equal(error.cause?.code, 'UND_ERR_RES_CONTENT_LENGTH_MISMATCH')
      else assert.equal(error.cause?.name, 'HTTPParserError')
      return true
    })
  } else if (scenario === 'timeout') {
    await assert.rejects(response.text(), error => error.name === 'TimeoutError')
  } else {
    const result = await response.arrayBuffer()
    assert.deepEqual(Buffer.from(result), body)
  }
  console.log(`PASS ${scenario}`)
} finally {
  for (const socket of sockets) socket.destroy()
  await new Promise(resolve => server.close(resolve))
}
