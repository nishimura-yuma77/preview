import { setTimeout as sleep } from 'node:timers/promises'
import { createFailureTracker } from './diagnostics.mjs'

export function diagnosticEvent(event) {
  const properties = event?.properties
  if (!properties || typeof properties !== 'object') return null
  if (event.type === 'session.error') {
    const error = properties.error
    return { level: 'ERROR', event: 'opencode.session.error', fields: {
      sessionID: properties.sessionID,
      error: { name: error?.name, message: error?.data?.message, code: error?.data?.code,
        statusCode: error?.data?.statusCode, isRetryable: error?.data?.isRetryable },
    } }
  }
  if (event.type === 'session.status' && properties.status?.type === 'retry') {
    return { level: 'WARN', event: 'opencode.session.retry', fields: {
      sessionID: properties.sessionID, attempt: properties.status.attempt,
      next: properties.status.next, message: properties.status.message,
    } }
  }
  return null
}

export async function readDiagnosticEvents(response, emit, signal) {
  if (!response.ok) throw Object.assign(Error('OpenCode event connection failed.'), { status: response.status })
  if (!response.body) throw Error('OpenCode event body unavailable.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = '', data = '', discarding = false, frameInvalid = false
  try {
    for (;;) {
      signal?.throwIfAborted()
      const { done, value } = await reader.read()
      if (done) break
      for (const part of decoder.decode(value, { stream: true }).split(/(\n)/)) {
        if (part !== '\n') {
          if (!discarding) pending += part
          if (pending.length > 65536) { pending = ''; discarding = true; frameInvalid = true }
          continue
        }
        const line = pending.replace(/\r$/, '')
        pending = ''
        if (discarding) { discarding = false; continue }
        if (!line) {
          if (!frameInvalid && data) {
            try { const event = diagnosticEvent(JSON.parse(data)); if (event) emit(event.level, event.event, event.fields) }
            catch (error) { if (!(error instanceof SyntaxError)) throw error }
          }
          data = ''; frameInvalid = false
        } else if (!frameInvalid && line.startsWith('data:')) {
          data += line.slice(5).trimStart() + '\n'
          if (data.length > 65536) { data = ''; frameInvalid = true }
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

export async function observeOpenCodeEvents({ connect, emit, signal, pause = sleep }) {
  const failures = createFailureTracker(emit)
  let attempt = 0
  while (!signal.aborted) {
    try {
      const response = await connect(signal)
      if (response.ok) { failures.recover('opencode.events'); attempt = 0 }
      await readDiagnosticEvents(response, emit, signal)
      if (!signal.aborted) throw Error('OpenCode event connection closed.')
    } catch (error) {
      if (signal.aborted) break
      failures.fail('opencode.events', error)
      try { await pause(Math.min(30000, 1000 * 2 ** Math.min(attempt++, 5)), undefined, { signal }) }
      catch { break }
    }
  }
}
