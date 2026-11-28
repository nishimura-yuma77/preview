import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { TaskService } from '../src/task-service.mjs'

async function fixture(t) {
  const db = new DatabaseSync(':memory:')
  t.after(() => { if (db.isOpen) db.close() })
  db.exec(readFileSync(new URL('../migrations/001-init.sql', import.meta.url), 'utf8'))
  const { createReplyServer } = await import('../src/server.mjs')
  const server = createReplyServer(db)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => server[Symbol.asyncDispose]())
  const endpoint = `http://127.0.0.1:${server.address().port}/task/api/pending`
  return { get: () => fetch(endpoint), db, service: new TaskService(db) }
}

test('test_GET返信待ち一覧は返信待ちだけを設計順に返す_A10とB20とC20と完了D30ならBとCとAの表示名とURLが返る', async t => {
  const { get, service } = await fixture(t)
  for (const [source_id, occurred_us_at] of [['A', 10], ['B', 20], ['C', 20]]) {
    service.markPending({ source_id, occurred_us_at, display_name: `窓口${source_id}`, reference_url: `https://example.org/${source_id}` })
  }
  service.markDone({ source_id: 'D', occurred_us_at: 30 })
  const res = await get()
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('content-type')?.split(';')[0], 'application/json')
  assert.equal(res.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await res.json(), { items: [
    { display_name: '窓口B', reference_url: 'https://example.org/B' },
    { display_name: '窓口C', reference_url: 'https://example.org/C' },
    { display_name: '窓口A', reference_url: 'https://example.org/A' },
  ] })
})

test('test_GET返信待ち一覧は0件を正常に返す_用件が0件なら200と空のitemsが返る', async t => {
  const { get } = await fixture(t)
  const res = await get()
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { items: [] })
})

test('test_GET返信待ち一覧は読取失敗を空一覧と区別する_DB接続を閉じて取得すると503とunavailableが返る', async t => {
  const { get, db } = await fixture(t)
  db.close()
  const res = await get()
  assert.equal(res.status, 503)
  assert.deepEqual(await res.json(), { error: 'unavailable' })
})
