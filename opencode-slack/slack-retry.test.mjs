import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:http'
import { WebClient } from '@slack/web-api'
import { retryDelay, retrySlack, deliverChunks } from './slack-retry.mjs'
import { submitPromptOnce, clearThreadPending, finishPending } from './request-recovery.mjs'

const network = () => Object.assign(Error('network'), { code: 'slack_webapi_request_error' })

test('real Slack SDK resumes a final answer after HTTP 503 and 429 using the same destination and UUID', async () => {
  const bodies = []
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    bodies.push(new URLSearchParams(Buffer.concat(chunks).toString()))
    response.setHeader('Content-Type', 'application/json')
    if (bodies.length === 1) response.writeHead(503).end('{}')
    else if (bodies.length === 2) response.writeHead(429, { 'Retry-After': '0' }).end('{}')
    else response.end(JSON.stringify({ ok: true, ts: '1.2' }))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const client = new WebClient('test-token', {
      slackApiUrl: `http://127.0.0.1:${server.address().port}/`,
      retryConfig: { retries: 0 }, rejectRateLimitedCalls: true, logLevel: 'error',
    })
    const delivery = { ids: ['same-uuid'], sent: 0 }
    await deliverChunks(client, [{ channel: 'channel', thread_ts: '1.0', text: 'answer' }], delivery,
      async () => {}, { pause: async () => {} })
    assert.equal(delivery.sent, 1)
    assert.equal(bodies.length, 3)
    for (const body of bodies) {
      assert.equal(body.get('client_msg_id'), 'same-uuid')
      assert.equal(body.get('channel'), 'channel')
      assert.equal(body.get('thread_ts'), '1.0')
    }
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})

test('network failures, HTTP 5xx and rate limits retry; permanent errors fail immediately', async () => {
  const transient = [network(),
    { code: 'slack_webapi_http_error', statusCode: 503 },
    { code: 'slack_webapi_rate_limited_error', retryAfter: 120 },
    { code: 'slack_webapi_platform_error', data: { error: 'internal_error' } },
  ]
  for (const failure of transient) {
    let attempts = 0
    const delays = []
    assert.equal(await retrySlack(async () => {
      if (++attempts === 1) throw failure
      return 'delivered'
    }, { pause: async delay => { delays.push(delay) } }), 'delivered')
    assert.equal(attempts, 2)
    assert.equal(delays.length, 1)
  }
  assert.equal(retryDelay(transient[2], 0, () => 0), 120000)
  assert.equal(retryDelay(network(), 100, () => 0), 60000)
  assert.equal(retryDelay(network(), 100, () => 1), 60000)
  for (const failure of [
    { code: 'slack_webapi_platform_error', data: { error: 'invalid_auth' } },
    { code: 'slack_webapi_http_error', statusCode: 400 },
    Error('programming error'),
  ]) {
    let attempts = 0
    await assert.rejects(retrySlack(async () => { attempts++; throw failure }, {
      pause: async () => assert.fail('Permanent error retried'),
    }), error => error === failure)
    assert.equal(attempts, 1)
  }
})

test('stop aborts retry backoff without starting another Slack write', async () => {
  const controller = new AbortController()
  let attempts = 0
  await assert.rejects(retrySlack(async () => {
    attempts++
    throw network()
  }, { signal: controller.signal, onRetry: () => controller.abort() }), { name: 'AbortError' })
  assert.equal(attempts, 1)
})

test('lost Slack acknowledgement retries with the same message UUID and records success once', async () => {
  const calls = []
  let saved
  const delivery = { ids: ['stable-id'], sent: 0 }
  const client = { chat: { postMessage: async body => {
    calls.push(body)
    if (calls.length === 1) throw network()
  } } }
  await deliverChunks(client, [{ text: 'answer' }], delivery, async () => {
    saved = structuredClone(delivery)
  }, { pause: async () => {} })
  assert.deepEqual(calls.map(body => body.client_msg_id), ['stable-id', 'stable-id'])
  assert.deepEqual(saved, { ids: ['stable-id'], sent: 1 })
})

test('restart resumes multipart delivery from its persisted position without replaying acknowledged chunks', async () => {
  let snapshot
  const delivery = { ids: ['first', 'second', 'third'], sent: 0 }
  const chunks = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
  const firstClient = { chat: { postMessage: async body => {
    if (body.text === 'b') throw Error('simulated process interruption')
  } } }
  await assert.rejects(deliverChunks(firstClient, chunks, delivery, async () => {
    snapshot = JSON.stringify(delivery)
  }), /interruption/)
  const restored = JSON.parse(snapshot)
  const calls = []
  await deliverChunks({ chat: { postMessage: async body => { calls.push(body) } } }, chunks, restored, async () => {})
  assert.deepEqual(calls.map(body => body.client_msg_id), ['second', 'third'])
  await deliverChunks({ chat: { postMessage: async () => assert.fail('Completed answer replayed') } }, chunks, restored, async () => {})
})

test('prompt acceptance timeout recovers by observing its saved message ID rather than submitting another prompt', async () => {
  const pending = {}
  let snapshot
  let submitted = 0
  await submitPromptOnce(pending, 'msg_original', async () => { snapshot = JSON.stringify(pending) }, async () => {
    assert.equal(JSON.parse(snapshot).messageID, 'msg_original')
    submitted++
    throw Object.assign(Error('timeout'), { name: 'TimeoutError' })
  })
  await submitPromptOnce(JSON.parse(snapshot), 'msg_new', async () => assert.fail('Recovery rewrote message ID'), async () => { submitted++ })
  assert.equal(submitted, 1)
})

test('failed persistence prevents prompt submission and definite API errors remain visible', async () => {
  await assert.rejects(submitPromptOnce({}, 'msg_x', async () => { throw Error('disk full') },
    async () => assert.fail('Submitted without persistence')), /disk full/)
  await assert.rejects(submitPromptOnce({}, 'msg_x', async () => {}, async () => {
    throw Error('OpenCode API returned 403')
  }), /403/)
})

test('stop removes only its thread from persisted work; incomplete delivery survives cleanup and restart', async () => {
  const pending = {
    a: { thread: 'stopped', prompt: 'queued' },
    b: { thread: 'stopped', messageID: 'msg_running' },
    c: { thread: 'other', answer: 'answer', delivery: { ids: ['id'], sent: 0 } },
  }
  clearThreadPending(pending, 'stopped')
  let snapshot
  const save = async () => { snapshot = JSON.stringify(pending) }
  await finishPending(pending, 'a', save)
  await finishPending(pending, 'c', save)
  assert.deepEqual(Object.keys(JSON.parse(snapshot)), ['c'])
  pending.c.delivery.sent = 1
  await finishPending(pending, 'c', save)
  assert.deepEqual(JSON.parse(snapshot), {})
})
