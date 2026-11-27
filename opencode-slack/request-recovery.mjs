export async function submitPromptOnce(pending, messageID, save, submit) {
  if (pending.messageID) return
  // Persist before sending. If submission is ambiguous, recovery observes the
  // original message rather than risking a second agent execution.
  pending.messageID = messageID
  await save()
  try {
    await submit()
  } catch (error) {
    if (error.name !== 'TimeoutError' && error.name !== 'TypeError') throw error
  }
}

export function clearThreadPending(pending, thread) {
  for (const [key, request] of Object.entries(pending)) {
    if (request.thread === thread) delete pending[key]
  }
}

export async function finishPending(pending, key, save) {
  const request = pending[key]
  if (request && (!request.answer || request.delivery.sent >= request.delivery.ids.length)) delete pending[key]
  await save()
}
