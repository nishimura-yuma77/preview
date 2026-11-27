import { setTimeout as sleep } from 'node:timers/promises'
import { diagnostic } from './diagnostics.mjs'

export function retryDelay(error, attempt, random = Math.random) {
  const code = error?.code
  const platform = error?.data?.error
  const status = error?.statusCode ?? error?.status
  const transient = ['slack_webapi_request_error', 'slack_webapi_rate_limited_error'].includes(code) ||
    (code === 'slack_webapi_http_error' && (status === 429 || status >= 500)) ||
    (code === 'slack_webapi_platform_error' && ['internal_error', 'fatal_error', 'service_unavailable', 'ratelimited'].includes(platform))
  if (!transient) return null
  const retryAfter = Number(error?.retryAfter ?? error?.headers?.['retry-after'])
  return Math.max(Number.isFinite(retryAfter) ? retryAfter * 1000 : 0,
    Math.min(60000, 1000 * 2 ** Math.min(attempt, 6) * (1 + random() * 0.2)))
}

export async function retrySlack(task, { signal, pause = sleep, onRetry = () => {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted()
    try {
      return await task()
    } catch (error) {
      const delay = retryDelay(error, attempt)
      if (delay === null) throw error
      onRetry(error, delay)
      await pause(delay, undefined, { signal })
    }
  }
}

// Persist each acknowledged chunk before proceeding. Reuse the message UUID when
// a response is lost; Slack can deduplicate retries with client_msg_id.
export async function deliverChunks(client, chunks, delivery, save, { signal, checkpoint = () => {}, pause } = {}) {
  for (let index = delivery.sent ?? 0; index < chunks.length; index++) {
    checkpoint()
    await retrySlack(() => {
      checkpoint()
      return client.chat.postMessage({ ...chunks[index], client_msg_id: delivery.ids[index] })
    }, {
      signal, pause,
      onRetry: (error, delayMs) => diagnostic('WARN', 'slack.delivery.retry', { error, delayMs, chunk: index }),
    })
    delivery.sent = index + 1
    await save()
  }
  diagnostic('INFO', 'slack.delivery.completed', { chunks: chunks.length })
}
