import { installUndiciTracing } from './undici-trace.mjs'
import { diagnostic, closeDiagnostics } from './diagnostics.mjs'

installUndiciTracing()
import('./bridge.mjs').then(({ main }) => main()).catch(async (error) => {
  diagnostic('ERROR', 'bridge.startup.failed', { error })
  const slackError = error?.data?.error
  const detail = typeof slackError === 'string' && /^[a-z_]+$/.test(slackError) ? ` (${slackError})` : ''
  console.error(`Slack bridge startup failed${detail}. Check secrets.env, Slack scopes and port 4096.`)
  await closeDiagnostics()
  process.exit(1)
})
