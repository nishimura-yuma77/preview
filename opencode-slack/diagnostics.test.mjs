import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, stat, symlink, utimes, writeFile } from 'node:fs/promises'
import { PassThrough } from 'node:stream'
import { setTimeout as sleep } from 'node:timers/promises'
import { test } from 'node:test'
import { join } from 'node:path'
import { createDiagnostics, createRedactor, createFailureTracker, withLogContext, captureChildDiagnostics } from './diagnostics.mjs'

async function fixture(t, options = {}) {
  const directory = await mkdtemp('/tmp/opencode/diagnostics-')
  const logs = createDiagnostics({ directory, maintenanceMs: 0, ...options })
  t.after(async () => { await logs.close(); await rm(directory, { recursive: true, force: true }) })
  return { directory, logs }
}

test('nested secrets, credentials, payloads and Error causes are removed without losing diagnostic metadata', () => {
  const clean = createRedactor(['known-password'])
  const error = Object.assign(new Error('known-password Bearer topsecret'), { cause: new Error('network down'), status: 503,
    data: { error: 'ratelimited', messages: ['PRIVATE'] } })
  const result = clean({ error, input: 'PRIVATE', prompt: 'PRIVATE', nested: { headers: { Authorization: 'PRIVATE' }, output: 'PRIVATE' },
    details: 'xoxb-abc123 https://user:pass@example.com/?token=secret' })
  const json = JSON.stringify(result)
  for (const secret of ['known-password', 'topsecret', 'PRIVATE', 'abc123', 'user:pass', 'token=secret']) assert.ok(!json.includes(secret), secret)
  assert.equal(result.error.cause.message, 'network down')
  assert.equal(result.error.status, 503)
  assert.equal(result.error.slackCode, 'ratelimited')
  assert.match(result.error.stack, /Error/)
})

test('parallel requests retain separate context, valid JSON and private file permissions', async t => {
  const { logs, directory } = await fixture(t)
  await Promise.all(['one', 'two'].map(requestID => withLogContext({ requestID, sessionID: `ses-${requestID}` }, async () => {
    await sleep(requestID === 'one' ? 5 : 0)
    logs.emit('ERROR', 'request.failed', { error: new Error('offline') })
  })))
  await logs.flush()
  const path = join(directory, 'bridge.current.jsonl')
  const records = (await readFile(path, 'utf8')).trim().split('\n').map(JSON.parse)
  assert.equal(records.length, 2)
  assert.deepEqual(new Set(records.map(record => record.requestID)), new Set(['one', 'two']))
  for (const record of records) assert.equal(record.sessionID, `ses-${record.requestID}`)
  assert.equal((await stat(directory)).mode & 0o777, 0o700)
  assert.equal((await stat(path)).mode & 0o777, 0o600)
})

test('size rotation and reopening retain at most ten bounded files, including multi-byte oversized records', async t => {
  const { logs, directory } = await fixture(t, { maxBytes: 1024 })
  for (let i = 0; i < 35; i++) { logs.emit('ERROR', 'failure', { error: new Error('あ'.repeat(12000)) }); await logs.flush() }
  assert.equal((await readdir(directory)).length, 10)
  await logs.close()
  const next = createDiagnostics({ directory, maxBytes: 1024, maintenanceMs: 0 })
  t.after(() => next.close())
  next.emit('INFO', 'after.restart', { value: 'z'.repeat(900) })
  await next.flush()
  const files = await readdir(directory)
  assert.equal(files.length, 10)
  for (const file of files) {
    assert.ok((await stat(join(directory, file))).size <= 1024)
    for (const line of (await readFile(join(directory, file), 'utf8')).trim().split('\n')) JSON.parse(line)
  }
})

test('a date change rotates the active file and expired archives are deleted after restart', async t => {
  let time = Date.now()
  const { logs, directory } = await fixture(t, { now: () => time })
  logs.emit('INFO', 'first'); await logs.flush()
  time += 86400000
  logs.emit('INFO', 'second'); await logs.flush()
  assert.equal((await readdir(directory)).length, 2)
  const archive = (await readdir(directory)).find(file => file.includes('archive'))
  const old = new Date(time - 15 * 86400000)
  await utimes(join(directory, archive), old, old)
  await utimes(join(directory, 'bridge.current.jsonl'), new Date(time), new Date(time))
  await logs.close()
  const next = createDiagnostics({ directory, now: () => time, maintenanceMs: 0 })
  t.after(() => next.close())
  next.emit('INFO', 'restart'); await next.flush()
  assert.deepEqual(await readdir(directory), ['bridge.current.jsonl'])
})

test('idle maintenance removes expired archives even for a retired project', async t => {
  const { directory } = await fixture(t)
  const path = join(directory, 'opencode-retired.archive-0000000000000001-test.jsonl')
  await writeFile(path, '{}\n')
  const old = new Date(Date.now() - 15 * 86400000)
  await utimes(path, old, old)
  const logs = createDiagnostics({ directory, maintenanceMs: 5 })
  t.after(() => logs.close())
  for (let i = 0; i < 50 && (await readdir(directory)).includes(path.split('/').at(-1)); i++) await sleep(5)
  assert.ok(!(await readdir(directory)).includes(path.split('/').at(-1)))
})

test('queue memory remains bounded during a burst and drops are summarized', async t => {
  const { logs, directory } = await fixture(t, { queueBytes: 2048 })
  for (let i = 0; i < 1000; i++) logs.emit('INFO', 'burst', { value: 'x'.repeat(400) })
  assert.ok(logs.queuedBytes <= 2048)
  assert.ok(logs.droppedRecords > 0)
  await logs.flush()
  const records = (await readFile(join(directory, 'bridge.current.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse)
  assert.ok(records.some(record => record.event === 'logging.records_dropped' && record.count > 0))
})

test('disk errors do not reject flush, flood stderr or permanently disable a later successful write', async t => {
  const directory = await mkdtemp('/tmp/opencode/diagnostics-failure-')
  t.after(() => rm(directory, { recursive: true, force: true }))
  const path = join(directory, 'not-directory')
  await writeFile(path, 'unchanged')
  let fallback = 0
  const logs = createDiagnostics({ directory: path, maintenanceMs: 0, fallback: () => fallback++ })
  t.after(() => logs.close())
  for (let i = 0; i < 10; i++) logs.emit('ERROR', 'failure')
  await logs.flush()
  assert.equal(fallback, 1)
  await rm(path)
  logs.emit('INFO', 'recovered'); await logs.flush()
  assert.match(await readFile(join(path, 'bridge.current.jsonl'), 'utf8'), /recovered/)
})

test('a symlink cannot redirect logs into another file', async t => {
  const { logs, directory } = await fixture(t, { fallback() {} })
  const target = join(directory, 'private.txt')
  await writeFile(target, 'unchanged')
  await symlink(target, join(directory, 'bridge.current.jsonl'))
  logs.emit('ERROR', 'failure'); await logs.flush()
  assert.equal(await readFile(target, 'utf8'), 'unchanged')
})

test('repeated monitor failures are aggregated, then emit one recovery with the full count', () => {
  let now = 0
  const records = []
  const tracker = createFailureTracker((...record) => records.push(record), { now: () => now })
  for (let i = 0; i < 30; i++) { tracker.fail('monitor', Error('network')); now += 2000 }
  tracker.fail('monitor', Error('network'))
  tracker.recover('monitor'); tracker.recover('monitor')
  assert.equal(records.length, 3)
  assert.equal(records[2][1], 'monitor.recovered')
  assert.equal(records[2][2].count, 31)
  assert.equal(records[2][2].elapsedMs, 60000)
})

test('child stderr accepts diagnostics only and bounds unterminated lines while recovering at the next newline', async t => {
  const { logs, directory } = await fixture(t)
  const stream = new PassThrough()
  captureChildDiagnostics(stream, 'hiromeru', logs)
  stream.write('INFO arbitrary PRIVATE\nPRIVATE continuation\n')
  stream.write('ERROR service=session sessionID=ses_example error={"name":"APIError","message":"network failed","body":"PRIVATE"}\n')
  stream.write('ERROR service=session ' + 'x'.repeat(100000))
  stream.write('\nWARN service=server name=TimeoutError\n')
  stream.end()
  await sleep(0); await logs.flush()
  const text = await readFile(join(directory, 'opencode-hiromeru.current.jsonl'), 'utf8')
  assert.ok(!text.includes('PRIVATE'))
  assert.ok(text.includes('network failed'))
  assert.ok(text.includes('opencode.line_truncated'))
  assert.ok(text.includes('TimeoutError'))
})
