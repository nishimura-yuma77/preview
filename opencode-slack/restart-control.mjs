import { randomUUID } from 'node:crypto'
import { chmod, lstat, unlink } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createConnection } from 'node:net'

export const restartSocket = '/srv/opencode-slack/restart-control.sock'
export const drainingMessage = '再起動に向けて処理の完了を待っています。新しい依頼は再起動後に再送してください。'

class RestartConflictError extends Error {}

export function createDrainController() {
  const instance = randomUUID()
  const probes = new Map()
  const tasks = new Map()
  let token = null
  let sealed = false
  let revision = 0

  function track(label, task) {
    if (sealed) return Promise.resolve()
    revision++
    tasks.set(label, (tasks.get(label) ?? 0) + 1)
    return Promise.resolve().then(task).finally(() => {
      revision++
      const remaining = tasks.get(label) - 1
      if (remaining) tasks.set(label, remaining)
      else tasks.delete(label)
    })
  }

  return {
    instance,
    get draining() { return token !== null },
    get sealed() { return sealed },
    track,
    admit(label, task, reject) {
      // Admission and accounting happen synchronously, before a request enters its thread queue.
      return token === null ? track(label, task) : Promise.resolve().then(reject)
    },
    register(name, port, probe) { probes.set(name, { port, probe }) },
    begin(owner) {
      if (!owner || (token !== null && token !== owner)) throw new RestartConflictError('Another restart owns the drain.')
      if (token !== owner) revision++
      token = owner
    },
    resume(owner) {
      if (token !== owner) throw new RestartConflictError('Restart ownership does not match.')
      revision++
      token = null
      sealed = false
    },
    async inspect() {
      const checkedRevision = revision
      const projects = await Promise.all([...probes].map(async ([name, { port, probe }]) => {
        try {
          const result = await probe()
          return { name, port, ...result }
        } catch {
          return { name, port, idle: false, error: 'OpenCode state unavailable' }
        }
      }))
      const pending = Object.fromEntries(tasks)
      const ready = token !== null && projects.length > 0 && projects.every(project => project.idle === true) &&
        tasks.size === 0 && revision === checkedRevision
      // Once ready, background polling and late modal callbacks cannot start more work.
      if (ready) sealed = true
      return { protocol: 1, instance, pid: process.pid, draining: token !== null, token, ready, pending, projects }
    },
  }
}

export async function openCodeActivity(api, pendingNoticeCount = () => 0) {
  const [status, permissions, questions] = await Promise.all(
    ['/session/status', '/permission', '/question'].map(path => api(path, undefined, 4000)),
  )
  if (!status || typeof status !== 'object' || Array.isArray(status) || !Array.isArray(permissions) || !Array.isArray(questions)) {
    throw Error('Invalid OpenCode state.')
  }
  const states = Object.values(status)
  if (states.some(state => !state || !['idle', 'busy', 'retry'].includes(state.type))) throw Error('Invalid session status.')
  const busySessions = states.filter(state => state.type !== 'idle').length
  const pendingNotices = pendingNoticeCount()
  if (!Number.isSafeInteger(pendingNotices) || pendingNotices < 0) throw Error('Invalid pending notification count.')
  return {
    idle: busySessions === 0 && permissions.length === 0 && questions.length === 0 && pendingNotices === 0,
    busySessions, permissions: permissions.length, questions: questions.length, pendingNotices,
  }
}

async function removeStaleSocket(path) {
  try {
    const info = await lstat(path)
    if (!info.isSocket() || info.uid !== process.getuid()) throw Error('Unexpected restart socket owner or type.')
    await new Promise((resolve, reject) => {
      const client = createConnection(path)
      client.once('connect', () => { client.destroy(); reject(Error('Restart control is already running.')) })
      client.once('error', error => error.code === 'ECONNREFUSED' || error.code === 'ENOENT' ? resolve() : reject(error))
    })
    await unlink(path).catch(error => { if (error.code !== 'ENOENT') throw error })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

export async function startRestartControl(drain, path = restartSocket) {
  await removeStaleSocket(path)
  const server = createServer(async (request, response) => {
    const reply = (status, data) => {
      response.writeHead(status, { 'Content-Type': 'application/json', Connection: 'close' })
      response.end(JSON.stringify(data))
    }
    try {
      if (request.method === 'GET' && request.url === '/status') return reply(200, await drain.inspect())
      if (request.method !== 'POST' || !['/drain', '/resume'].includes(request.url)) return reply(404, { error: 'Not found' })
      const owner = request.headers['x-restart-token']
      if (request.headers['x-bridge-instance'] !== drain.instance || typeof owner !== 'string' || !/^[a-f0-9]{32}$/.test(owner)) {
        return reply(409, { error: 'Invalid restart owner or bridge instance' })
      }
      if (request.url === '/drain') drain.begin(owner)
      else drain.resume(owner)
      return reply(200, await drain.inspect())
    } catch (error) {
      return reply(error instanceof RestartConflictError ? 409 : 503, { error: 'Restart control request failed' })
    }
  })
  server.requestTimeout = 10000
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(path, resolve)
  })
  await chmod(path, 0o600)
  return server
}
