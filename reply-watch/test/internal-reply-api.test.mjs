import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { createReplyServer } from '../src/server.mjs'
import { TaskService } from '../src/task-service.mjs'

const token = 'fixture-token'
const pending = time => ({ occurred_us_at: time, display_name: `窓口${time}`, reference_url: `https://example.org/${time}` })

async function fixture(t) {
  const db = new DatabaseSync(':memory:')
  t.after(() => db.close())
  db.exec(readFileSync(new URL('../migrations/001-init.sql', import.meta.url), 'utf8'))
  const service = new TaskService(db)
  const server = createReplyServer(db, { token })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => server[Symbol.asyncDispose]())
  function put(state, time, { auth = token, type = 'application/json' } = {}) {
    return fetch(`http://127.0.0.1:${server.address().port}/internal/reply/A/${state}`, {
      method: 'PUT', headers: { 'content-type': type, ...(auth && { authorization: `Bearer ${auth}` }) },
      body: JSON.stringify(state === 'pending' ? pending(time) : { occurred_us_at: time }),
    })
  }
  return { db, service, put, rows: () => db.prepare('SELECT * FROM reply').all().map(r => ({ ...r })) }
}

async function noContent(res) {
  assert.equal(res.status, 204)
  assert.equal(await res.text(), '')
}

test('test_PUTpendingは用件を登録する_未登録のAに時刻10を送ると204になり表示名とURLが保存される', async t => {
  const f = await fixture(t)
  await noContent(await f.put('pending', 10))
  const rows = f.rows()
  assert.ok(Number.isInteger(rows[0]?.id))
  assert.deepEqual(rows, [{ id: rows[0].id, source_id: 'A', status: 'pending', ...pending(10) }])
})

test('test_PUTpendingは用件を再開する_完了時刻20のAに時刻30を送ると204になり同じIDで新しいURLが保存される', async t => {
  const f = await fixture(t)
  f.service.markDone({ source_id: 'A', occurred_us_at: 20 })
  const [{ id }] = f.rows()
  await noContent(await f.put('pending', 30))
  assert.deepEqual(f.rows(), [{ id, source_id: 'A', status: 'pending', ...pending(30) }])
})

test('test_PUTdoneは用件を完了する_返信待ち時刻10のAに時刻20を送ると204になり表示情報が消える', async t => {
  const f = await fixture(t)
  f.service.markPending({ source_id: 'A', ...pending(10) })
  const [{ id }] = f.rows()
  await noContent(await f.put('done', 20))
  assert.deepEqual(f.rows(), [{ id, source_id: 'A', status: 'done', occurred_us_at: 20, display_name: null, reference_url: null }])
})

const failures = [
  ['test_内部PUTは認証失敗を拒否する_Aへのトークンなしまたは不一致の操作は401で保存行が変わらない', [
    ['missing', { auth: '' }], ['mismatch', { auth: 'wrong' }],
  ], 401, 'unauthorized'],
  ['test_内部PUTは不正な入力を拒否する_Aへの負の発生時刻は400で保存行が変わらない', [['negative', { time: -1 }]], 400, 'invalid_request'],
  ['test_内部PUTはJSON以外を拒否する_Aへのtext_plainの操作は415で保存行が変わらない', [['text', { type: 'text/plain' }]], 415, 'unsupported_media_type'],
  ['test_内部PUTは保存失敗を通知する_Aの更新を確定前に失敗させると503で元の行が残る', [['abort', { abort: true }]], 503, 'unavailable'],
]
for (const [name, cases, status, error] of failures) {
  for (const state of ['pending', 'done']) {
    for (const [label, options] of cases) {
      test(`${name} [${state}-${label}]`, async t => {
        const f = await fixture(t)
        f.service.markPending({ source_id: 'A', ...pending(10) })
        const before = f.rows()
        if (options.abort) f.db.exec(`CREATE TRIGGER abort_change AFTER UPDATE ON reply BEGIN SELECT RAISE(ABORT, 'fixture failure'); END`)
        const res = await f.put(state, options.time ?? 20, options)
        assert.equal(res.status, status)
        assert.deepEqual(await res.json(), { error })
        assert.equal(f.db.isTransaction, false)
        assert.deepEqual(f.rows(), before)
      })
    }
  }
}
