import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'

const url = letter => `https://example.org/${letter.toLowerCase()}`

async function fixture(t) {
  const db = new DatabaseSync(':memory:')
  t.after(() => db.close())
  db.exec(`CREATE TABLE reply (
    id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, occurred_us_at INTEGER NOT NULL CHECK (occurred_us_at >= 0),
    display_name TEXT, reference_url TEXT,
    CHECK ((status = 'pending' AND display_name IS NOT NULL AND reference_url IS NOT NULL)
        OR (status = 'done' AND display_name IS NULL AND reference_url IS NULL))
  ); CREATE INDEX reply_status_time ON reply(status, occurred_us_at)`)
  const { TaskService } = await import('../src/task-service.mjs')
  const service = new TaskService(db)
  return {
    pending: (time, letter = 'A', source = 'A', link = url(letter)) => service.markPending({
      source_id: source, occurred_us_at: time, display_name: `窓口${letter}`, reference_url: link,
    }),
    done: (time, source = 'A') => service.markDone({ source_id: source, occurred_us_at: time }),
    rows: () => db.prepare('SELECT id, source_id, status, occurred_us_at, display_name, reference_url FROM reply ORDER BY source_id').all().map(row => ({ ...row })),
  }
}

function expected(id, source, time, letter) {
  return { id, source_id: source, status: letter ? 'pending' : 'done', occurred_us_at: time,
    display_name: letter ? `窓口${letter}` : null, reference_url: letter ? url(letter) : null }
}

test('test_TaskServiceのmarkPendingは初回登録で用件IDを採番する_未登録のAに時刻10を指定すると整数IDを持つpendingが1件残る', async t => {
  const f = await fixture(t)
  await f.pending(10)
  const rows = f.rows()
  assert.ok(Number.isInteger(rows[0]?.id))
  assert.deepEqual(rows, [expected(rows[0].id, 'A', 10, 'A')])
})

test('test_TaskServiceのmarkDoneは既存用件を完了にする_Aのpending時刻10に完了時刻20を指定すると同じIDでdoneになり表示名とURLが消える', async t => {
  const f = await fixture(t)
  await f.pending(10)
  const [{ id }] = f.rows()
  await f.done(20)
  assert.deepEqual(f.rows(), [expected(id, 'A', 20)])
})

test('test_TaskServiceのmarkPendingは完了した用件を再開する_Aのdone時刻20に返信待ち時刻30を指定すると同じIDで参照先がBに変わる', async t => {
  const f = await fixture(t)
  await f.pending(10)
  const [{ id }] = f.rows()
  await f.done(20)
  await f.pending(30, 'B')
  assert.deepEqual(f.rows(), [expected(id, 'A', 30, 'B')])
})

test('test_TaskServiceのmarkPendingは返信待ち中の参照先を更新する_Aのpending時刻10に新しいURLと時刻20を指定すると同じIDに新しいURLと時刻が残る', async t => {
  const f = await fixture(t)
  await f.pending(10)
  const [{ id }] = f.rows()
  await f.pending(20, 'A', 'A', url('B'))
  assert.deepEqual(f.rows(), [{ ...expected(id, 'A', 20, 'A'), reference_url: url('B') }])
})

test('test_TaskServiceのmarkDoneは指定したsource_idだけを完了にする_AとBのうちAに時刻20を指定するとAはdoneになり別IDのBはpendingのまま残る', async t => {
  const f = await fixture(t)
  await f.pending(10)
  await f.pending(10, 'B', 'B')
  const [a, b] = f.rows()
  assert.notEqual(a.id, b.id)
  await f.done(20)
  assert.deepEqual(f.rows(), [expected(a.id, 'A', 20), expected(b.id, 'B', 10, 'B')])
})

test('test_TaskServiceのmarkDoneは未登録でも完了を記録する_Aの完了時刻20の後に返信待ち時刻10が届いても初回採番したIDでdoneが残る', async t => {
  const f = await fixture(t)
  await f.done(20)
  const [{ id }] = f.rows()
  assert.ok(Number.isInteger(id))
  assert.deepEqual(f.rows(), [expected(id, 'A', 20)])
  await f.pending(10)
  assert.deepEqual(f.rows(), [expected(id, 'A', 20)])
})

for (const [caseId, first, second] of [
  ['older-done', 'pending', 'done'], ['older-pending', 'pending', 'pending'], ['older-done-after-done', 'done', 'done'],
]) {
  test(`test_TaskServiceのmarkPendingとmarkDoneは古い操作を反映しない_保存時刻20に操作時刻10を指定しても保存行が変わらない [${caseId}]`, async t => {
    const f = await fixture(t)
    await f[first](20)
    const before = f.rows()
    assert.equal(before.length, 1)
    if (second === 'pending') await f.pending(10, 'B')
    else await f.done(10)
    assert.deepEqual(f.rows(), before)
  })
}

for (const kind of ['pending', 'done']) {
  test(`test_TaskServiceのmarkPendingとmarkDoneは再送で用件を増やさない_時刻10の同じ操作を2回受けても同じIDと内容の1件だけが残る [${kind}-replay]`, async t => {
    const f = await fixture(t)
    await f[kind](10)
    const before = f.rows()
    assert.equal(before.length, 1)
    await f[kind](10)
    assert.deepEqual(f.rows(), before)
  })
}

for (const [first, second] of [['pending', 'done'], ['done', 'pending']]) {
  test(`test_TaskServiceのmarkPendingとmarkDoneは同時刻なら完了を優先する_時刻10の両操作をどちらの順に受けても同じIDでdoneが残る [${first}-first]`, async t => {
    const f = await fixture(t)
    await f[first](10)
    const [{ id }] = f.rows()
    await f[second](10)
    assert.deepEqual(f.rows(), [expected(id, 'A', 10)])
  })
}
