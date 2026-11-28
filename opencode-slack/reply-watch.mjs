// One project owns one channel. Persist the latest undelivered operation per
// thread with the existing session state; a slow dashboard never blocks Slack.
export function createReplyWatch({ state, save, client, team, channel, channelName, bot, token, port = 8787, onError }) {
  if (!token) return null
  if (!team || !Number.isInteger(Number(port)) || port < 1 || port > 65535) throw Error('Invalid reply-watch configuration')
  const { threads, outbox } = state.replyWatch ??= { threads: {}, outbox: {} }
  const ended = state.replyWatch.ended ??= {}
  const isHumanReply = event => event.channel === channel && event.user && event.user !== bot && !event.bot_id && !event.app_id &&
    (!event.subtype || ['file_share', 'thread_broadcast'].includes(event.subtype)) && event.thread_ts && event.ts !== event.thread_ts
  let busy = false
  async function flush() {
    if (busy) return
    busy = true
    try {
      for (const [thread, item] of Object.entries(outbox)) {
        try {
          const body = { occurred_us_at: Number(item.ts.replace('.', '')) }
          if (item.status === 'pending') {
            const [info, link] = await Promise.all([
              client.conversations.info({ channel }).catch(error => {
                if (channelName && error.data?.error === 'missing_scope') return { channel: { name: channelName } }
                throw error
              }), client.chat.getPermalink({ channel, message_ts: item.ts }),
            ])
            if (!info.channel?.name || !link.permalink) throw Error('Missing reply destination')
            Object.assign(body, { display_name: `#${info.channel.name}`, reference_url: link.permalink })
          }
          const id = `slack_${team}_${channel}_${thread.replace('.', '_')}`
          const res = await fetch(`http://127.0.0.1:${port}/internal/reply/${id}/${item.status}`, {
            method: 'PUT', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
            body: JSON.stringify(body), signal: AbortSignal.timeout(5000), redirect: 'error',
          })
          await res.arrayBuffer()
          if (res.status !== 204) throw Error(`reply-watch HTTP ${res.status}`)
          if (outbox[thread] === item) { delete outbox[thread]; await save() }
        } catch (error) { onError(error) }
      }
    } finally { busy = false }
  }
  const timer = setInterval(() => void flush(), 5000)
  timer.unref()
  void flush()
  async function record(thread, ts, status) {
    if (!/^\d+\.\d{6}$/.test(ts)) return
    const prev = outbox[thread]
    if (prev && (prev.ts > ts || (prev.ts === ts && prev.status === 'done'))) return
    outbox[thread] = { ts, status }
    await save()
    void flush()
  }
  return {
    track(thread, ts = thread) {
      if (!ended[thread] || ts > ended[thread]) threads[thread] ??= ts
    },
    period: thread => threads[thread] ?? null,
    final(thread, ts, period) {
      if (threads[thread] && threads[thread] === period) return record(thread, ts, 'pending')
    },
    end(event) {
      if (!isHumanReply(event) || !['!end', '!e'].includes(event.text?.trim())) return
      const thread = event.thread_ts
      if (!threads[thread] || (threads[thread] !== true && event.ts <= threads[thread])) return Promise.resolve()
      delete threads[thread]
      ended[thread] = event.ts
      return record(thread, event.ts, 'done').then(save).then(() => client.chat.postMessage({
        channel, thread_ts: thread, text: 'クローズしました。再開には再度メンションしてください。',
      }))
    },
    human(event) {
      if (!isHumanReply(event) || !threads[event.thread_ts]) return
      return record(event.thread_ts, event.ts, 'done')
    },
  }
}
