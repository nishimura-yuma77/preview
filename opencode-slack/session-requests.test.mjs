import assert from 'node:assert/strict'
import { test } from 'node:test'
import { acceptedText, notifyThread, postCompletedAnswer } from './bridge.mjs'
import { createDrainController } from './restart-control.mjs'
import { createSessionRequests, RequestInterruptedError } from './session-requests.mjs'

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

function untilAborted(context) {
  return new Promise(resolve => {
    if (context.signal.aborted) resolve()
    else context.signal.addEventListener('abort', resolve, { once: true })
  })
}

function harness() {
  const sessions = { a: 'ses_a', b: 'ses_b' }
  const status = { ses_a: { type: 'busy' }, ses_b: { type: 'busy' } }
  const calls = []
  const api = async (path, body) => {
    calls.push({ path, body })
    if (path === '/session/status') return { ...status }
    const match = /^\/session\/(ses_\w+)\/abort$/.exec(path)
    assert.ok(match, `Unexpected API call: ${path}`)
    delete status[match[1]]
    return true
  }
  return { sessions, status, calls, api }
}

test('stop bypasses the active request, drops its thread queue and preserves other threads and later requests', async () => {
  const { sessions, api, calls } = harness()
  const requests = createSessionRequests({ api, sessionForThread: thread => sessions[thread] })
  const started = deferred()
  const otherStarted = deferred()
  const otherDone = deferred()
  const active = requests.enqueue('a', async context => {
    started.resolve()
    await untilAborted(context)
    context.checkpoint()
    assert.fail('Interrupted request continued')
  })
  await started.promise
  const queued = [1, 2].map(() => requests.enqueue('a', () => assert.fail('Cancelled request started')))
  const other = requests.enqueue('b', async context => {
    otherStarted.resolve()
    await otherDone.promise
    context.checkpoint()
    return 'other completed'
  })
  await otherStarted.promise
  const result = await requests.stop('a')
  assert.deepEqual(result, { stopped: true, cancelled: 2 })
  await Promise.all([active, ...queued])
  assert.ok(calls.some(call => call.path === '/session/ses_a/abort'))
  assert.ok(calls.every(call => !call.path.includes('ses_b/abort')))
  assert.equal(requests.has('b'), true)
  assert.equal(await requests.enqueue('a', context => context.sessionID), 'ses_a')
  assert.equal(sessions.a, 'ses_a')
  otherDone.resolve()
  assert.equal(await other, 'other completed')
})

test('stop received before a request microtask starts prevents any request side effect', async () => {
  const { sessions, api } = harness()
  const requests = createSessionRequests({ api, sessionForThread: thread => sessions[thread] })
  const request = requests.enqueue('a', () => assert.fail('Request should not start'))
  assert.equal(requests.has('a'), true)
  assert.equal((await requests.stop('a')).stopped, true)
  await request
})

test('ordinary requests remain serial within a thread and a failed request releases the next request', async () => {
  const requests = createSessionRequests({ api: async () => ({}), sessionForThread: () => undefined })
  const firstStarted = deferred()
  const firstDone = deferred()
  const events = []
  const first = requests.enqueue('thread', async () => {
    events.push('first')
    firstStarted.resolve()
    await firstDone.promise
    throw Error('request failed')
  })
  const rejected = assert.rejects(first, /request failed/)
  const second = requests.enqueue('thread', () => events.push('second'))
  await firstStarted.promise
  await requests.enqueue('other thread', () => events.push('other'))
  assert.deepEqual(events, ['first', 'other'])
  firstDone.resolve()
  await Promise.all([rejected, second])
  assert.deepEqual(events, ['first', 'other', 'second'])
})

test('stop requests abort immediately but waits for a Slack send already in flight before confirming', async () => {
  const { sessions, api, calls } = harness()
  const sending = deferred()
  const delivered = deferred()
  const firstAbort = deferred()
  const controlled = createSessionRequests({
    api: async (...args) => {
      const result = await api(...args)
      if (args[0].endsWith('/abort')) firstAbort.resolve()
      return result
    },
    sessionForThread: thread => sessions[thread],
  })
  const active = controlled.enqueue('a', async context => {
    sending.resolve()
    await delivered.promise
    context.checkpoint()
    assert.fail('Additional Slack output started')
  })
  await sending.promise
  let confirmed = false
  const stopping = controlled.stop('a').then(result => { confirmed = true; return result })
  await firstAbort.promise
  assert.equal(confirmed, false)
  assert.ok(calls.some(call => call.path.endsWith('/abort')))
  delivered.resolve()
  assert.equal((await stopping).stopped, true)
  await active
  assert.equal(controlled.has('a'), false)
})

test('stop during first-session creation keeps the session but never submits a prompt', async () => {
  const { sessions, api, calls } = harness()
  delete sessions.a
  const requests = createSessionRequests({ api, sessionForThread: thread => sessions[thread] })
  const creating = deferred()
  const created = deferred()
  const request = requests.enqueue('a', async context => {
    creating.resolve()
    await created.promise
    context.sessionID = sessions.a = 'ses_new'
    context.checkpoint()
    await context.submit(() => assert.fail('Prompt submitted after stop'))
  })
  await creating.promise
  const stopping = requests.stop('a')
  created.resolve()
  assert.equal((await stopping).stopped, true)
  await request
  assert.equal(sessions.a, 'ses_new')
  assert.ok(calls.some(call => call.path === '/session/ses_new/abort'))
})

test('a prompt arriving after the first abort is aborted again before the next request may start', async () => {
  const submission = deferred()
  const submitting = deferred()
  const secondAbort = deferred()
  const secondAborting = deferred()
  const events = []
  let busy = true
  let aborts = 0
  const api = async path => {
    if (path === '/session/status') return busy ? { ses_a: { type: 'busy' } } : {}
    assert.equal(path, '/session/ses_a/abort')
    events.push('abort')
    if (++aborts === 2) { secondAborting.resolve(); await secondAbort.promise }
    busy = false
    return true
  }
  const requests = createSessionRequests({ api, sessionForThread: () => 'ses_a' })
  const active = requests.enqueue('a', async context => {
    await context.submit(async () => {
      submitting.resolve()
      await submission.promise
      busy = true
      events.push('late prompt accepted')
    })
    context.checkpoint()
  })
  await submitting.promise
  const stopping = requests.stop('a')
  const next = requests.enqueue('a', () => events.push('next request'))
  submission.resolve()
  await secondAborting.promise
  assert.equal(events.includes('next request'), false)
  secondAbort.resolve()
  await stopping
  await Promise.all([active, next])
  assert.deepEqual(events, ['abort', 'late prompt accepted', 'abort', 'next request'])
})

test('repeated stops share their operation and also remove work queued during interruption', async () => {
  const released = deferred()
  const started = deferred()
  const { sessions, api } = harness()
  const requests = createSessionRequests({ api, sessionForThread: thread => sessions[thread] })
  const active = requests.enqueue('a', async context => { started.resolve(); await released.promise; context.checkpoint() })
  await started.promise
  const firstPending = requests.enqueue('a', () => assert.fail('Old queued request ran'))
  const firstStop = requests.stop('a')
  const laterPending = requests.enqueue('a', () => assert.fail('Newly queued request ran after second stop'))
  const secondStop = requests.stop('a')
  assert.equal(firstStop, secondStop)
  released.resolve()
  assert.deepEqual(await firstStop, { stopped: true, cancelled: 2 })
  await Promise.all([active, firstPending, laterPending])
})

test('a skill modal acknowledged after stop cannot introduce its earlier request back into the queue', async () => {
  const requests = createSessionRequests({ api: async () => ({}), sessionForThread: () => undefined })
  const epoch = requests.epoch('thread')
  assert.deepEqual(await requests.stop('thread'), { stopped: false, cancelled: 0 })
  await requests.enqueue('thread', () => assert.fail('Stale modal request executed'), epoch)
  assert.equal(await requests.enqueue('thread', () => 'fresh request'), 'fresh request')
})

test('abort failures are not reported as success, and a retry can stop the still-busy session', async () => {
  let fail = true
  let busy = true
  const requests = createSessionRequests({
    sessionForThread: () => 'ses_a',
    api: async path => {
      if (path === '/session/status') return busy ? { ses_a: { type: 'busy' } } : {}
      if (fail) throw Error('Abort unavailable')
      busy = false
      return true
    },
    pause: async () => {},
  })
  const started = deferred()
  const active = requests.enqueue('thread', async context => { started.resolve(); await untilAborted(context); context.checkpoint() })
  await started.promise
  await assert.rejects(requests.stop('thread'), /Abort unavailable/)
  await active
  fail = false
  assert.equal((await requests.stop('thread')).stopped, true)
})

test('idle and unknown session states are distinguished, and a busy session must actually become idle', async () => {
  let status = {}
  let checks = 0
  const requests = createSessionRequests({
    sessionForThread: () => 'ses_a',
    api: async path => {
      if (path === '/session/status') { checks++; return status }
      return true
    },
    pause: async () => { status = {} },
  })
  assert.equal((await requests.stop('thread')).stopped, false)
  status = []
  await assert.rejects(requests.stop('thread'), /unavailable/)
  status = { ses_a: { type: 'retry' } }
  checks = 0
  assert.equal((await requests.stop('thread')).stopped, true)
  assert.equal(checks, 3)
})

test('a session that remains busy after abort is never reported as successfully stopped', async () => {
  let polls = 0
  const requests = createSessionRequests({
    sessionForThread: () => 'ses_a',
    api: async path => path === '/session/status' ? { ses_a: { type: 'busy' } } : true,
    pause: async () => { polls++ },
  })
  await assert.rejects(requests.stop('thread'), /could not be confirmed/)
  assert.equal(polls, 9)
})

test('stop is accepted as tracked continuation during restart drain and readiness waits for confirmation', async () => {
  const drain = createDrainController()
  const started = deferred()
  const abortConfirmed = deferred()
  let busy = true
  const requests = createSessionRequests({
    sessionForThread: () => 'ses_a',
    api: async path => {
      if (path === '/session/status') return busy ? { ses_a: { type: 'busy' } } : {}
      await abortConfirmed.promise
      busy = false
      return true
    },
  })
  drain.register('project', 4096, async () => ({ idle: !busy }))
  const result = requests.enqueue('thread', async context => { started.resolve(); await untilAborted(context); context.checkpoint() })
  const active = drain.track('request', () => result)
  await started.promise
  drain.begin('restart')
  const stopping = requests.stop('thread')
  const trackedStop = drain.track('stop', () => stopping)
  assert.equal((await drain.inspect()).ready, false)
  abortConfirmed.resolve()
  await Promise.all([active, trackedStop])
  assert.equal((await drain.inspect()).ready, true)
})

test('only the authorized member and channel may deliver an exact stop command, including before session creation', () => {
  const event = { type: 'message', channel: 'C_PROJECT', user: 'U095BV5RSTF', ts: '2', thread_ts: '1', text: '!stop' }
  assert.equal(acceptedText(event, 'B_BOT', true, 'C_PROJECT'), '!stop')
  assert.equal(acceptedText({ ...event, user: 'OTHER' }, 'B_BOT', true, 'C_PROJECT'), null)
  assert.equal(acceptedText(event, 'B_BOT', true, 'C_OTHER'), null)
  assert.equal(acceptedText({ ...event, bot_id: 'B_OTHER' }, 'B_BOT', true, 'C_PROJECT'), null)
  assert.equal(acceptedText({ ...event, text: '<@B_BOT> !stop', type: 'app_mention' }, 'B_BOT', false, 'C_PROJECT'), '!stop')
  assert.notEqual(acceptedText({ ...event, text: '!stopについて教えて' }, 'B_BOT', true, 'C_PROJECT'), '!stop')
})

test('multipart final delivery stops between Slack posts and interrupted notifications are distinct from failures', async () => {
  const messages = []
  const client = { chat: { postMessage: async message => { messages.push(message) } } }
  await assert.rejects(postCompletedAnswer(client, 'thread', 'a'.repeat(24001), 'C_PROJECT', () => {
    if (messages.length) throw new RequestInterruptedError()
  }), RequestInterruptedError)
  assert.equal(messages.length, 1)
  await notifyThread(client, 'thread', 'interrupted', '中断しました。', 'C_PROJECT')
  assert.ok(messages[1].text.includes('`interrupted`'))
  assert.equal(messages[1].channel, 'C_PROJECT')
})
