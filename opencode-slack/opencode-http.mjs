// Keep OpenCode's HTTP and SSE traffic off Node's bundled Undici: versions
// containing undici#5360 can crash outside the fetch promise on socket FIN.
// The pinned package includes the complete paused-parser fix from undici#5474.
export { fetch as fetchOpenCode } from 'undici'
