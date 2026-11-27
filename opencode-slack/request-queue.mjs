import { rename, writeFile } from 'node:fs/promises'

export function createRequestQueue() {
  const pending = new Map()
  return (key, task) => {
    const result = (pending.get(key) ?? Promise.resolve()).then(task)
    const tail = result.then(() => {}, () => {}).then(() => {
      if (pending.get(key) === tail) pending.delete(key)
    })
    pending.set(key, tail)
    return result
  }
}

export function createStateSaver(file, getState) {
  const enqueue = createRequestQueue()
  const next = new URL(`${file.href}.next`)
  return () => enqueue('state', async () => {
    await writeFile(next, JSON.stringify(getState()), { mode: 0o600 })
    await rename(next, file)
  })
}
