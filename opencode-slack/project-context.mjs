import { readFile } from 'node:fs/promises'

export class ProjectInstructionsError extends Error {
  constructor(cause) {
    super('Could not load project instructions.', { cause })
    this.name = 'ProjectInstructionsError'
  }
}

export function projectEnvironment(project, environment) {
  const env = { ...environment, OPENCODE_SERVER_USERNAME: 'opencode' }
  delete env.SLACK_APP_TOKEN
  delete env.REPLY_WATCH_TOKEN
  delete env.SLACK_BOT_TOKEN
  if (project.skillsPath) {
    const config = JSON.parse(env.OPENCODE_CONFIG_CONTENT || '{}')
    const paths = config.skills?.paths ?? []
    env.OPENCODE_CONFIG_CONTENT = JSON.stringify({
      ...config,
      skills: { ...config.skills, paths: [...new Set([...paths, project.skillsPath])] },
    })
  }
  return env
}

export async function projectPrompt(project, { messageID, agent, prompt }) {
  const body = { messageID, agent, parts: [{ type: 'text', text: prompt }] }
  if (project.instructionsFile) {
    try {
      const instructions = await readFile(project.instructionsFile, 'utf8')
      if (!instructions.trim()) throw Error('Empty project instructions.')
      body.system = instructions
    } catch (cause) {
      throw new ProjectInstructionsError(cause)
    }
  }
  return body
}
