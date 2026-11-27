import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:http'
import { fetch } from 'undici'
import { createSlackApp } from './slack-app.mjs'

test('Bolt uses pinned fetch for Web API, Socket Mode connection API and response_url', async () => {
  const requests = []
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    requests.push({ path: request.url, body: Buffer.concat(chunks).toString() })
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ ok: true, user_id: 'UBOT', team_id: 'TTEST', url: 'wss://example.invalid/' }))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const endpoint = `http://127.0.0.1:${server.address().port}/`
  const builtin = globalThis.fetch
  globalThis.fetch = () => { throw Error('Built-in fetch must not be used by Slack SDK') }
  const logger = { debug() {}, info() {}, warn() {}, error() {}, setLevel() {}, getLevel() { return 'error' }, setName() {} }
  try {
    const app = createSlackApp({ token: 'xoxb-test', appToken: 'xapp-test', logger, slackApiUrl: endpoint })
    assert.equal(app.client.fetchFn, fetch)
    assert.equal(app.receiver.client.webClient.fetchFn, fetch)
    assert.equal(app.fetchFn, fetch)
    // Exercise real SDK clients without starting a production WebSocket connection.
    assert.equal((await app.client.chat.postMessage({ channel: 'CTEST', text: 'local-message' })).ok, true)
    assert.equal((await app.receiver.client.webClient.apps.connections.open()).url, 'wss://example.invalid/')
    let responded = false
    app.command('/probe', async ({ ack, respond }) => {
      await ack()
      await respond({ text: 'local-response' })
      responded = true
    })
    await app.processEvent({
      body: { command: '/probe', team_id: 'TTEST', user_id: 'UTEST', channel_id: 'CTEST',
        text: '', response_url: `${endpoint}response` },
      ack: async () => {},
    })
    assert.equal(responded, true)
    assert.deepEqual(requests.map(request => request.path), ['/auth.test', '/chat.postMessage', '/apps.connections.open', '/response'])
    assert.equal(JSON.parse(requests[3].body).text, 'local-response')
  } finally {
    globalThis.fetch = builtin
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
  }
})
