import { channel } from 'node:diagnostics_channel'
import { writeSync } from 'node:fs'
import { createRedactor, diagnostic } from './diagnostics.mjs'

// Subscribe before loading the bridge and SDKs. These channels are shared by
// Node's bundled Undici and npm Undici; the creation stack identifies the source.
export function installUndiciTracing() {
  const redact = createRedactor()
  const identities = new WeakMap()
  const active = new Map()
  const recent = []
  let sequence = 0
  const safe = handler => message => {
    try { handler(message) } catch { /* Diagnostics must not crash the bridge. */ }
  }
  function location(value) {
    try {
      const url = new URL(String(value))
      return `${url.origin}${url.pathname.replace(/\/(?:ses_|msg_)[^/]+/g, '/:id')}`
    } catch { return '[unavailable]' }
  }
  function stack() {
    const previous = Error.stackTraceLimit
    try {
      Error.stackTraceLimit = 32
      return new Error('Undici request creation').stack
        .replace(/https?:\/\/[^\s)]+/g, location)
    } finally { Error.stackTraceLimit = previous }
  }
  function emit(event, record, extra = {}) {
    diagnostic('INFO', event, { pid: process.pid, ...record, ...extra })
  }
  channel('undici:request:create').subscribe(safe(({ request }) => {
    const callStack = stack()
    const record = {
      traceID: `${process.pid}:${++sequence}`,
      startedAt: new Date().toISOString(),
      method: request.method,
      target: location(new URL(request.path, request.origin)),
      implementation: callStack.includes('node:internal/deps/undici') ? 'node-bundled'
        : callStack.includes('node_modules/undici') ? 'npm' : 'unknown',
      callStack,
    }
    identities.set(request, record)
    active.set(record.traceID, record)
    if (active.size > 128) active.delete(active.keys().next().value)
    recent.push(record)
    if (recent.length > 16) recent.shift()
    emit('undici.request.created', record)
  }))
  channel('undici:client:sendHeaders').subscribe(safe(({ request }) => {
    const record = identities.get(request)
    if (record) emit('undici.request.sent', { traceID: record.traceID })
  }))
  channel('undici:request:headers').subscribe(safe(({ request, response }) => {
    const record = identities.get(request)
    if (record) emit('undici.response.headers', { traceID: record.traceID }, { statusCode: response.statusCode })
  }))
  for (const name of ['trailers', 'error']) {
    channel(`undici:request:${name}`).subscribe(safe(({ request, error }) => {
      const record = identities.get(request)
      if (!record) return
      active.delete(record.traceID)
      emit(`undici.request.${name === 'error' ? 'failed' : 'completed'}`, { traceID: record.traceID },
        error ? { error: { name: error.name, code: error.code } } : {})
    }))
  }
  // The regular writer is asynchronous. Persist a bounded snapshot to PM2's
  // stderr synchronously before Node exits, without handling/suppressing it.
  process.on('uncaughtExceptionMonitor', (error, origin) => {
    try {
      const cleanError = {
        name: error?.name, code: error?.code,
        stack: String(error?.stack ?? '').replace(/https?:\/\/[^\s)]+/g, location),
      }
      const record = redact({ time: new Date().toISOString(), level: 'ERROR', event: 'undici.fatal.snapshot',
        pid: process.pid, origin, error: cleanError,
        active: [...active.values()].slice(-16), recent })
      writeSync(2, `${JSON.stringify(record)}\n`)
    } catch { /* Preserve the original uncaught exception and exit behavior. */ }
  })
}
