import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createProjectApp } from './project-routing.mjs'
import { acceptedText, matchesApproval, notifyThread, postCompletedAnswer } from './bridge.mjs'

const projects = [
  { name: 'seijinbu', channelId: 'C_SEIJINBU' },
  { name: 'hiromeru', channelId: 'C_HIROMERU' },
  { name: 'professor-jk', channelId: 'C_PROFESSOR_JK' },
]

function harness() {
  const listeners = { event: [], action: [], view: [] }
  const app = { client: {} }
  for (const type of Object.keys(listeners)) {
    app[type] = (constraint, handler) => listeners[type].push({ constraint, handler })
  }
  return {
    scoped: projects.map(project => createProjectApp(app, project)),
    async dispatch(type, constraint, args) {
      await Promise.all(listeners[type].filter(listener => listener.constraint === constraint).map(({ handler }) => handler(args)))
    },
  }
}

test('a channel event reaches only its assigned project', async () => {
  const { scoped, dispatch } = harness()
  const received = []
  scoped.forEach((app, i) => app.event('message', () => received.push(projects[i].name)))
  await dispatch('event', 'message', { event: { channel: 'C_HIROMERU' } })
  await dispatch('event', 'message', { event: { channel: 'C_UNKNOWN' } })
  assert.deepEqual(received, ['hiromeru'])
  await dispatch('event', 'message', { event: { channel: 'C_SEIJINBU' } })
  assert.deepEqual(received, ['hiromeru', 'seijinbu'])
  await dispatch('event', 'message', { event: { channel: 'C_PROFESSOR_JK' } })
  assert.deepEqual(received, ['hiromeru', 'seijinbu', 'professor-jk'])
})

test('a channel action is acknowledged exactly once by its owning project', async () => {
  const { scoped, dispatch } = harness()
  const received = []
  let acknowledgements = 0
  scoped.forEach((app, i) => app.action('approve', async ({ ack }) => {
    await ack()
    received.push(projects[i].name)
  }))
  const args = { action: { value: 'hiromeru:request' }, body: { channel: { id: 'C_HIROMERU' } }, ack: async () => { acknowledgements++ } }
  await dispatch('action', 'approve', args)
  assert.equal(acknowledgements, 1)
  assert.deepEqual(received, ['hiromeru'])
  await dispatch('action', 'approve', { ...args, body: { channel: { id: 'C_SEIJINBU' } } })
  assert.equal(acknowledgements, 1)
})

test('modal pagination routes by private metadata rather than its numeric action value', async () => {
  const { scoped, dispatch } = harness()
  const received = []
  scoped.forEach((app, i) => app.action('next', () => received.push(projects[i].name)))
  await dispatch('action', 'next', { action: { value: '1' }, body: { view: { private_metadata: 'hiromeru:patch' } } })
  assert.deepEqual(received, ['hiromeru'])
})

test('question and skill modal submissions without a channel reach only the owner', async () => {
  const { scoped, dispatch } = harness()
  const received = []
  scoped.forEach((app, i) => app.view('answer', () => received.push(projects[i].name)))
  await dispatch('view', 'answer', { view: { private_metadata: 'hiromeru:question' } })
  await dispatch('view', 'answer', { view: { private_metadata: 'seijinbu:skill' } })
  await dispatch('view', 'answer', { view: { private_metadata: 'unknown:question' } })
  assert.deepEqual(received, ['hiromeru', 'seijinbu'])
})

test('accepted messages and approval requests enforce the configured channel and member', () => {
  const event = { channel: 'C_HIROMERU', user: 'U095BV5RSTF', ts: '123.456', type: 'app_mention', text: '<@B_BOT> !p hello' }
  assert.equal(acceptedText(event, 'B_BOT', false, 'C_HIROMERU'), '!p hello')
  assert.equal(acceptedText(event, 'B_BOT', false, 'C_SEIJINBU'), null)
  assert.equal(acceptedText({ ...event, user: 'OTHER' }, 'B_BOT', false, 'C_HIROMERU'), null)
  const request = { thread: '123.456', sessionID: 'ses_h', statusTs: '123.457' }
  const body = { user: { id: 'U095BV5RSTF' }, channel: { id: 'C_HIROMERU' }, container: { message_ts: '123.457' }, message: { thread_ts: '123.456' } }
  assert.equal(matchesApproval(body, request, { '123.456': 'ses_h' }, 'C_HIROMERU'), true)
  assert.equal(matchesApproval(body, request, { '123.456': 'ses_h' }, 'C_SEIJINBU'), false)
  assert.equal(matchesApproval(body, request, { '123.456': 'ses_other' }, 'C_HIROMERU'), false)
})

test('failure notifications and multipart answers stay in the requested channel and thread', async () => {
  const sent = []
  const client = { chat: { postMessage: async message => { sent.push(message) } } }
  await notifyThread(client, '123.456', 'failed', 'detail', 'C_HIROMERU')
  await postCompletedAnswer(client, '123.456', 'a'.repeat(24001), 'C_HIROMERU')
  assert.equal(sent.length, 4)
  assert.ok(sent.every(message => message.channel === 'C_HIROMERU' && message.thread_ts === '123.456'))
})
