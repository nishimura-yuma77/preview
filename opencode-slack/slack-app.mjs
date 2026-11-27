import bolt from '@slack/bolt'
import { fetch } from 'undici'

export function createSlackApp({ token, appToken, logger, slackApiUrl }) {
  // Bolt forwards these options to its WebClient, response_url helper and
  // Socket Mode's apps.connections.open client. Do not fall back to built-in fetch.
  return new bolt.App({ token, appToken, socketMode: true, logger, clientOptions: {
    fetch, slackApiUrl,
    timeout: 15000, retryConfig: { retries: 3, minTimeout: 1000, maxTimeout: 5000, randomize: true },
    rejectRateLimitedCalls: true,
  } })
}
