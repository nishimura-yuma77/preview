import { createServer } from 'node:http'

export function createReplyServer() {
  return createServer((_req, res) => res.writeHead(404).end())
}
