import assert from 'node:assert/strict'
import { test } from 'node:test'
import { diagnosticEvent, readDiagnosticEvents, observeOpenCodeEvents } from './opencode-events.mjs'

test('only session failures and retries are retained; response bodies, prompts and tool output are omitted', () => {
  assert.equal(diagnosticEvent({ type: 'message.part.updated', properties: { text: 'PRIVATE' } }), null)
  const event = diagnosticEvent({ type: 'session.error', properties: { sessionID: 'ses_test', error: {
    name: 'APIError', data: { message: 'upstream failed', statusCode: 503, responseBody: 'PRIVATE', requestBodyValues: 'PRIVATE' },
  } } })
  assert.equal(event.fields.error.statusCode, 503)
  assert.ok(!JSON.stringify(event).includes('PRIVATE'))
  assert.equal(diagnosticEvent({ type: 'session.status', properties: { status: { type: 'busy' } } }), null)
  assert.equal(diagnosticEvent({ type: 'session.status', properties: { sessionID: 'ses_test', status: { type: 'retry', attempt: 2 } } }).fields.attempt, 2)
})

test('SSE parsing handles split frames and oversized payloads without losing the next failure', async () => {
  const frames = 'data: ' + JSON.stringify({ type: 'session.error', properties: { sessionID: 'ses_test', error: { name: 'APIError', data: { message: '接続失敗' } } } }) + '\n\n'
  const bytes = new TextEncoder().encode('data: ' + 'x'.repeat(70000) + '\n\n' + frames)
  const body = new ReadableStream({ start(controller) { for (let i = 0; i < bytes.length; i += 13) controller.enqueue(bytes.slice(i, i + 13)); controller.close() } })
  const events = []
  await readDiagnosticEvents(new Response(body), (...args) => events.push(args))
  assert.equal(events.length, 1)
  assert.equal(events[0][2].error.message, '接続失敗')
})

test('an unavailable event stream reconnects with backoff and abort stops the observer', async () => {
  const controller = new AbortController()
  const delays = [], records = []
  let calls = 0
  await observeOpenCodeEvents({
    signal: controller.signal,
    connect: async () => { calls++; return new Response('', { status: 503 }) },
    emit: (...args) => records.push(args),
    pause: async delay => { delays.push(delay); if (delays.length === 3) controller.abort() },
  })
  assert.equal(calls, 3)
  assert.deepEqual(delays, [1000, 2000, 4000])
  assert.equal(records.length, 1)
  assert.equal(records[0][2].error.status, 503)
})
