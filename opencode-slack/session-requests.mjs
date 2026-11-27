import { setTimeout as sleep } from 'node:timers/promises'

export class RequestInterruptedError extends Error {
  constructor() {
    super('Request interrupted.')
    this.name = 'RequestInterruptedError'
  }
}

export function createSessionRequests({ api, sessionForThread, pause = sleep }) {
  const threads = new Map()
  function threadState(thread) {
    if (!threads.has(thread)) threads.set(thread, { epoch: 0, active: null, queue: [], stopping: null })
    return threads.get(thread)
  }

  function startNext(state) {
    if (state.active || state.stopping || !state.queue.length) return
    const entry = state.queue.shift()
    state.active = entry
    const finish = (error, value) => {
      state.active = null
      entry.finish()
      if (error && !(error instanceof RequestInterruptedError)) entry.reject(error)
      else entry.resolve(value)
      startNext(state)
    }
    Promise.resolve().then(() => {
      entry.context.checkpoint()
      return entry.task(entry.context)
    }).then(value => finish(null, value), error => finish(error))
  }

  async function busy(sessionID) {
    const status = await api('/session/status', undefined, 4000)
    if (!status || typeof status !== 'object' || Array.isArray(status)) throw Error('Session state unavailable.')
    const state = status[sessionID]
    if (state === undefined) return false
    if (!state || !['idle', 'busy', 'retry'].includes(state.type)) throw Error('Invalid session state.')
    return state.type !== 'idle'
  }

  async function interrupt(thread, active, stopping) {
    const firstID = active?.context.sessionID ?? sessionForThread(thread)
    let hadWork = Boolean(active) || stopping.cancelled > 0
    let firstAbort
    if (firstID && (active || await busy(firstID))) {
      hadWork = true
      // Send immediately, but retain the result until local prompt submission and delivery settle.
      firstAbort = api(`/session/${encodeURIComponent(firstID)}/abort`, {}, 10000)
        .then(() => null, error => error)
    }
    if (active) await active.done
    const abortError = await firstAbort
    const finalID = active?.context.sessionID ?? sessionForThread(thread)
    if (finalID) {
      // A prompt already in flight may arrive after the first abort. Abort again only after it settles.
      if (active?.context.submitted || finalID !== firstID || abortError) {
        await api(`/session/${encodeURIComponent(finalID)}/abort`, {}, 10000)
      }
      for (let attempt = 0; ; attempt++) {
        if (!await busy(finalID)) break
        if (attempt >= 9) throw Error('Session interruption could not be confirmed.')
        await pause(500)
      }
    }
    return { stopped: hadWork || stopping.cancelled > 0, cancelled: stopping.cancelled }
  }

  return {
    epoch(thread) { return threadState(thread).epoch },
    has(thread) {
      const state = threads.get(thread)
      return Boolean(state && (state.active || state.queue.length || state.stopping))
    },
    enqueue(thread, task, epoch = threadState(thread).epoch) {
      const state = threadState(thread)
      if (state.epoch !== epoch) return Promise.resolve()
      const controller = new AbortController()
      const context = {
        signal: controller.signal,
        sessionID: sessionForThread(thread),
        submitted: false,
        checkpoint() {
          if (controller.signal.aborted) throw new RequestInterruptedError()
        },
        submit(task) {
          context.checkpoint()
          context.submitted = true
          return task()
        },
      }
      return new Promise((resolve, reject) => {
        const entry = { task, context, controller, resolve, reject }
        entry.done = new Promise(finish => { entry.finish = finish })
        state.queue.push(entry)
        startNext(state)
      })
    },
    stop(thread) {
      const state = threadState(thread)
      state.epoch++
      const cancelled = state.queue.length
      for (const entry of state.queue.splice(0)) entry.resolve()
      if (state.stopping) {
        state.stopping.cancelled += cancelled
        return state.stopping.promise
      }
      const active = state.active
      active?.controller.abort()
      const stopping = { cancelled }
      state.stopping = stopping
      stopping.promise = Promise.resolve().then(() => interrupt(thread, active, stopping)).finally(() => {
        state.stopping = null
        startNext(state)
      })
      return stopping.promise
    },
  }
}
