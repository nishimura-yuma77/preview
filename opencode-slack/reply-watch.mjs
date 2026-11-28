// One project owns one channel. Persist the latest undelivered operation per
// thread with the existing session state; a slow dashboard never blocks Slack.
export function createReplyWatch({ state, save, client, team, channel, channelName, bot, token, port = 8787, onError }) {
  if (!token) return null
  if (!team || !Number.isInteger(Number(port)) || port < 1 || port > 65535) throw Error('Invalid reply-watch configuration')
  const { threads, outbox } = state.replyWatch ??= { threads: {}, outbox: {} }
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
    if (!threads[thread] || !/^\d+\.\d{6}$/.test(ts)) return
    const prev = outbox[thread]
    if (prev && (prev.ts > ts || (prev.ts === ts && prev.status === 'done'))) return
    outbox[thread] = { ts, status }
    await save()
    void flush()
  }
  return {
    track(thread) { threads[thread] = true },
    final: (thread, ts) => record(thread, ts, 'pending'),
    human(event) {
      if (event.channel !== channel || !event.user || event.user === bot || event.bot_id || event.app_id ||
        (event.subtype && !['file_share', 'thread_broadcast'].includes(event.subtype)) || !event.thread_ts || event.ts === event.thread_ts) return
      return record(event.thread_ts, event.ts, 'done')
    },
  }
}
