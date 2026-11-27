export function loadProjects() {
  return [
    {
      name: 'seijinbu',
      channelId: 'C0AK19DK9RR',
      directory: '/home/pm/workspace/seijinbu',
      port: 4096,
      stateFile: new URL('./sessions.json', import.meta.url),
    },
    {
      name: 'hiromeru',
      channelId: process.env.HIROMERU_SLACK_CHANNEL_ID || 'C0CM2FSB0SW',
      directory: '/home/pm/workspace/hiromeru',
      port: 4097,
      stateFile: new URL('./sessions-hiromeru.json', import.meta.url),
    },
    {
      name: 'butler',
      channelId: process.env.BUTLER_SLACK_CHANNEL_ID ?? 'C0CLTFN8K6K',
      directory: '/home/pm/workspace',
      port: 4098,
      stateFile: new URL('./sessions-butler.json', import.meta.url),
      instructionsFile: '/home/pm/workspace/butler/instructions.md',
      skillsPath: '/home/pm/workspace/butler/skills',
    },
    {
      name: 'professor-jk',
      channelId: process.env.PROFESSOR_JK_SLACK_CHANNEL_ID ?? 'C0CN3CZEJU8',
      directory: '/home/pm/workspace/professor-jk',
      port: 4099,
      stateFile: new URL('./sessions-professor-jk.json', import.meta.url),
    },
  ]
}
