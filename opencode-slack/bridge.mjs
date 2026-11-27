import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'
import bolt from '@slack/bolt'
import { attachMermaid, renderMermaid } from './mermaid-attachments.mjs'
import { createStateSaver } from './request-queue.mjs'
import { createSessionRequests, RequestInterruptedError } from './session-requests.mjs'
import { createProjectApp } from './project-routing.mjs'
import { loadProjects } from './projects.mjs'
import { ProjectInstructionsError, projectEnvironment, projectPrompt } from './project-context.mjs'
import { createDrainController, drainingMessage, openCodeActivity, startRestartControl } from './restart-control.mjs'
import { diffPages, diffView, patchDetails, todoLines, toolLabel, webFetchResult } from './tool-display.mjs'
import { deliverChunks } from './slack-retry.mjs'
import { superviseProject } from './project-supervisor.mjs'
import { clearThreadPending, finishPending, submitPromptOnce } from './request-recovery.mjs'
import { initializeDiagnostics, diagnostic, closeDiagnostics, withLogContext, updateLogContext, createFailureTracker, captureChildDiagnostics } from './diagnostics.mjs'
import { observeOpenCodeEvents } from './opencode-events.mjs'
import { fetchOpenCode } from './opencode-http.mjs'

const secretsFile = new URL('./secrets.env', import.meta.url)
const channelId = 'C0AK19DK9RR'
const memberId = 'U095BV5RSTF'

export function acceptedText(event, botId, hasSession = false, allowedChannel = channelId) {
  if (event.channel !== allowedChannel || event.user !== memberId || event.bot_id || event.subtype || !event.ts || typeof event.text !== 'string') return null
  const mention = `<@${botId}>`
  const mentioned = event.text.includes(mention)
  if (event.type === 'app_mention' && !mentioned) return null
  if (event.type !== 'app_mention' && event.type !== 'message') return null
  if (!mentioned && !(event.thread_ts && event.thread_ts !== event.ts && hasSession)) return null
  return event.text.replace(mention, '').trim() || null
}

export function parseAgent(text) {
  const match = /^!(plan|build|p|b)(?:\s+|$)/.exec(text)
  if (!match) return { agent: 'plan', prompt: text }
  const agent = match[1] === 'b' || match[1] === 'build' ? 'build' : 'plan'
  return { agent, prompt: text.slice(match[0].length).trim() }
}

export function parseSkill(prompt) {
  if (prompt === '!s' || prompt === '!skill') return { type: 'list' }
  const match = /^!s-([a-z0-9]+(?:-[a-z0-9]+)*)(?:\s+|$)/.exec(prompt)
  return match ? { type: 'run', name: match[1], request: prompt.slice(match[0].length).trim() } : null
}

const plain = (text) => ({ type: 'plain_text', text })

export function skillView(key, agent, skills) {
  return {
    type: 'modal', callback_id: 'opencode_run_skill', private_metadata: key,
    title: plain(`OpenCode · ${agent}`), submit: plain('Run'), close: plain('Cancel'),
    blocks: [
      { type: 'input', block_id: 'skill', label: plain('Skill'), element: {
        type: 'static_select', action_id: 'name', placeholder: plain('Search skills'),
        options: skills.slice(0, 100).map(({ name }) => ({ text: plain(name), value: name })),
      } },
      { type: 'input', block_id: 'request', optional: true, label: plain('Request'), element: {
        type: 'plain_text_input', action_id: 'text', multiline: true, max_length: 3000,
      } },
    ],
  }
}

export function matchesApproval(body, request, sessions, allowedChannel = channelId) {
  return Boolean(request && body.user?.id === memberId && body.channel?.id === allowedChannel &&
    body.container?.message_ts === request.statusTs && (body.message?.thread_ts ?? body.container?.thread_ts) === request.thread &&
    sessions[request.thread] === request.sessionID)
}

export function questionChoices(request) {
  const question = request.questions?.[0]
  if (request.questions?.length !== 1 || question.multiple || !Array.isArray(question.options)) return []
  const labels = question.options.map(({ label }) => label)
  return labels.length <= 5 && labels.every((label) => typeof label === 'string' && label.trim() && Array.from(label).length <= 75) && new Set(labels).size === labels.length ? labels : []
}

export function acceptsCustomAnswer(request) {
  return request.questions?.length === 1 && !request.questions[0].multiple && request.questions[0].custom !== false
}

export function questionBlocks(request, key, choices) {
  const question = request.questions?.[0]?.question
  const custom = acceptsCustomAnswer(request)
  const guidance = !choices.length && (!custom || request.questions[0].options?.length) ? '\n選択肢の確認・選択はターミナルで行ってください。' : ''
  const blocks = [{ type: 'section', text: { type: 'plain_text', text: `回答待ち\n${String(question ?? '').slice(0, 2500)}${guidance}` } }]
  const elements = choices.map((label, index) => ({
    type: 'button', action_id: `opencode_question_${index}`, text: { type: 'plain_text', text: label }, value: key,
  }))
  if (custom) elements.push({ type: 'button', action_id: 'opencode_question_custom', text: { type: 'plain_text', text: '自由入力' }, value: key })
  if (elements.length) blocks.push({ type: 'actions', elements })
  return blocks
}

export function questionAnswerView(key, question) {
  return {
    type: 'modal', callback_id: 'opencode_question_answer', private_metadata: key,
    title: { type: 'plain_text', text: 'OpenCode' },
    submit: { type: 'plain_text', text: '回答する' },
    close: { type: 'plain_text', text: '閉じる' },
    blocks: [
      { type: 'section', text: { type: 'plain_text', text: question.slice(0, 2500) || '回答を入力してください。' } },
      { type: 'input', block_id: 'answer', label: { type: 'plain_text', text: '回答' }, element: { type: 'plain_text_input', action_id: 'text', multiline: true, max_length: 3000 } },
    ],
  }
}

function permissionBlocks(request, key) {
  const target = [request.permission, ...(request.patterns ?? [])].join('\n').slice(0, 2500)
  return [
    { type: 'section', text: { type: 'plain_text', text: `権限確認待ち\n${target}`, emoji: false } },
    { type: 'actions', elements: [
      { type: 'button', action_id: 'opencode_permission_once', text: { type: 'plain_text', text: '今回だけ許可' }, value: key },
      { type: 'button', action_id: 'opencode_permission_reject', text: { type: 'plain_text', text: '拒否' }, value: key },
    ] },
  ]
}

export function toolLog(messages, messageID, seen, lastTodo) {
  const entries = []
  for (const { info, parts } of messages) {
    if (info?.role !== 'assistant' || info.parentID !== messageID) continue
    for (const part of parts ?? []) {
      if (part.type !== 'tool' || !part.id || !/^[\w.-]{1,64}$/.test(part.tool ?? '')) continue
      const { status, time, input } = part.state ?? {}
      if (!['running', 'completed', 'error'].includes(status)) continue
      const previous = seen.get(part.id)
      if (previous === status || previous === 'completed' || previous === 'error') continue
      if (['apply_patch', 'todowrite'].includes(part.tool) && status === 'running') continue
      const lines = []
      let hasDiff = false
      let todoSnapshot
      if (part.tool === 'apply_patch' && status === 'completed') {
        const files = patchDetails(part.state)
        lines.push(...files.slice(0, 6).map(({ label }) => label))
        if (files.length > 6) lines.push(`… and ${files.length - 6} more`)
        if (!lines.length) lines.push('apply_patch completed · 差分を表示できません')
        hasDiff = files.some(({ diff }) => diff.trim())
      } else if (part.tool === 'apply_patch') {
        lines.push('✖ apply_patch failed')
      } else if (part.tool === 'todowrite') {
        if (status === 'error') lines.push('✖ todowrite failed')
        else {
          const snapshot = todoLines(part.state)
          if (snapshot) {
            todoSnapshot = JSON.stringify(snapshot)
            if (todoSnapshot !== lastTodo) lines.push(...snapshot)
            lastTodo = todoSnapshot
          } else lines.push('todowrite completed · 一覧を取得できません')
        }
      } else if (part.tool === 'webfetch') {
        lines.push(webFetchResult(part.state))
      } else {
        if (!previous) lines.push(toolLabel(part.tool, input ?? {}))
        const seconds = (time?.end - time?.start) / 1000
        const exit = part.state?.metadata?.exit
        const exitLabel = part.tool === 'bash' && Number.isSafeInteger(exit) ? ` (exit ${exit})` : ''
        if (status !== 'running') lines.push(`${status === 'error' ? `✖ ${part.tool} failed` : `${part.tool} completed`}${exitLabel}${Number.isFinite(seconds) && seconds >= 0 ? ` · ${seconds.toFixed(1)}s` : ''}`)
      }
      entries.push({ id: part.id, status, lines, hasDiff, todoSnapshot, assistantID: info.id })
    }
  }
  return entries
}

export async function notifyThread(client, thread, kind, detail = '', targetChannel = channelId) {
  const text = {
    permission: 'approval required',
    question: 'answer required',
    completed: 'completed',
    failed: 'failed',
    interrupted: 'interrupted',
  }[kind]
  if (!text) return
  try {
    await client.chat.postMessage({
      channel: targetChannel, thread_ts: thread, text: `<@${memberId}> *OpenCode* · \`${text}\`${detail ? `\n${detail}` : ''}`,
      mrkdwn: true, unfurl_links: false, unfurl_media: false,
    })
  } catch (error) {
    diagnostic('ERROR', 'slack.notification.failed', { thread, kind, error })
  }
}

export function splitMarkdown(answer) {
  const limit = 12000
  const chunks = []
  let rest = answer
  let fence
  while (rest.length) {
    const prefix = fence ? `${fence.open}\n` : ''
    if (prefix.length + rest.length <= limit) {
      chunks.push(prefix + rest)
      break
    }

    let currentFence = fence
    let paragraph
    let lineBoundary
    let offset = 0
    for (const line of rest.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
      const match = /^ {0,3}(`{3,}|~{3,})([^\n]*)/.exec(line)
      if (match && match[1].length <= 32 && match[2].length <= 128) {
        const [, marker, info] = match
        if (!currentFence) currentFence = { marker, open: marker + info }
        else if (marker[0] === currentFence.marker[0] && marker.length >= currentFence.marker.length && !info.trim()) currentFence = undefined
      }
      offset += line.length
      const suffix = currentFence ? `\n${currentFence.marker}` : ''
      if (prefix.length + offset + suffix.length > limit) break
      lineBoundary = { offset, fence: currentFence, suffix }
      if (!currentFence && !line.trim()) paragraph = lineBoundary
    }

    let boundary = paragraph ?? lineBoundary
    if (!boundary) {
      const suffix = fence ? `\n${fence.marker}` : ''
      let offset = limit - prefix.length - suffix.length
      if (/[\uD800-\uDBFF]/.test(rest[offset - 1])) offset--
      boundary = { offset, fence, suffix }
    }
    chunks.push(prefix + rest.slice(0, boundary.offset) + boundary.suffix)
    rest = rest.slice(boundary.offset)
    fence = boundary.fence
  }
  return chunks
}

export async function postCompletedAnswer(client, thread, answer, targetChannel = channelId, checkpoint = () => {}, recovery = {}) {
  const heading = `<@${memberId}> *OpenCode* · \`completed\``
  const [first, ...rest] = splitMarkdown(answer)
  const chunks = [{
    channel: targetChannel, thread_ts: thread, text: heading, unfurl_links: false, unfurl_media: false,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: heading } }, { type: 'markdown', text: first }],
  }]
  for (const markdown_text of rest) {
    chunks.push({ channel: targetChannel, thread_ts: thread, markdown_text, unfurl_links: false, unfurl_media: false })
  }
  const delivery = recovery.delivery ?? { ids: chunks.map(() => randomUUID()), sent: 0 }
  await deliverChunks(client, chunks, delivery, recovery.save ?? (async () => {}), { checkpoint, signal: recovery.signal })
}

export async function main() {
  const metadata = await stat(secretsFile)
  if (!metadata.isFile() || metadata.uid !== process.getuid() || (metadata.mode & 0o077)) throw Error('Set secrets.env permissions to 600.')
  process.loadEnvFile(secretsFile)
  const { SLACK_BOT_TOKEN: token, SLACK_APP_TOKEN: appToken, OPENCODE_SERVER_PASSWORD: password } = process.env
  initializeDiagnostics([token, appToken, password, password && Buffer.from(`opencode:${password}`).toString('base64')])
  diagnostic('INFO', 'bridge.starting', { pid: process.pid })
  if (!token?.startsWith('xoxb-') || !appToken?.startsWith('xapp-') || !password || password.length < 32) throw Error('Missing Slack tokens or OpenCode server password.')

  // SDK message objects can contain Slack payloads. Keep errors and counters only.
  const sdkFailures = createFailureTracker(diagnostic)
  const sdkLogger = {
    debug() {}, info() {},
    warn() { sdkFailures.fail('slack.sdk.warning', undefined) },
    error(...args) { sdkFailures.fail('slack.sdk.error', args.find(arg => arg instanceof Error)) },
    setLevel() {}, getLevel() { return 'warn' }, setName() {},
  }
  const app = new bolt.App({ token, appToken, socketMode: true, logger: sdkLogger, clientOptions: {
    timeout: 15000, retryConfig: { retries: 3, minTimeout: 1000, maxTimeout: 5000, randomize: true },
    rejectRateLimitedCalls: true,
  } })
  const { user_id: botId } = await app.client.auth.test()
  if (!botId) throw Error('Could not identify Slack bot.')
  const configured = loadProjects().filter(project => project.channelId)
  const drain = createDrainController()
  const supervisors = []
  process.once('exit', () => supervisors.forEach(supervisor => supervisor.stop()))
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
    diagnostic('INFO', 'bridge.stopping', { signal })
    supervisors.forEach(supervisor => supervisor.stop())
    await Promise.race([closeDiagnostics(), sleep(2000)])
    process.exit(0)
  })
  if (new Set(configured.map(project => project.channelId)).size !== configured.length ||
    new Set(configured.map(project => project.port)).size !== configured.length) throw Error('Duplicate project channel or port.')
  for (const project of configured) {
    const scoped = createProjectApp(app, project)
    // Approval/question replies remain available while draining. Track their Slack writes too.
    for (const type of ['action', 'view']) {
      const register = scoped[type].bind(scoped)
      scoped[type] = (constraint, handler) => register(constraint, args => drain.sealed
        ? args.ack()
        : drain.track(`callback:${project.name}`, () => handler(args)))
    }
    await registerProject(scoped, botId, project, password, drain, supervisors)
  }
  app.error(async error => { diagnostic('ERROR', 'slack.event.failed', { error }) })
  diagnostic('INFO', 'slack.connecting')
  const startupTimeout = setTimeout(() => {
    diagnostic('ERROR', 'slack.connection.timeout')
    void closeDiagnostics().finally(() => process.exit(1))
  }, 20000)
  try {
    await app.start()
  } finally {
    clearTimeout(startupTimeout)
  }
  diagnostic('INFO', 'slack.connected', { projects: configured.map(project => project.name) })
  await startRestartControl(drain)
}

async function registerProject(app, botId, project, password, drain, supervisors) {
  const { channelId, stateFile } = project
  const endpoint = `http://127.0.0.1:${project.port}`
  const newKey = () => `${project.name}:${randomUUID()}`
  const authorizedApproval = (body, request, sessions) => matchesApproval(body, request, sessions, channelId)
  const diagnostics = initializeDiagnostics()
  const log = (level, event, fields) => diagnostic(level, event, { project: project.name, ...fields })
  const failures = createFailureTracker(log)

  let state = { sessions: {}, received: [] }
  try {
    state = JSON.parse(await readFile(stateFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  state.pending ??= {}
  const save = createStateSaver(stateFile, () => state)

  const authorization = `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`
  async function rawApi(path, body, signal) {
    const response = await fetchOpenCode(`${endpoint}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined
        ? { Authorization: authorization, Connection: 'close' }
        : { Authorization: authorization, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
    if (!response.ok) throw Object.assign(Error(`OpenCode API returned ${response.status}`), { status: response.status })
    return response.status === 204 ? undefined : response.json()
  }
  async function api(path, body, timeout = 180_000) {
    const signal = AbortSignal.timeout(timeout)
    const operation = path.split('?')[0].replace(/\/(ses_|msg_)[^/]+/g, '/:id')
    try {
      await supervisor.waitReady(signal)
      const result = await rawApi(path, body, signal)
      failures.recover(`api.${operation}`)
      return result
    } catch (error) {
      failures.fail(`api.${operation}`, error, { operation, timeoutMs: timeout })
      throw error
    }
  }

  const requests = createSessionRequests({ api, sessionForThread: thread => state.sessions[thread] })

  const openCodeEnv = projectEnvironment(project, process.env)
  const supervisor = superviseProject({
    name: project.name,
    spawn: () => {
      const child = spawn('/home/pm/.opencode/bin/opencode', ['serve', '--hostname', '127.0.0.1', '--port', String(project.port), '--pure', '--print-logs', '--log-level', 'WARN'], {
        cwd: project.directory, env: openCodeEnv, stdio: ['ignore', 'ignore', 'pipe'],
      })
      captureChildDiagnostics(child.stderr, project.name, diagnostics)
      log('INFO', 'child.started', { pid: child.pid })
      child.once('error', error => log('ERROR', 'child.spawn.failed', { error, pid: child.pid }))
      child.once('exit', (exitCode, signal) => log('WARN', 'child.exited', { pid: child.pid, exitCode, signal }))
      return child
    },
    log: (message, fields) => log(message.includes('ready:') ? 'INFO' : 'WARN', message.includes('ready:') ? 'child.ready' : 'child.restart.scheduled', fields),
    health: () => rawApi('/global/health', undefined, AbortSignal.timeout(2500)),
  })
  supervisors.push(supervisor)
  const eventController = new AbortController()
  supervisors.push({ stop: () => eventController.abort() })
  void observeOpenCodeEvents({
    signal: eventController.signal,
    connect: async signal => {
      await supervisor.waitReady(signal)
      return fetchOpenCode(`${endpoint}/event`, { headers: { Authorization: authorization }, signal })
    },
    emit: (level, event, fields) => {
      const thread = Object.keys(state.sessions).find(thread => state.sessions[thread] === fields.sessionID)
      const pending = Object.values(state.pending).find(pending => pending.thread === thread && pending.messageID)
      log(level, event, { ...fields, thread, requestID: pending?.requestID, messageID: pending?.messageID })
    },
  }).catch(error => log('ERROR', 'opencode.events.observer.failed', { error }))
  const approvals = new Map()
  const questions = new Map()
  const patchNotices = new Map()

  async function pagesForPatch(reference) {
    const session = encodeURIComponent(reference.sessionID)
    const message = encodeURIComponent(reference.assistantID)
    const result = await api(`/session/${session}/message/${message}`, undefined, 2000)
    const part = result.parts?.find(part => part.id === reference.partID && part.tool === 'apply_patch' && part.state?.status === 'completed')
    return diffPages(patchDetails(part?.state))
  }

  app.action('opencode_view_diff', async ({ action, body, ack, client }) => {
    await ack()
    const reference = patchNotices.get(action.value)
    if (!authorizedApproval(body, reference, state.sessions) || !body.trigger_id) return
    try {
      // Slack trigger IDs expire quickly. Open the view before fetching the patch.
      const initial = diffView(action.value, [], 0)
      initial.blocks[0].text.text = '差分を読み込み中…'
      const { view } = await client.views.open({ trigger_id: body.trigger_id, view: initial })
      const pages = await pagesForPatch(reference).catch(() => [])
      await client.views.update({ view_id: view.id, hash: view.hash, view: diffView(action.value, pages, 0) })
    } catch {
      await client.chat.postEphemeral({ channel: channelId, user: memberId, thread_ts: reference.thread, text: '差分を開けませんでした。' }).catch(() => {})
    }
  })

  app.action(/^opencode_diff_(previous|next)$/, async ({ action, body, ack, client }) => {
    await ack()
    const key = body.view?.private_metadata
    const reference = patchNotices.get(key)
    if (body.user?.id !== memberId || body.view?.callback_id !== 'opencode_patch_diff' ||
      !reference || state.sessions[reference.thread] !== reference.sessionID || !/^\d+$/.test(action.value ?? '')) return
    const pages = await pagesForPatch(reference).catch(() => [])
    const index = Number(action.value)
    if (pages.length && (!Number.isSafeInteger(index) || index >= pages.length)) return
    await client.views.update({ view_id: body.view.id, hash: body.view.hash, view: diffView(key, pages, index) }).catch(() => {})
  })
  const notices = new Map()
  drain.register(project.name, project.port, () => openCodeActivity(api, () => notices.size))
  const completedRequests = new Set()
  async function recordDecision(request, decision, client) {
    request.decision = decision
    await closeNotice(request, client)
  }

  async function closeNotice(request, client) {
    await client.chat.update({ channel: channelId, ts: request.statusTs,
      text: request.decision, mrkdwn: false,
      blocks: [...request.blocks.filter(({ type }) => type !== 'actions'),
        { type: 'section', text: { type: 'plain_text', text: request.decision.slice(0, 3000) } }],
    })
    approvals.delete(request.key)
    questions.delete(request.key)
    notices.delete(request.identity)
    completedRequests.add(request.identity)
    if (completedRequests.size > 1000) completedRequests.delete(completedRequests.values().next().value)
  }

  async function syncRequests() {
    const [permissions, prompts] = await Promise.all(['/permission', '/question'].map(path => api(path, undefined, 4000)))
    const pending = new Map([...permissions.map(request => ['permission', request]), ...prompts.map(request => ['question', request])]
      .map(([kind, request]) => [`${kind}:${request.id}`, { kind, request }]))
    for (const [identity, notice] of notices) {
      if (notice.responding || (pending.has(identity) && !notice.decision)) continue
      await recordDecision(notice, notice.decision ?? '処理済み（回答内容は確認できません）', app.client)
    }
    for (const [identity, { kind, request }] of pending) {
      if (notices.has(identity) || completedRequests.has(identity)) continue
      const thread = Object.keys(state.sessions).find(thread => state.sessions[thread] === request.sessionID)
      if (!thread) continue
      const key = newKey()
      const choices = kind === 'question' ? questionChoices(request) : []
      const custom = kind === 'question' && acceptsCustomAnswer(request)
      const heading = `<@${memberId}> *OpenCode* · \`${kind === 'permission' ? 'approval required' : 'answer required'}\``
      const blocks = [{ type: 'section', text: { type: 'mrkdwn', text: heading } },
        ...(kind === 'permission' ? permissionBlocks(request, key) : questionBlocks(request, key, choices))]
      const { ts } = await app.client.chat.postMessage({ channel: channelId, thread_ts: thread, text: heading, blocks })
      if (!ts) throw Error('Slack did not return a message timestamp')
      const notice = { identity, key, id: request.id, sessionID: request.sessionID, thread, statusTs: ts, blocks, choices, custom,
        question: kind === 'question' ? String(request.questions?.[0]?.question ?? '') : undefined }
      notices.set(identity, notice)
      if (kind === 'permission') approvals.set(key, notice)
      else if (choices.length || custom) questions.set(key, notice)
    }
  }
  async function replyToQuestion({ key, request, answer, custom, client }) {
    const notify = (text) => client.chat.postEphemeral({ channel: channelId, user: memberId, thread_ts: request.thread, text }).catch(() => {})
    request.responding = true
    try {
      const pending = await api('/question', undefined, 4000)
      const current = pending.find(({ id, sessionID }) => id === request.id && sessionID === request.sessionID)
      if (questions.get(key) !== request || state.sessions[request.thread] !== request.sessionID || !current ||
        !(custom ? acceptsCustomAnswer(current) : questionChoices(current).includes(answer))) {
        await notify('この質問はすでに処理済みか、選択肢が変更されています。')
        return
      }
      await api(`/question/${encodeURIComponent(request.id)}/reply`, { answers: [[answer]] }, 4000)
      await recordDecision(request, `回答: ${answer}`, client).catch(error => log('ERROR', 'slack.question_history.failed', { error, sessionID: request.sessionID, thread: request.thread }))
    } catch {
      await notify('回答を送信できませんでした。質問が表示されていれば、もう一度お試しください。')
    } finally {
      request.responding = false
    }
  }
  app.action(/^opencode_question_[0-4]$/, async ({ action, body, ack, client }) => {
    await ack()
    const key = action.value
    const request = questions.get(key)
    if (!authorizedApproval(body, request, state.sessions) || request.responding) return
    const answer = request.choices[Number(action.action_id.split('_').at(-1))]
    if (answer) await replyToQuestion({ key, request, answer, custom: false, client })
  })
  app.action('opencode_question_custom', async ({ action, body, ack, client }) => {
    await ack()
    const request = questions.get(action.value)
    if (!authorizedApproval(body, request, state.sessions) || !request.custom || request.responding) return
    try {
      await client.views.open({ trigger_id: body.trigger_id, view: questionAnswerView(action.value, request.question) })
    } catch {
      await client.chat.postEphemeral({ channel: channelId, user: memberId, thread_ts: request.thread, text: '入力画面を開けませんでした。もう一度お試しください。' }).catch(() => {})
    }
  })
  app.view('opencode_question_answer', async ({ body, view, ack, client }) => {
    const key = view.private_metadata
    const request = questions.get(key)
    if (body.user?.id !== memberId || !request?.custom || request.responding || state.sessions[request.thread] !== request.sessionID) {
      await ack({ response_action: 'errors', errors: { answer: 'この質問は回答できません。スレッドを確認してください。' } })
      return
    }
    const answer = view.state.values.answer?.text?.value?.trim()
    if (!answer || answer.length > 3000) {
      await ack({ response_action: 'errors', errors: { answer: '1〜3000文字で回答してください。' } })
      return
    }
    request.responding = true
    await ack()
    await replyToQuestion({ key, request, answer, custom: true, client })
  })
  app.action(/^opencode_permission_(once|reject)$/, async ({ action, body, ack, client }) => {
    await ack()
    const request = approvals.get(action.value)
    if (!authorizedApproval(body, request, state.sessions) || request.responding) return
    const notify = (text) => client.chat.postEphemeral({ channel: channelId, user: memberId, thread_ts: request.thread, text }).catch(() => {})
    request.responding = true
    try {
      const pending = await api('/permission', undefined, 4000)
      if (approvals.get(action.value) !== request || !pending.some(({ id, sessionID }) => id === request.id && sessionID === request.sessionID)) {
        await notify('この権限要求は処理済みです。')
        return
      }
      const reply = action.action_id === 'opencode_permission_once' ? 'once' : 'reject'
      await api(`/permission/${encodeURIComponent(request.id)}/reply`, { reply }, 4000)
      await recordDecision(request, reply === 'once' ? '今回だけ許可' : '拒否', client).catch(error => log('ERROR', 'slack.approval_history.failed', { error, sessionID: request.sessionID, thread: request.thread }))
    } catch {
      await notify('権限への回答を送信できませんでした。処理済みでなければ、もう一度お試しください。')
    } finally {
      request.responding = false
    }
  })

  const lastTodos = new Map()
  async function waitForReply(sessionID, messageID, thread, send, request) {
    const path = `/session/${encodeURIComponent(sessionID)}/message?limit=50`
    const seen = new Map()
    let idleChecks = 0
    for (;;) {
      await sleep(2000)
      request.checkpoint()
      const status = await api('/session/status', undefined, 4000).catch(() => null)
      const messages = await api(path, undefined, 4000).catch(() => null)
      request.checkpoint()
      if (!status || !Array.isArray(messages)) {
        failures.fail(`monitor.${sessionID}`, Error('Session state or message history unavailable.'), { sessionID, messageID })
        continue
      }
      failures.recover(`monitor.${sessionID}`, { sessionID, messageID })
      const entries = toolLog(messages, messageID, seen, lastTodos.get(sessionID))
      if (entries.length) {
        try {
          for (let i = 0; i < entries.length; i++) {
            if (i > 0) await sleep(1100)
            const entry = entries[i]
            const text = entry.lines.join('\n')
            if (entry.hasDiff && entry.assistantID) {
              const key = newKey()
              const { ts } = await send(text, [
                { type: 'section', text: { type: 'plain_text', text } },
                { type: 'actions', elements: [{ type: 'button', action_id: 'opencode_view_diff', text: { type: 'plain_text', text: 'View diff' }, value: key }] },
              ])
              if (ts) {
                patchNotices.set(key, { sessionID, thread, statusTs: ts, assistantID: entry.assistantID, partID: entry.id })
                if (patchNotices.size > 1000) patchNotices.delete(patchNotices.keys().next().value)
              }
            } else if (entry.todoSnapshot && entry.lines.length) {
              const sendTodos = lines => {
                const text = lines.join('\n')
                const longestRun = Math.max(0, ...Array.from(text.matchAll(/`+/g), ([run]) => run.length))
                const fence = '`'.repeat(Math.max(3, longestRun + 1))
                return send(text, [{ type: 'markdown', text: `${fence}text\n${text}\n${fence}` }])
              }
              const [heading, ...items] = entry.lines
              await sendTodos([heading, ...items.slice(0, 12)])
              for (let start = 12; start < items.length; start += 12) {
                await sleep(1100)
                await sendTodos(['# Todos (continued)', ...items.slice(start, start + 12)])
              }
              lastTodos.set(sessionID, entry.todoSnapshot)
            } else if (text) {
              await send(text)
            }
            seen.set(entry.id, entry.status)
          }
        } catch (error) {
          if (!(error instanceof RequestInterruptedError)) failures.fail(`tool_history.${sessionID}`, error, { sessionID })
        }
      }
      request.checkpoint()
      if (status[sessionID] && status[sessionID].type !== 'idle') {
        idleChecks = 0
        continue
      }
      const reply = messages.findLast(({ info }) => info?.role === 'assistant' && info.parentID === messageID && !info.summary)
      if (reply?.info.error || (reply?.info.time?.completed && reply.info.finish && !['tool-calls', 'unknown'].includes(reply.info.finish))) return reply
      if (++idleChecks >= 8) {
        log('ERROR', 'response.incomplete', { sessionID, messageID, assistantID: reply?.info?.id, finish: reply?.info?.finish, idleChecks })
        throw Error('OpenCode finished without a final response.')
      }
    }
  }

  const skillMenus = new Map()
  async function availableSkills() {
    const skills = await api('/skill', undefined, 4000)
    return skills.filter(({ name }) => typeof name === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) && name.length <= 75)
      .map(({ name, description }) => ({ name, description: String(description ?? '').replace(/\s+/g, ' ').slice(0, 100) }))
  }

  async function showSkills(agent, thread, send, request) {
    const skills = await availableSkills()
    request.checkpoint()
    if (!skills.length) return send('利用できるスキルはありません。')
    const key = newKey()
    const lines = skills.map(({ name, description }) => `!s-${name}${description ? ` — ${description}` : ''}`)
    // Keep the picker and its authorization tied to the original thread.
    const blocks = [{ type: 'section', text: plain(`OpenCode · ${agent}`) }]
    for (let i = 0; i < Math.min(lines.length, 100); i += 15) {
      blocks.push({ type: 'section', text: plain(lines.slice(i, Math.min(i + 15, 100)).join('\n')) })
    }
    blocks.push({ type: 'actions', elements: [{ type: 'button', action_id: 'opencode_open_skills', text: plain('Choose skill'), value: key }] })
    const { ts } = await send(`OpenCode · ${agent} · Skills`, blocks)
    if (!ts) return
    skillMenus.set(key, { thread, ts, agent, skills })
    if (skillMenus.size > 200) skillMenus.delete(skillMenus.keys().next().value)
  }

  function threadSender(client, thread) {
    return (text, blocks) => client.chat.postMessage({ channel: channelId, thread_ts: thread, text, blocks, mrkdwn: false, unfurl_links: false, unfurl_media: false })
  }

  function enqueueRequest(thread, task, send, epoch = requests.epoch(thread)) {
    if (drain.draining) return send(drainingMessage).catch(() => {})
    // Enqueue synchronously so a following !stop also sees requests not yet started by a microtask.
    const result = requests.enqueue(thread, task, epoch)
    return drain.track(`request:${project.name}`, () => result)
  }
  app.action('opencode_open_skills', async ({ action, body, ack, client }) => {
    await ack()
    const menu = skillMenus.get(action.value)
    if (!menu || body.user?.id !== memberId || body.channel?.id !== channelId || body.container?.message_ts !== menu.ts ||
      (body.message?.thread_ts ?? body.container?.thread_ts) !== menu.thread || !body.trigger_id) return
    await client.views.open({ trigger_id: body.trigger_id, view: skillView(action.value, menu.agent, menu.skills) })
  })
  app.view('opencode_run_skill', async ({ body, view, ack, client }) => {
    const menu = skillMenus.get(view.private_metadata)
    const name = view.state.values.skill?.name?.selected_option?.value
    if (body.user?.id !== memberId || !menu?.skills.some(skill => skill.name === name)) {
      await ack({ response_action: 'errors', errors: { skill: 'この一覧は利用できません。スレッドで !s を送り直してください。' } })
      return
    }
    const request = view.state.values.request?.text?.value?.trim() ?? ''
    const epoch = requests.epoch(menu.thread)
    await ack()
    if (requests.epoch(menu.thread) !== epoch) return
    const send = threadSender(client, menu.thread)
    if (drain.draining) return send(drainingMessage).catch(() => {})
    const key = newKey()
    const pending = state.pending[key] = {
      agent: menu.agent, prompt: `!s-${name} ${request}`.trim(), thread: menu.thread, requestID: randomUUID(),
    }
    log('INFO', 'request.accepted', { thread: menu.thread, requestID: pending.requestID, agent: menu.agent })
    const persisted = save().then(() => null, error => error)
    return enqueueRequest(menu.thread, async context => {
      try {
        const error = await persisted
        if (error) throw error
        await runRequest({ ...pending, client, send, request: context, pending })
      } catch (error) {
        if (!(error instanceof RequestInterruptedError) && !context.signal.aborted) {
          await send('スキルを実行できませんでした。').catch(() => {})
        }
      } finally {
        await finishPending(state.pending, key, save)
      }
    }, send, epoch)
  })

  async function runRequest(args) {
    const requestID = args.pending.requestID ??= randomUUID()
    return withLogContext({ project: project.name, thread: args.thread, requestID, sessionID: state.sessions[args.thread] }, async () => {
      const started = Date.now()
      log('INFO', 'request.started', { agent: args.agent, recovering: Boolean(args.pending.messageID) })
      try { return await executeRequest(args) }
      finally { log('INFO', 'request.finished', { sessionID: args.request.sessionID, elapsedMs: Date.now() - started }) }
    })
  }

  async function executeRequest({ agent, prompt, thread, client, send, request, pending }) {
    try {
      request.checkpoint()
      const rawSend = send
      send = (...args) => { request.checkpoint(); return rawSend(...args) }
      if (pending?.answer) {
        return await postCompletedAnswer(client, thread, pending.answer, channelId, request.checkpoint,
          { delivery: pending.delivery, save, signal: request.signal })
      }
      await supervisor.waitReady(request.signal)
      const skill = pending?.messageID ? null : parseSkill(prompt)
      if (skill?.type === 'list') return await showSkills(agent, thread, send, request)
      if (skill?.type === 'run') {
        const skills = await availableSkills()
        request.checkpoint()
        if (!skills.some(({ name }) => name === skill.name)) {
          const near = skills.filter(({ name }) => name.includes(skill.name)).slice(0, 8)
          return await send(`スキルが見つかりません: ${skill.name}\n${near.length ? `候補: ${near.map(({ name }) => `!s-${name}`).join(', ')}\n` : ''}一覧: !s`)
        }
        prompt = `まず OpenCode の skill ツールで ${JSON.stringify(skill.name)} を読み込み、その指示に従ってください。\n\n${skill.request || 'このセッションの直前の作業に適用してください。対象が不明なら確認してください。'}`
      }
      const id = state.sessions[thread]
      request.sessionID = id
      if (id && !pending?.messageID) {
        const status = (await api('/session/status', undefined, 4000))[id]
        request.checkpoint()
        if (status && status.type !== 'idle') {
          return await send('このスレッドでは処理中の依頼があります。進捗や回答待ちの投稿を確認してください。')
        }
      }
      await executePrompt({ agent, prompt, thread, client, send, id, request, pending })
      log('INFO', 'request.completed')
    } catch (error) {
      if (error instanceof RequestInterruptedError || error?.name === 'MessageAbortedError') {
        log('INFO', 'request.interrupted')
        if (!request.signal.aborted) await notifyThread(client, thread, 'interrupted', '中断しました。', channelId)
        return
      }
      if (request.signal.aborted) return
      log('ERROR', 'request.failed', { error, sessionID: request.sessionID, messageID: pending?.messageID })
      const detail = error instanceof ProjectInstructionsError
        ? '専用指示ファイルを読み込めませんでした。空でないファイルを用意して、依頼を再送してください。'
        : 'OpenCode のセッションで詳細を確認してください。'
      await notifyThread(client, thread, 'failed', detail, channelId)
    }
  }

  const onMessage = ({ event, body, client }) => {
    if (event.channel !== channelId || event.user !== memberId || !event.ts || !body.event_id) return
    const thread = event.thread_ts ?? event.ts
    const messageKey = `${event.channel}:${event.ts}`
    const send = threadSender(client, thread)
    if (state.received.includes(body.event_id) || state.received.includes(messageKey)) return
    const text = acceptedText(event, botId, Boolean(state.sessions[thread]) || requests.has(thread), channelId)
    if (!text) return
    if (text === '!stop') {
      if (drain.sealed) return send(drainingMessage).catch(() => {})
      state.received = [...state.received.slice(-499), messageKey]
      clearThreadPending(state.pending, thread)
      const stopping = requests.stop(thread)
      return drain.track(`stop:${project.name}`, async () => {
        try {
          const [result] = await Promise.all([stopping, save()])
          await save()
          const detail = result.cancelled ? `待機中の依頼 ${result.cancelled} 件も取り消しました。` : ''
          if (result.stopped) await notifyThread(client, thread, 'interrupted', `中断しました。${detail}`, channelId)
          else await send('実行中の処理はありません。')
        } catch (error) {
          log('ERROR', 'request.stop.failed', { thread, error })
          await save().catch(() => {})
          await send('中断を確認できませんでした。OpenCode の状態を確認し、必要なら !stop を再送してください。').catch(() => {})
        }
      })
    }
    if (drain.draining) return send(drainingMessage).catch(() => {})
    state.received = [...state.received.slice(-499), messageKey]
    const { agent, prompt } = parseAgent(text)
    const pending = state.pending[messageKey] = { agent, prompt, thread, requestID: randomUUID() }
    log('INFO', 'request.accepted', { thread, requestID: pending.requestID, sessionID: state.sessions[thread], agent })
    const persisted = save().then(() => null, error => error)
    return enqueueRequest(thread, async request => {
      try {
        const error = await persisted
        if (error) throw error
        request.checkpoint()
        if (!prompt) {
          await send('Usage: !p <request> (!plan) or !b <request> (!build)')
          return
        }
        await runRequest({ agent, prompt, thread, client, send, request, pending })
      } catch (error) {
        if (!(error instanceof RequestInterruptedError) && !request.signal.aborted) {
          log('ERROR', 'request.queue.failed', { thread, requestID: pending.requestID, error })
          await send('依頼を受け付けられませんでした。').catch(() => {})
        }
      } finally {
        await finishPending(state.pending, messageKey, save)
      }
    }, send)
  }

  async function executePrompt({ agent, prompt, thread, client, send, id, request, pending = {} }) {
    const promptBody = await projectPrompt(project, { agent, prompt })
    request.checkpoint()
    await send('Thinking…').catch(error => log('ERROR', 'slack.progress.failed', { error }))
    request.checkpoint()
    if (!id) {
      const session = await api('/session', { title: `Slack ${project.name} ${thread}` })
      id = session.id
      if (!/^ses_[A-Za-z0-9]+$/.test(id)) throw Error('Invalid OpenCode session ID.')
      request.sessionID = id
      state.sessions[thread] = id
      await save()
      request.checkpoint()
      await send(`OpenCode session: ${id}`).catch(error => log('ERROR', 'slack.session_notice.failed', { error }))
    }
    // Use OpenCode's ascending timestamp prefix to keep the message ordered in history.
    const messageID = pending.messageID ?? `msg_${(BigInt(Date.now()) << 12n).toString(16).padStart(12, '0')}${randomUUID().replaceAll('-', '')}`
    updateLogContext({ sessionID: id, messageID })
    const sessionPath = `/session/${encodeURIComponent(id)}`
    await submitPromptOnce(pending, messageID, save,
      () => request.submit(() => api(`${sessionPath}/prompt_async`, { ...promptBody, messageID }, 10000)))
    log('INFO', 'prompt.monitoring', { sessionID: id, messageID })
    request.checkpoint()
    const reply = await waitForReply(id, messageID, thread, send, request)
    if (reply.info?.error?.name === 'MessageAbortedError') throw new RequestInterruptedError()
    if (reply.info?.error) {
      const modelError = reply.info.error
      log('ERROR', 'opencode.response.failed', { sessionID: id, messageID, error: {
        name: modelError.name, message: modelError.data?.message, code: modelError.data?.code,
        statusCode: modelError.data?.statusCode,
      } })
      throw Error('OpenCode reported a session error.')
    }
    const answer = reply.parts?.filter((part) => part.type === 'text').map((part) => part.text).join('\n\n')?.trim()
    if (!answer) throw Error('OpenCode did not return a text response.')
    log('INFO', 'response.ready', { sessionID: id, messageID })
    request.checkpoint()
    const formatted = await attachMermaid(answer, (file, number) => {
      request.checkpoint()
      return client.filesUploadV2({
        channel_id: channelId, thread_ts: thread, file,
        filename: `mermaid-${number}.png`, title: `図 ${number}`,
      })
    }, source => {
      request.checkpoint()
      return renderMermaid(source)
    })
    pending.answer = formatted
    pending.delivery = { ids: splitMarkdown(formatted).map(() => randomUUID()), sent: 0 }
    await save()
    await postCompletedAnswer(client, thread, formatted, channelId, request.checkpoint,
      { delivery: pending.delivery, save, signal: request.signal })
  }
  app.event('app_mention', onMessage)
  app.event('message', onMessage)
  // Restore queued work and observe submitted prompts without submitting twice.
  for (const [key, pending] of Object.entries(state.pending)) {
    const send = threadSender(app.client, pending.thread)
    void enqueueRequest(pending.thread, async request => {
      try {
        await runRequest({ ...pending, client: app.client, send, request, pending })
      } finally {
        await finishPending(state.pending, key, save)
      }
    }, send).catch(error => log('ERROR', 'request.recovery.failed', { error, thread: pending.thread, requestID: pending.requestID }))
  }
  void (async () => {
    for (;;) {
      try {
        await drain.track(`poll:${project.name}`, syncRequests)
        failures.recover('approvals.sync')
      } catch (error) { failures.fail('approvals.sync', error) }
      await sleep(2000)
    }
  })()
}
