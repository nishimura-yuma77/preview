import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { once } from 'node:events'
import { setTimeout as wait } from 'node:timers/promises'
import { createReplyServer } from '../reply-watch/src/server.mjs'
import { createReplyWatch } from './reply-watch.mjs'

test('tracked final answer, third-party reply, and recovered final answer update one real API item', async t => {
  const db = new DatabaseSync(':memory:')
  db.exec(readFileSync(new URL('../reply-watch/migrations/001-init.sql', import.meta.url), 'utf8'))
  const token = 'integration-fixture'
  const api = createReplyServer(db, { token })
  api.listen(0, '127.0.0.1'); await once(api, 'listening')
  t.after(async () => { await api[Symbol.asyncDispose](); db.close() })
  const notices = []
  const client = { conversations: { info: async () => ({ channel: { name: 'butler' } }) },
    chat: { postMessage: async message => notices.push(message), getPermalink: async ({ message_ts }) => ({ permalink: `https://example.slack.com/${message_ts}` }) } }
  const state = {}, port = api.address().port
  const options = { state, save: async () => {}, client, port, token, team: 'T1', channel: 'C1', bot: 'U0', onError: e => assert.fail(e.message) }
  const watch = createReplyWatch(options)
  const thread = '1800000000.000001'
  const event = { type: 'message', user: 'U3', channel: 'C1', thread_ts: thread, ts: '1800000002.000001' }
  await watch.human(event)
  assert.deepEqual(state.replyWatch.outbox, {})
  watch.track(thread)
  const key = `slack_T1_C1_1800000000_000001`
  async function check(ts, status) {
    for (let i = 0; i < 200 && Object.keys(state.replyWatch.outbox).length; i++) await wait(10)
    const row = db.prepare('SELECT * FROM reply').get()
    assert.equal(row.source_id, key); assert.equal(row.status, status); assert.equal(row.occurred_us_at, Number(ts.replace('.', '')))
    const { items } = await (await fetch(`http://127.0.0.1:${port}/task/api/pending`)).json()
    assert.deepEqual(items, status === 'done' ? [] : [{ display_name: '#butler', reference_url: `https://example.slack.com/${ts}` }])
    return row.id
  }
  const first = '1800000001.000001'
  const firstPeriod = watch.period(thread)
  await watch.final(thread, first, firstPeriod)
  const id = await check(first, 'pending')
  await watch.human({ ...event, bot_id: 'B1' }); await watch.human({ ...event, subtype: 'message_changed' })
  await check(first, 'pending')
  await watch.human(event)
  assert.equal(await check(event.ts, 'done'), id)
  const next = '1800000003.000001'
  state.replyWatch.outbox[thread] = { ts: next, status: 'pending' }
  createReplyWatch(options)
  assert.equal(await check(next, 'pending'), id)
  const end = { ...event, ts: '1800000004.000001', text: ' !e ' }
  await watch.end(end)
  assert.equal(await check(end.ts, 'done'), id)
  const recovered = createReplyWatch(options)
  recovered.track(thread, '1800000005.000001')
  await recovered.end(end)
  await recovered.final(thread, '1800000006.000001', firstPeriod)
  await check(end.ts, 'done')
  await recovered.final(thread, '1800000007.000001', recovered.period(thread))
  await check('1800000007.000001', 'pending')
  await recovered.end({ ...end, text: '!end', ts: '1800000008.000001' })
  await check('1800000008.000001', 'done')
  assert.deepEqual(notices, Array(2).fill({ channel: 'C1', thread_ts: thread, text: 'クローズしました。再開には再度メンションしてください。' }))
})
