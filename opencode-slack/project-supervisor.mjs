import { setTimeout as sleep } from 'node:timers/promises'

export function superviseProject({ name, spawn, health, pause = sleep, log = console.error, startupAttempts = 10 }) {
  const controller = new AbortController()
  let child
  let ready = false
  let failures = 0
  const done = (async () => {
    while (!controller.signal.aborted) {
      let stable = false
      let current
      try {
        current = child = spawn()
        const ended = new Promise(resolve => {
          current.once('error', () => resolve('spawn error'))
          current.once('exit', () => resolve('exit'))
        })
        let reason
        for (let attempt = 0; attempt < startupAttempts; attempt++) {
          const result = await Promise.race([
            ended,
            health().then(() => 'healthy', () => 'unavailable'),
          ])
          if (result === 'healthy') {
            ready = true
            log(`OpenCode project ready: ${name}.`, { pid: current.pid })
            // Reset the restart backoff only after a sustained healthy lifetime.
            const timer = setTimeout(() => { stable = true }, 60000)
            try { reason = await ended } finally { clearTimeout(timer) }
            break
          }
          if (result !== 'unavailable') { reason = result; break }
          await Promise.race([ended, pause(1000, undefined, { signal: controller.signal })])
        }
        ready = false
        if (!reason && !controller.signal.aborted) {
          current.kill('SIGKILL')
          await ended
        }
      } catch {
        ready = false
        current?.kill('SIGKILL')
      } finally {
        child = undefined
      }
      if (controller.signal.aborted) break
      failures = stable ? 0 : failures + 1
      const delay = Math.min(30000, 1000 * 2 ** Math.max(0, Math.min(failures - 1, 5)))
      log(`OpenCode project unavailable: ${name}; restarting only this project in ${delay}ms.`, { delayMs: delay, failures })
      try { await pause(delay, undefined, { signal: controller.signal }) } catch { break }
    }
  })()
  return {
    done,
    get ready() { return ready },
    async waitReady(signal) {
      while (!ready) {
        signal?.throwIfAborted()
        if (controller.signal.aborted) throw Error('Project supervisor stopped.')
        await pause(100, undefined, { signal })
      }
    },
    stop() {
      ready = false
      controller.abort()
      child?.kill('SIGKILL')
    },
  }
}
