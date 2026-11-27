import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const runtime = 'mcr.microsoft.com/playwright@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea'
const path = (name) => fileURLToPath(new URL(name, import.meta.url))

export function renderMermaid(source) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', [
      'run', '--rm', '--pull=never', '-i', '--network=none', '--read-only',
      '--cap-drop=ALL', '--security-opt=no-new-privileges', '--user=1000:1000',
      '--memory=512m', '--cpus=1', '--pids-limit=128', '--tmpfs', '/tmp:rw,nosuid,nodev,size=128m',
      '--env', 'HOME=/tmp', '-v', `${path('node_modules')}:/app/node_modules:ro`,
      '-v', `${path('render-mermaid.mjs')}:/app/render-mermaid.mjs:ro`,
      runtime, 'timeout', '-k', '2s', '18s', 'node', '/app/render-mermaid.mjs',
    ], { stdio: ['pipe', 'pipe', 'ignore'], signal: AbortSignal.timeout(25000) })
    const chunks = []
    let size = 0
    child.stdout.on('data', (chunk) => {
      size += chunk.length
      if (size > 8 * 1024 * 1024) {
        child.kill()
        reject(new Error('Diagram exceeds upload limit'))
      } else chunks.push(chunk)
    })
    child.on('error', reject)
    child.stdin.on('error', reject)
    child.on('close', (code) => {
      const png = Buffer.concat(chunks)
      if (code !== 0 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') reject(new Error('Diagram rendering failed'))
      else resolve(png)
    })
    child.stdin.end(source)
  })
}

export async function attachMermaid(answer, upload, render = renderMermaid) {
  // Scan all fences so Mermaid examples embedded in other code blocks stay literal.
  const lines = answer.match(/[^\n]*\n|[^\n]+$/g) ?? []
  let fence
  let offset = 0
  let cursor = 0
  let number = 0
  const parts = []
  for (const line of lines) {
    const start = offset
    offset += line.length
    const marker = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)/.exec(line)
    if (!marker) continue
    const [, delimiter, info] = marker
    if (!fence) {
      if (delimiter[0] === '`' && info.includes('`')) continue
      fence = { delimiter, mermaid: info.trim() === 'mermaid', start, body: offset }
      continue
    }
    if (delimiter[0] !== fence.delimiter[0] || delimiter.length < fence.delimiter.length || info.trim()) continue
    const block = fence
    fence = undefined
    if (!block.mermaid || number >= 4) continue
    const source = answer.slice(block.body, start).trim()
    if (source.length > 16000 || !/^(?:flowchart\b|graph\b|sequenceDiagram\b)/.test(source)) continue
    // Keep renderer configuration and styling from diagram input out of the rendering process.
    if (source.includes('%%{')) continue
    number++
    try {
      const png = await render(source)
      await upload(png, number)
      parts.push(answer.slice(cursor, block.start), `**図 ${number}** — このスレッドの添付画像を参照\n`)
      cursor = offset
    } catch {
      console.error(`Could not render or attach Mermaid diagram ${number}; keeping source.`)
    }
  }
  return parts.join('') + answer.slice(cursor)
}
