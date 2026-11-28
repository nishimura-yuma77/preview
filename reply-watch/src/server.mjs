import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { registerReply } from './routes.mjs'
import { TaskService } from './task-service.mjs'

export function createReplyServer(db, { token } = {}) {
  const service = new TaskService(db)
  return createServer((req, res) => {
    const path = req.url.split('?')[0]
    const internal = /^\/internal\/reply\/([^/]*)\/(pending|done)$/.exec(path)
    if (req.method === 'PUT' && internal) {
      return registerReply(req, res, service, token, internal[1], internal[2])
    }
    if (req.method !== 'GET' || path !== '/task/api/pending') {
      res.writeHead(404).end()
      return
    }
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    let items
    try {
      items = service.listPending()
    } catch {
      res.writeHead(503).end(JSON.stringify({ error: 'unavailable' }))
      return
    }
    res.end(JSON.stringify({ items }))
  })
}

if (import.meta.main) {
  const token = process.env.REPLY_WATCH_TOKEN
  if (!token) throw new Error('REPLY_WATCH_TOKEN is required')
  const db = new DatabaseSync(process.env.REPLY_WATCH_DB ?? new URL('../data/tasks.sqlite', import.meta.url))
  createReplyServer(db, { token }).listen(Number(process.env.REPLY_WATCH_PORT ?? 8787), '127.0.0.1')
}
