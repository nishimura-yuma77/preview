const list = document.querySelector('#replies')
const status = document.querySelector('#status')
let previous
function announce(text) {
  if (status.textContent !== text) status.textContent = text
}

async function refresh() {
  try {
    const res = await fetch('/task/api/pending', { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw Error('unavailable')
    const { items } = await res.json()
    const snapshot = JSON.stringify(items)
    if (snapshot !== previous) {
      const nodes = items.map(({ display_name, reference_url }) => {
        const link = document.createElement('a')
        const url = new URL(reference_url)
        if (url.protocol !== 'https:') throw Error('invalid link')
        link.href = url.href
        link.textContent = display_name
        const li = document.createElement('li')
        li.append(link)
        return li
      })
      const oldLinks = [...list.querySelectorAll('a')]
      const focused = document.activeElement
      const index = oldLinks.indexOf(focused)
      list.replaceChildren(...nodes)
      if (index >= 0) {
        const links = [...list.querySelectorAll('a')]
        const like = links.filter(a => a.textContent === focused.textContent)
        const next = links.find(a => a.href === focused.href) ?? (like.length === 1 ? like[0] : links[Math.min(index, links.length - 1)])
        next?.focus({ preventScroll: true })
      }
      previous = snapshot
    }
    announce(items.length ? `${items.length}件の返信待ち` : '返信待ちの用件はありません。')
  } catch {
    announce('一覧を更新できませんでした。自動で再試行します。')
  } finally {
    setTimeout(refresh, 5000)
  }
}

refresh()
