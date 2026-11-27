import bolt from '@slack/bolt'

export function createSlackApp({ token, appToken, logger, slackApiUrl }) {
  return new bolt.App({ token, appToken, socketMode: true, logger, clientOptions: {
    slackApiUrl,
    timeout: 15000, retryConfig: { retries: 3, minTimeout: 1000, maxTimeout: 5000, randomize: true },
    rejectRateLimitedCalls: true,
  } })
}
