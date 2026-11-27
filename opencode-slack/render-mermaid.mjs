import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const source = await readFile('/dev/stdin', 'utf8')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 })
  await page.route('**/*', (route) => route.abort())
  await page.setContent('<style>body{margin:0;background:white}#diagram{display:inline-block;padding:24px}svg{display:block;max-width:1400px;height:auto}</style><div id="diagram"></div>')
  await page.addScriptTag({ content: await readFile('/app/node_modules/mermaid/dist/mermaid.min.js', 'utf8') })
  await page.evaluate(async (input) => {
    const mermaid = globalThis.mermaid.default ?? globalThis.mermaid
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default', maxTextSize: 16000, flowchart: { htmlLabels: false, useMaxWidth: false }, sequence: { useMaxWidth: false } })
    const { svg } = await mermaid.render('mermaid-image', input)
    document.getElementById('diagram').innerHTML = svg
  }, source)
  const diagram = page.locator('#diagram')
  const bounds = await diagram.boundingBox()
  if (!bounds || bounds.width > 1500 || bounds.height > 3000) throw new Error('Diagram exceeds image bounds')
  process.stdout.write(await diagram.screenshot({ type: 'png', timeout: 8000 }))
} finally {
  await browser.close()
}
