import { timingSafeEqual } from 'node:crypto'

const error = (res, status, code) => res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: code }))

function authorized(header, token) {
  if (!token || !header) return false
  const actual = Buffer.from(header)
  const expected = Buffer.from(`Bearer ${token}`)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

async function readBody(req) {
  const chunks = []
  let length = 0
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    length += chunk.length
    if (length > 1024 * 1024) {
      req.resume()
      throw new Error('Oversized JSON')
    }
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function validBody(body, state) {
  if (!body || !Number.isSafeInteger(body.occurred_us_at) || body.occurred_us_at < 0) return false
  if (state === 'done') return Object.keys(body).length === 1
  return Object.keys(body).length === 3 && typeof body.display_name === 'string' && body.display_name.trim() !== '' &&
    typeof body.reference_url === 'string' && URL.parse(body.reference_url)?.protocol === 'https:'
}

export async function registerReply(req, res, service, token, source_id, state) {
  if (!authorized(req.headers.authorization, token)) return error(res, 401, 'unauthorized')
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return error(res, 415, 'unsupported_media_type')
  }
  if (!/^[A-Za-z0-9_-]{1,255}$/.test(source_id)) return error(res, 400, 'invalid_request')
  let body
  try {
    body = await readBody(req)
  } catch {
    return error(res, 400, 'invalid_request')
  }
  if (!validBody(body, state)) return error(res, 400, 'invalid_request')
  try {
    if (state === 'pending') service.markPending({ source_id, ...body })
    else service.markDone({ source_id, ...body })
  } catch {
    return error(res, 503, 'unavailable')
  }
  res.writeHead(204).end()
}
