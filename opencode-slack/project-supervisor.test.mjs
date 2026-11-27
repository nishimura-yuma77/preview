import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { setTimeout as sleep, setImmediate as tick } from 'node:timers/promises'
import { test } from 'node:test'
import { superviseProject } from './project-supervisor.mjs'

async function until(check) {
  for (let i = 0; i < 100; i++) {
    if (check()) return
    await tick()
  }
  assert.fail('Expected supervisor state was not reached')
}

function harness(options = {}) {
  const children = []
  const delays = []
  const supervisor = superviseProject({
    name: 'test', log: () => {},
    spawn: () => {
      const child = new EventEmitter()
      child.kills = 0
      child.kill = () => { child.kills++; queueMicrotask(() => child.emit('exit', null, 'SIGKILL')) }
      children.push(child)
      return child
    },
    health: async () => {},
    pause: async (delay, value, { signal } = {}) => {
      delays.push(delay)
      signal?.throwIfAborted()
      await tick()
    },
    ...options,
  })
  return { supervisor, children, delays }
}

test('one child exiting restarts only that project while the other stays ready', async () => {
  const first = harness()
  const other = harness()
  try {
    await until(() => first.supervisor.ready && other.supervisor.ready)
    first.children[0].emit('exit', 1)
    await until(() => first.children.length === 2 && first.supervisor.ready)
    assert.equal(other.children.length, 1)
    assert.equal(other.children[0].kills, 0)
    assert.equal(other.supervisor.ready, true)
    assert.ok(first.delays.includes(1000))
  } finally {
    first.supervisor.stop()
    other.supervisor.stop()
    await Promise.all([first.supervisor.done, other.supervisor.done])
  }
})

test('spawn errors and repeated crashes use increasing backoff rather than terminating the parent', async () => {
  const h = harness()
  try {
    await until(() => h.supervisor.ready)
    h.children[0].emit('error', Error('spawn failed'))
    await until(() => h.children.length === 2 && h.supervisor.ready)
    h.children[1].emit('exit', 1)
    await until(() => h.children.length === 3 && h.supervisor.ready)
    assert.deepEqual(h.delays, [1000, 2000])
  } finally {
    h.supervisor.stop()
    await h.supervisor.done
  }
})

test('a child that never becomes healthy is killed before another child is started', async () => {
  let probes = 0
  const h = harness({ startupAttempts: 2, health: async () => {
    if (++probes <= 2) throw Error('unavailable')
  } })
  try {
    await until(() => h.children.length === 2 && h.supervisor.ready)
    assert.equal(h.children[0].kills, 1)
  } finally {
    h.supervisor.stop()
    await h.supervisor.done
  }
})

test('waiting for an unavailable project is abortable and shutdown never respawns its child', async () => {
  const h = harness({ health: () => new Promise(() => {}), pause: sleep })
  const controller = new AbortController()
  const waiting = h.supervisor.waitReady(controller.signal)
  controller.abort()
  await assert.rejects(waiting, { name: 'AbortError' })
  h.supervisor.stop()
  await h.supervisor.done
  assert.equal(h.children.length, 1)
  assert.equal(h.children[0].kills, 1)
  assert.equal(h.supervisor.ready, false)
})
