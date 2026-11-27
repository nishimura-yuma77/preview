import { AsyncLocalStorage } from 'node:async_hooks'
import { constants } from 'node:fs'
import { chmod, lstat, mkdir, open, readdir, rename, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { StringDecoder } from 'node:string_decoder'

const context = new AsyncLocalStorage()
const privateKey = /^(?:authorization|cookie|headers|.*token|password|secret|prompt|system|messages|parts|body|requestBodyValues|request|response|input|output|text|command|args)$/i
const maxRecordBytes = 16 * 1024

export function withLogContext(fields, task) {
  return context.run({ ...context.getStore(), ...fields }, task)
}
export function updateLogContext(fields) {
  const store = context.getStore()
  if (store) Object.assign(store, fields)
}

export function createRedactor(secrets = []) {
  const literals = [...new Set(secrets.filter(s => typeof s === 'string' && s.length >= 4))].sort((a, b) => b.length - a.length)
  const cleanText = value => {
    let text = String(value)
    for (const secret of literals) text = text.replaceAll(secret, '[REDACTED]')
    return text.replace(/\b(?:xox[baprs]-[\w-]+|xapp-[\w-]+|sk-[\w-]+)\b/g, '[REDACTED]')
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9+/=._-]+/gi, '$1 [REDACTED]')
      .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, '$1[REDACTED]@')
      .replace(/([?&](?:token|key|secret|password|api_key)=)[^\s&#]+/gi, '$1[REDACTED]')
      .replace(/\b(?:prompt|system|messages|requestBodyValues|body|headers|authorization|input|output)\s*[=:].*/gi, '[PAYLOAD OMITTED]')
      .slice(0, 6000)
  }
  function clean(value, depth = 0, seen = new Set()) {
    if (typeof value === 'string') return cleanText(value)
    if (value === null || typeof value === 'number' || typeof value === 'boolean') return value
    if (value === undefined) return undefined
    if (depth > 5 || seen.has(value)) return '[OMITTED]'
    seen.add(value)
    if (value instanceof Error) {
      const result = { name: cleanText(value.name), message: cleanText(value.message), stack: cleanText(value.stack ?? '') }
      for (const key of ['code', 'status', 'statusCode', 'retryAfter', 'cause']) {
        if (value[key] !== undefined) result[key] = clean(value[key], depth + 1, seen)
      }
      if (typeof value.data?.error === 'string') result.slackCode = cleanText(value.data.error)
      return result
    }
    if (Array.isArray(value)) return value.slice(0, 20).map(item => clean(item, depth + 1, seen))
    const result = {}
    for (const [key, item] of Object.entries(value).slice(0, 40)) {
      if (!privateKey.test(key)) result[key] = clean(item, depth + 1, seen)
    }
    return result
  }
  return clean
}

// A single serial writer owns every file. Producers never wait for disk I/O.
export function createDiagnostics({ directory = '/srv/opencode-slack/logs', maxBytes = 20 * 1024 * 1024,
  maxFiles = 10, retentionMs = 14 * 86400000, queueBytes = 1024 * 1024,
  now = Date.now, secrets = [], maintenanceMs = 60000,
  fallback = () => process.stderr.write('Diagnostic log unavailable; check log directory permissions and free disk space.\n'),
} = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1024 || !Number.isSafeInteger(maxFiles) || maxFiles < 1 ||
      !Number.isFinite(retentionMs) || retentionMs <= 0 || queueBytes < 1024) throw Error('Invalid diagnostic log limits.')
  const redact = createRedactor(secrets)
  const streams = new Map()
  let queued = 0, dropped = 0, tail = Promise.resolve(), closed = false, lastFallback = -Infinity
  let initialized
  async function prepare() {
    await mkdir(directory, { recursive: true, mode: 0o700 })
    const info = await lstat(directory)
    if (!info.isDirectory() || info.isSymbolicLink() || info.uid !== process.getuid()) throw Error('Unsafe diagnostic directory.')
    await chmod(directory, 0o700)
  }
  const day = time => new Date(time).toISOString().slice(0, 10)
  function failure() {
    if (now() - lastFallback >= 60000) {
      lastFallback = now()
      try { fallback() } catch { /* Logging cannot terminate request handling. */ }
    }
  }
  async function prune(name) {
    const prefix = `${name}.archive-`
    const files = []
    for (const file of await readdir(directory)) {
      if (!file.startsWith(prefix) || !/^[-\w.]+\.jsonl$/.test(file)) continue
      const path = join(directory, file)
      const info = await lstat(path)
      if (!info.isFile() || info.isSymbolicLink()) continue
      files.push({ path, mtime: info.mtimeMs, file })
    }
    files.sort((a, b) => b.mtime - a.mtime || b.file.localeCompare(a.file))
    for (const [i, file] of files.entries()) {
      if (i >= maxFiles - 1 || now() - file.mtime >= retentionMs) await unlink(file.path)
    }
  }
  async function current(name) {
    if (!streams.has(name)) {
      const path = join(directory, `${name}.current.jsonl`)
      let size = 0, date = day(now())
      try {
        const info = await lstat(path)
        if (!info.isFile() || info.isSymbolicLink() || info.uid !== process.getuid()) throw Error('Unsafe diagnostic log file.')
        size = info.size; date = day(info.mtimeMs)
      } catch (error) { if (error.code !== 'ENOENT') throw error }
      await prune(name)
      streams.set(name, { path, size, date })
    }
    return streams.get(name)
  }
  async function rotate(name, stream) {
    try {
      // Free one slot BEFORE archiving, so rotation never creates an eleventh file.
      const files = (await readdir(directory)).filter(file => file.startsWith(`${name}.archive-`) && /^[-\w.]+\.jsonl$/.test(file)).sort().reverse()
      for (const file of files.slice(Math.max(0, maxFiles - 2))) await unlink(join(directory, file))
      if (maxFiles === 1) await unlink(stream.path)
      else await rename(stream.path, join(directory, `${name}.archive-${String(now()).padStart(16, '0')}-${randomUUID()}.jsonl`))
    } catch (error) { if (error.code !== 'ENOENT') throw error }
    stream.size = 0; stream.date = day(now())
    await prune(name)
  }
  async function append(name, line) {
    initialized ??= prepare().catch(error => { initialized = undefined; throw error })
    await initialized
    const stream = await current(name)
    const bytes = Buffer.byteLength(line)
    if (stream.size && (stream.size + bytes > maxBytes || stream.date !== day(now()))) await rotate(name, stream)
    const file = await open(stream.path, constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT | constants.O_NOFOLLOW, 0o600)
    try { await file.chmod(0o600); await file.writeFile(line) } finally { await file.close() }
    stream.size += bytes
  }
  function enqueue(name, line) {
    const bytes = Buffer.byteLength(line)
    if (queued + bytes > queueBytes) { dropped++; return false }
    queued += bytes
    tail = tail.then(async () => {
      if (dropped) {
        const count = dropped; dropped = 0
        await append('bridge', JSON.stringify({ time: new Date(now()).toISOString(), level: 'WARN', event: 'logging.records_dropped', count }) + '\n')
      }
      await append(name, line)
    }).catch(failure).finally(() => { queued -= bytes })
    return true
  }
  function emit(level, event, fields = {}, name = 'bridge') {
    if (closed) return false
    if (!/^(bridge|opencode-[a-z0-9-]+)$/.test(name)) throw Error('Invalid diagnostic stream name.')
    const record = { ...redact({ ...context.getStore(), ...fields }), time: new Date(now()).toISOString(), level, event }
    let line = JSON.stringify(record) + '\n'
    if (Buffer.byteLength(line) > Math.min(maxRecordBytes, maxBytes)) {
      line = JSON.stringify({ time: record.time, level, event, project: record.project, requestID: record.requestID,
        sessionID: record.sessionID, truncated: true, error: { name: record.error?.name, message: record.error?.message?.slice(0, 80) } }) + '\n'
      if (Buffer.byteLength(line) > Math.min(maxRecordBytes, maxBytes)) {
        line = JSON.stringify({ time: record.time, level, event: String(event).slice(0, 100), truncated: true }) + '\n'
      }
    }
    return enqueue(name, line)
  }
  const timer = maintenanceMs ? setInterval(() => {
    if (closed || queued) return
    tail = tail.then(async () => {
      // Discover streams on startup too: retired projects must still expire.
      initialized ??= prepare().catch(error => { initialized = undefined; throw error })
      await initialized
      const names = new Set([...streams.keys(), ...(await readdir(directory)).map(file => /^(bridge|opencode-[a-z0-9-]+)\.(?:current|archive-.*)\.jsonl$/.exec(file)?.[1]).filter(Boolean)])
      for (const name of names) {
        const stream = await current(name)
        if (stream.size && stream.date !== day(now())) await rotate(name, stream)
        await prune(name)
      }
    }).catch(failure)
  }, maintenanceMs) : null
  timer?.unref()
  return {
    emit,
    async flush() { await tail },
    async close() { closed = true; clearInterval(timer); await tail },
    get queuedBytes() { return queued },
    get droppedRecords() { return dropped },
  }
}

// Coalesce repeated poll failures; retain the first error and a recovery summary.
export function createFailureTracker(log, { intervalMs = 60000, now = Date.now } = {}) {
  const failures = new Map()
  return {
    fail(key, error, fields = {}) {
      const state = failures.get(key) ?? { count: 0, start: now(), last: -Infinity }
      state.count++
      if (now() - state.last >= intervalMs) {
        log('WARN', `${key}.failed`, { ...fields, count: state.count, elapsedMs: now() - state.start, error })
        state.last = now()
      }
      failures.set(key, state)
    },
    recover(key, fields = {}) {
      const state = failures.get(key)
      if (!state) return
      log('INFO', `${key}.recovered`, { ...fields, count: state.count, elapsedMs: now() - state.start })
      failures.delete(key)
    },
  }
}

// OpenCode's stderr is logfmt. Only diagnostic fields are accepted; arbitrary
// stdout, continuation lines and payload fields are never persisted.
export function captureChildDiagnostics(stream, project, diagnostics) {
  const decoder = new StringDecoder('utf8')
  let pending = '', discarding = false
  const limit = 8192
  function line(text) {
    const level = /\b(ERROR|WARN)\b/.exec(text)?.[1]
    if (!level) return
    const fields = { project }
    for (const key of ['service', 'sessionID', 'messageID', 'name', 'code']) {
      const value = new RegExp(`(?:^|\\s)${key}=([\\w.:-]{1,160})(?:\\s|$)`).exec(text)?.[1]
      if (value) fields[key] = value
    }
    // Error objects are filtered structurally. Free-form lines can contain user
    // content, so keep only the exception class and diagnostic location.
    const error = /\berror=(\{.*\})\s*$/.exec(text)?.[1]
    if (error) {
      try { const value = JSON.parse(error); fields.error = { name: value.name, message: value.message, stack: value.stack, cause: value.cause } } catch { /* Not JSON: classify below. */ }
    }
    if (!fields.error) fields.error = { name: /\b([A-Za-z]+Error)\b/.exec(text)?.[1] ?? 'OpenCodeDiagnostic' }
    diagnostics.emit(level, 'opencode.diagnostic', fields, `opencode-${project}`)
  }
  function consume(text) {
    for (const part of text.split(/(\n)/)) {
      if (part === '\n') { if (!discarding) line(pending); pending = ''; discarding = false }
      else if (!discarding) {
        pending += part
        if (Buffer.byteLength(pending) > limit) {
          line(pending.slice(0, 200)); pending = ''; discarding = true
          diagnostics.emit('WARN', 'opencode.line_truncated', { project }, `opencode-${project}`)
        }
      }
    }
  }
  stream.on('data', chunk => consume(decoder.write(chunk)))
  stream.on('end', () => { consume(decoder.end()); if (pending && !discarding) line(pending) })
  stream.on('error', error => diagnostics.emit('ERROR', 'opencode.stderr.failed', { project, error }))
}

let active
export function initializeDiagnostics(secrets) { active ??= createDiagnostics({ secrets }); return active }
export function diagnostic(level, event, fields) { active?.emit(level, event, fields) }
export async function closeDiagnostics() { await active?.close() }
