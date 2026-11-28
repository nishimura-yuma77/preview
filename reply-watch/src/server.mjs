import { createServer } from 'node:http'
import { TaskService } from './task-service.mjs'

export function createReplyServer(db) {
  const service = new TaskService(db)
  return createServer((req, res) => {
    if (req.method !== 'GET' || req.url.split('?')[0] !== '/task/api/pending') {
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
