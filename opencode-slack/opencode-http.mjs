// Use Node's bundled HTTP client; the deployed Node.js 26.13.1 includes
// the paused-parser fix needed when the peer closes an unconsumed response.
export const fetchOpenCode = (...args) => globalThis.fetch(...args)
