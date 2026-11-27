import path from 'node:path'

const project = '/home/pm/workspace/seijinbu'
const sensitive = /(?:authorization|bearer\s|password|passwd|secret|token|api[ _-]?key|private[ _-]?key|credential|xox[baprs]-|xapp-|gh[pousr]_|github_pat_|sk-(?:live|proj|ant)-|BEGIN [A-Z ]*PRIVATE KEY)/i
const hiddenPath = /(?:^|\/)(?:\.(?:env[^/]*|git|ssh|aws|config|npmrc|netrc)|[^/]*(?:htpasswd|secrets?|credentials?)[^/]*|[^/]+\.(?:pem|key|p12|pfx))(?:\/|$)/i
const clean = (value, limit = 180) => typeof value === 'string' && value.trim() && !sensitive.test(value)
  ? value.replace(/[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0, limit) : ''

function displayPath(value, limit = 180) {
  if (typeof value !== 'string' || !value || hiddenPath.test(value) || /[\x00-\x1f\x7f]/.test(value)) return ''
  const relative = path.relative(project, path.resolve(project, value))
  return relative === '..' || relative.startsWith('../') || hiddenPath.test(relative) ? '' : clean(relative || '.', limit)
}

export function todoLines(state) {
  const todos = state?.metadata?.todos ?? state?.input?.todos
  if (!Array.isArray(todos)) return null
  if (!todos.length) return ['Todos cleared']
  return ['# Todos', ...todos.map(todo => {
    const status = todo?.status
    const mark = status === 'completed' ? '✓' : status === 'in_progress' ? '•' : status === 'cancelled' ? '–' : ' '
    const content = clean(todo?.content, 240)
    return `[${mark}] ${content || '[非表示]'}`
  })]
}

export function webFetchResult(state) {
  let target = ''
  try {
    const url = new URL(state?.input?.url)
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      const decodedPath = decodeURIComponent(url.pathname)
      const visiblePath = hiddenPath.test(decodedPath) || sensitive.test(decodedPath) ||
        /[a-zA-Z0-9_-]{32,}/.test(decodedPath) ? '/[非表示]' : clean(url.pathname)
      target = ` ${url.host}${visiblePath}`
    }
  } catch {
    // Some failed requests have no valid URL to display.
  }
  const code = /^StatusCode: non 2xx status code \(([1-5]\d{2})\b/.exec(state?.error ?? '')?.[1]
  if (state?.status === 'error') return `✖ WebFetch${target} — ${code ? `HTTP ${code}` : '取得失敗'}`
  if (state?.status === 'completed') return `✓ WebFetch${target} — 取得完了`
  return `→ WebFetch${target}`
}

export function toolLabel(tool, input = {}) {
  const root = displayPath(input.path)
  const file = displayPath(input.filePath ?? input.file_path ?? input.filepath)
  const pattern = clean(input.pattern)
  const args = Object.entries({ offset: input.offset, limit: input.limit }).filter(([, value]) => Number.isSafeInteger(value) && value >= 0)
  switch (tool) {
    case 'read': return `→ Read${file ? ` ${file}` : ''}${args.length ? ` [${args.map(([k, v]) => `${k}=${v}`).join(', ')}]` : ''}`
    case 'grep':
    case 'glob': return `✱ ${tool === 'grep' ? 'Grep' : 'Glob'}${pattern ? ` ${JSON.stringify(pattern)}` : ''}${root ? ` in ${root}` : ''}`
    case 'edit': return `← Edit${file ? ` ${file}` : ''}`
    case 'write': return `← Write${file ? ` ${file}` : ''}`
    case 'list': return `→ List${root ? ` ${root}` : ''}`
    case 'skill': return `→ Skill${clean(input.name) ? ` ${JSON.stringify(clean(input.name))}` : ''}`
    case 'task': return `⚙ Task${clean(input.description) ? ` — ${clean(input.description)}` : ''}`
    case 'bash': {
      const command = input.command
      if (typeof command === 'string' && /^(?:git (?:status(?: --short(?: --branch)?)?|diff --(?:stat|check))|npm run check:(?:conventions|imports|hooks|server-layers)|npm test|npx tsc --noEmit)$/.test(command)) return `$ ${command}`
      return `⚙ bash${clean(input.description) ? ` — ${clean(input.description)}` : ''}`
    }
    default: return `⚙ ${tool}`
  }
}

export function patchDetails(state) {
  const files = state?.structured?.files ?? state?.metadata?.files
  if (!Array.isArray(files)) return []
  return files.flatMap(file => {
    const operation = ({ add: '+ Created', update: '~ Patched', delete: '- Deleted', move: '→ Moved' })[file?.type]
    const from = displayPath(file?.filePath ?? file?.relativePath, 200)
    const to = file?.type === 'move' ? displayPath(file.movePath, 200) : ''
    if (!operation || !from || (file.type === 'move' && !to)) return []
    const label = `${operation} ${from}${to ? ` → ${to}` : ''}`
    let inPrivateKey = false
    const diff = typeof file.patch === 'string' ? file.patch.split('\n').map(line => {
      if (/BEGIN .*PRIVATE KEY/i.test(line)) inPrivateKey = true
      const redacted = inPrivateKey || sensitive.test(line) || /[A-Za-z0-9+_/-]{48,}/.test(line)
      if (/END .*PRIVATE KEY/i.test(line)) inPrivateKey = false
      return redacted ? `${/^[+ -]/.test(line) ? line[0] : ''}[redacted]` : line
    }).join('\n') : ''
    return [{ label, diff }]
  })
}

export function diffPages(files) {
  return files.flatMap(({ label, diff }) => {
    if (!diff.trim()) return []
    const pages = []
    let rest = diff
    while (rest.length) {
      let end = Math.min(rest.length, 2800)
      if (end < rest.length) {
        const line = rest.lastIndexOf('\n', end - 1)
        if (line > 0) end = line + 1
        if (/[\uD800-\uDBFF]/.test(rest[end - 1])) end--
      }
      pages.push({ label, text: rest.slice(0, end) })
      rest = rest.slice(end)
    }
    return pages
  })
}

export function diffView(key, pages, index) {
  const plain = (text) => ({ type: 'plain_text', text, emoji: false })
  const page = pages[index]
  const blocks = [{ type: 'section', text: plain(page ? `${page.label}\n${index + 1} / ${pages.length}` : '差分を取得できませんでした。') }]
  if (page) blocks.push({ type: 'rich_text', elements: [{ type: 'rich_text_preformatted', elements: [{ type: 'text', text: page.text }] }] })
  const elements = [[index - 1, 'Previous'], [index + 1, 'Next']].filter(([i]) => i >= 0 && i < pages.length)
    .map(([i, label]) => ({ type: 'button', action_id: `opencode_diff_${label.toLowerCase()}`, text: plain(label), value: String(i) }))
  if (elements.length) blocks.push({ type: 'actions', elements })
  return { type: 'modal', callback_id: 'opencode_patch_diff', private_metadata: key, title: plain('OpenCode · Diff'), close: plain('Close'), blocks }
}
