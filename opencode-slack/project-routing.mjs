// One Socket Mode connection receives all channels. Each project owns its
// listeners, including modal callbacks that have no channel in their payload.
export function createProjectApp(app, project) {
  const prefix = `${project.name}:`
  const owns = key => typeof key === 'string' && key.startsWith(prefix)
  return {
    client: app.client,
    event(type, handler) {
      app.event(type, args => {
        if (args.event.channel === project.channelId) return handler(args)
      })
    },
    action(constraint, handler) {
      app.action(constraint, args => {
        const key = args.body.view?.private_metadata ?? args.action.value
        if (!owns(key)) return
        if (!args.body.view && args.body.channel?.id !== project.channelId) return
        return handler(args)
      })
    },
    view(constraint, handler) {
      app.view(constraint, args => {
        if (owns(args.view.private_metadata)) return handler(args)
      })
    },
  }
}
