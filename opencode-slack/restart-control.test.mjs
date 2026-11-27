import assert from 'node:assert/strict'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { request } from 'node:http'
import { join } from 'node:path'
import { test } from 'node:test'
import { createDrainController, openCodeActivity, startRestartControl } from './restart-control.mjs'
import { createRequestQueue } from './request-queue.mjs'

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

test('drain waits for queued requests, other channels, final Slack delivery and persistence while rejecting new work', async () => {
  const drain = createDrainController()
  drain.register('project', 4096, async () => ({ idle: true }))
  const enqueue = createRequestQueue()
  const output = deferred()
  const persistence = deferred()
  const otherChannel = deferred()
  const events = []
  const first = drain.admit('first', () => enqueue('thread', async () => {
    events.push('first')
    await output.promise
    events.push('output delivered')
  }))
  const second = drain.admit('second', () => enqueue('thread', async () => {
    events.push('second')
    await persistence.promise
    events.push('state saved')
  }))
  const other = drain.admit('other', () => otherChannel.promise)
  drain.begin('owner')
  let rejected = false
  await drain.admit('new', () => assert.fail('new request executed'), () => { rejected = true })
  assert.equal(rejected, true)
  assert.equal((await drain.inspect()).ready, false)
  assert.equal((await drain.inspect()).pending.second, 1)
  output.resolve()
  await first
  assert.equal((await drain.inspect()).ready, false)
  persistence.resolve()
  await second
  assert.equal((await drain.inspect()).ready, false)
  otherChannel.resolve()
  await other
  assert.equal((await drain.inspect()).ready, true)
  assert.deepEqual(events, ['first', 'output delivered', 'second', 'state saved'])
})

test('approval and question callbacks continue during drain and sealing stops late background work', async () => {
  const drain = createDrainController()
  let questions = 1
  drain.register('project', 4096, async () => ({ idle: questions === 0, questions }))
  drain.begin('owner')
  assert.equal((await drain.inspect()).ready, false)
  const callback = deferred()
  const answer = drain.track('question answer', async () => { questions = 0; await callback.promise })
  assert.equal((await drain.inspect()).ready, false)
  callback.resolve()
  await answer
  assert.equal((await drain.inspect()).ready, true)
  await drain.track('poll', () => assert.fail('sealed background task executed'))
  drain.resume('owner')
  let executed = false
  await drain.admit('new', () => { executed = true })
  assert.equal(executed, true)
})

test('every live project must be idle; unavailable or invalid state never permits restart', async () => {
  const drain = createDrainController()
  drain.register('one', 4096, async () => ({ idle: true }))
  let healthy = false
  drain.register('two', 4097, async () => { if (!healthy) throw Error('offline'); return { idle: true } })
  drain.begin('owner')
  const status = await drain.inspect()
  assert.equal(status.ready, false)
  assert.equal(status.projects[1].error, 'OpenCode state unavailable')
  healthy = true
  assert.equal((await drain.inspect()).ready, true)
  const empty = createDrainController()
  empty.begin('owner')
  assert.equal((await empty.inspect()).ready, false)
})

test('a concurrent callback arriving during an OpenCode status check prevents premature readiness', async () => {
  const drain = createDrainController()
  const probe = deferred()
  const work = deferred()
  drain.register('project', 4096, () => probe.promise)
  drain.begin('owner')
  const status = drain.inspect()
  const callback = drain.track('callback', () => work.promise)
  probe.resolve({ idle: true })
  assert.equal((await status).ready, false)
  work.resolve()
  await callback
  assert.equal((await drain.inspect()).ready, true)
})

test('a notification task that starts and finishes between project snapshots invalidates the entire drain check', async () => {
  const drain = createDrainController()
  let pendingNotices = 0
  const firstChecked = deferred()
  const secondCheck = deferred()
  drain.register('first', 4096, async () => {
    const idle = pendingNotices === 0
    firstChecked.resolve()
    return { idle, pendingNotices }
  })
  drain.register('second', 4097, () => secondCheck.promise)
  drain.begin('owner')
  const checking = drain.inspect()
  await firstChecked.promise
  await drain.track('late notification', async () => { pendingNotices++ })
  secondCheck.resolve({ idle: true })
  assert.equal((await checking).ready, false)
  assert.equal(drain.sealed, false)
  assert.equal((await drain.inspect()).ready, false)
  await drain.track('notification retry', async () => { pendingNotices-- })
  assert.equal((await drain.inspect()).ready, true)
})

test('failed requests release their accounting and another restart cannot take ownership', async () => {
  const drain = createDrainController()
  drain.register('project', 4096, async () => ({ idle: true }))
  await assert.rejects(drain.admit('failed', () => { throw Error('request failed') }), /request failed/)
  drain.begin('owner')
  assert.throws(() => drain.begin('other'))
  assert.throws(() => drain.resume('other'))
  assert.equal((await drain.inspect()).ready, true)
})

test('OpenCode activity includes pending permissions, questions, retries and sessions beyond Slack threads', async () => {
  const responses = { '/session/status': {}, '/permission': [], '/question': [] }
  const api = async path => responses[path]
  assert.equal((await openCodeActivity(api)).idle, true)
  for (const type of ['busy', 'retry']) {
    responses['/session/status'] = { externalSession: { type } }
    assert.equal((await openCodeActivity(api)).idle, false)
  }
  responses['/session/status'] = { done: { type: 'idle' } }
  for (const path of ['/permission', '/question']) {
    responses[path] = [{ id: 'waiting' }]
    assert.equal((await openCodeActivity(api)).idle, false)
    responses[path] = []
  }
  responses['/session/status'] = { broken: {} }
  await assert.rejects(openCodeActivity(api), /Invalid session status/)
  responses['/session/status'] = null
  await assert.rejects(openCodeActivity(api), /Invalid OpenCode state/)
})

test('a failed Slack decision update keeps drain pending between polling retries even when OpenCode is idle', async () => {
  const drain = createDrainController()
  const notices = new Map([['question', { decision: 'answered' }]])
  const api = async path => path === '/session/status' ? {} : []
  drain.register('project', 4096, () => openCodeActivity(api, () => notices.size))
  drain.begin('owner')
  await assert.rejects(drain.track('update', async () => { throw Error('Slack unavailable') }))
  const waiting = await drain.inspect()
  assert.equal(waiting.ready, false)
  assert.equal(waiting.projects[0].pendingNotices, 1)
  await drain.track('poll retry', async () => { notices.delete('question') })
  assert.equal((await drain.inspect()).ready, true)
})

function control(path, method, route, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ socketPath: path, method, path: route, headers }, res => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }))
    })
    req.on('error', reject)
    req.end()
  })
}

test('private restart socket binds mutations to the running instance and owner, and refuses a second listener', async () => {
  const directory = await mkdtemp('/tmp/opencode/restart-control-')
  const path = join(directory, 'control.sock')
  const drain = createDrainController()
  drain.register('project', 4096, async () => ({ idle: true }))
  const server = await startRestartControl(drain, path)
  try {
    assert.equal((await stat(path)).mode & 0o777, 0o600)
    assert.equal((await control(path, 'GET', '/status')).body.draining, false)
    const headers = { 'x-bridge-instance': drain.instance, 'x-restart-token': 'a'.repeat(32) }
    assert.equal((await control(path, 'POST', '/drain')).status, 409)
    const drained = await control(path, 'POST', '/drain', headers)
    assert.equal(drained.body.ready, true)
    assert.equal((await control(path, 'POST', '/drain', { ...headers, 'x-restart-token': 'b'.repeat(32) })).status, 409)
    assert.equal((await control(path, 'POST', '/resume', headers)).status, 200)
    assert.equal(drain.draining, false)
    assert.equal((await control(path, 'GET', '/unknown')).status, 404)
    await assert.rejects(startRestartControl(createDrainController(), path), /already running/)
    drain.inspect = async () => { throw Error('temporary control failure') }
    assert.equal((await control(path, 'GET', '/status')).status, 503)
  } finally {
    await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
})
