import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { createRequestQueue, createStateSaver } from './request-queue.mjs'

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

test('a second thread completes while the first thread is still running', async () => {
  const enqueue = createRequestQueue()
  const started = deferred()
  const release = deferred()
  let finished = false
  const first = enqueue('a', async () => {
    started.resolve()
    await release.promise
    finished = true
  })
  await started.promise
  try {
    assert.equal(await enqueue('b', () => 'second reply'), 'second reply')
    assert.equal(finished, false)
  } finally {
    release.resolve()
    await first
  }
})

test('requests in one thread run in submission order without overlap', async () => {
  const enqueue = createRequestQueue()
  const started = deferred()
  const release = deferred()
  const events = []
  const first = enqueue('a', async () => {
    events.push('first start')
    started.resolve()
    await release.promise
    events.push('first end')
  })
  await started.promise
  const second = enqueue('a', () => events.push('second'))
  await enqueue('b', () => {})
  assert.deepEqual(events, ['first start'])
  release.resolve()
  await Promise.all([first, second])
  assert.deepEqual(events, ['first start', 'first end', 'second'])
})

test('a failed request rejects its caller and does not block queued or future requests', async () => {
  const enqueue = createRequestQueue()
  const failure = enqueue('a', () => { throw Error('request failed') })
  const next = enqueue('a', () => 'queued')
  await assert.rejects(failure, /request failed/)
  assert.equal(await next, 'queued')
  assert.equal(await enqueue('a', () => 'later'), 'later')
})

test('one thread failing does not interrupt another running thread', async () => {
  const enqueue = createRequestQueue()
  const started = deferred()
  const release = deferred()
  const running = enqueue('a', async () => {
    started.resolve()
    await release.promise
    return 'completed'
  })
  await started.promise
  try {
    await assert.rejects(enqueue('b', () => { throw Error('other thread failed') }), /other thread failed/)
  } finally {
    release.resolve()
  }
  assert.equal(await running, 'completed')
})

test('concurrent saves preserve all sessions in a private, valid state file', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'slack-state-'))
  try {
    const file = pathToFileURL(join(directory, 'sessions.json'))
    const state = { sessions: {}, received: [] }
    const save = createStateSaver(file, () => state)
    await Promise.all(Array.from({ length: 50 }, async (_, i) => {
      state.sessions[`thread-${i}`] = `session-${i}`
      state.received.push(`event-${i}`)
      await save()
    }))
    assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), state)
    assert.equal((await stat(file)).mode & 0o777, 0o600)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('a persistence failure does not prevent a later save', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'slack-state-'))
  try {
    const file = pathToFileURL(join(directory, 'sessions.json'))
    let fail = true
    const save = createStateSaver(file, () => {
      if (fail) throw Error('serialization failed')
      return { sessions: { a: 'session-a' }, received: [] }
    })
    await assert.rejects(save(), /serialization failed/)
    fail = false
    await save()
    assert.equal(JSON.parse(await readFile(file, 'utf8')).sessions.a, 'session-a')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('two project state files in one directory can be saved concurrently without mixing sessions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'slack-project-states-'))
  try {
    const files = ['sessions.json', 'sessions-hiromeru.json'].map(name => pathToFileURL(join(directory, name)))
    const states = [{ sessions: { sameThread: 'ses_s' }, received: ['seijinbu'] }, { sessions: { sameThread: 'ses_h' }, received: ['hiromeru'] }]
    const savers = files.map((file, i) => createStateSaver(file, () => states[i]))
    await Promise.all(Array.from({ length: 30 }, () => Promise.all(savers.map(save => save()))))
    for (const [i, file] of files.entries()) assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), states[i])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
