import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { ProjectInstructionsError, projectEnvironment, projectPrompt } from './project-context.mjs'
import { loadProjects } from './projects.mjs'
import { parseAgent } from './bridge.mjs'

test('Butler skills are added only to its child environment while preserving existing configuration', () => {
  const environment = {
    SLACK_APP_TOKEN: 'app-token', SLACK_BOT_TOKEN: 'bot-token', OPENCODE_SERVER_PASSWORD: 'password',
    OPENCODE_CONFIG_CONTENT: JSON.stringify({ model: 'provider/model', skills: { paths: ['/shared'], urls: ['https://example.com/skills'] } }),
  }
  const original = structuredClone(environment)
  const butler = projectEnvironment({ skillsPath: '/butler/skills' }, environment)
  const other = projectEnvironment({}, environment)
  assert.deepEqual(JSON.parse(butler.OPENCODE_CONFIG_CONTENT), {
    model: 'provider/model', skills: { paths: ['/shared', '/butler/skills'], urls: ['https://example.com/skills'] },
  })
  assert.equal(other.OPENCODE_CONFIG_CONTENT, environment.OPENCODE_CONFIG_CONTENT)
  for (const env of [butler, other]) {
    assert.equal(env.SLACK_APP_TOKEN, undefined)
    assert.equal(env.SLACK_BOT_TOKEN, undefined)
    assert.equal(env.OPENCODE_SERVER_USERNAME, 'opencode')
    assert.equal(env.OPENCODE_SERVER_PASSWORD, 'password')
  }
  assert.deepEqual(environment, original)
})

test('Butler skills work without inline configuration and duplicate paths are deduplicated', () => {
  const project = { skillsPath: '/butler/skills' }
  const first = projectEnvironment(project, {})
  assert.deepEqual(JSON.parse(first.OPENCODE_CONFIG_CONTENT), { skills: { paths: ['/butler/skills'] } })
  assert.equal(projectEnvironment(project, first).OPENCODE_CONFIG_CONTENT, first.OPENCODE_CONFIG_CONTENT)
  assert.throws(() => projectEnvironment(project, { OPENCODE_CONFIG_CONTENT: 'invalid json' }), SyntaxError)
})

test('build, plan, continued requests and skill requests receive fresh system instructions without changing their text', async () => {
  const directory = await mkdtemp('/tmp/opencode/butler-context-')
  try {
    const project = { instructionsFile: join(directory, 'instructions.md') }
    const messages = ['!p design', '!b implement', 'continue', '!b まず skill ツールでスキルを読み込んでください。']
    for (const [index, text] of messages.entries()) {
      const instructions = `Butler instructions version ${index}`
      await writeFile(project.instructionsFile, instructions)
      const request = { messageID: `msg_${index}`, ...parseAgent(text) }
      const body = await projectPrompt(project, request)
      assert.deepEqual(body, {
        messageID: request.messageID, agent: request.agent,
        parts: [{ type: 'text', text: request.prompt }], system: instructions,
      })
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('projects without an instructions file retain their existing prompt body', async () => {
  assert.deepEqual(await projectPrompt({}, { messageID: 'msg_1', agent: 'build', prompt: 'hello' }), {
    messageID: 'msg_1', agent: 'build', parts: [{ type: 'text', text: 'hello' }],
  })
})

test('missing, unreadable and empty instructions reject the request instead of sending it without guidance', async () => {
  const directory = await mkdtemp('/tmp/opencode/butler-context-')
  try {
    const file = join(directory, 'instructions.md')
    const request = { agent: 'plan', prompt: 'hello' }
    await assert.rejects(projectPrompt({ instructionsFile: file }, request), ProjectInstructionsError)
    await assert.rejects(projectPrompt({ instructionsFile: directory }, request), ProjectInstructionsError)
    await writeFile(file, ' \n')
    await assert.rejects(projectPrompt({ instructionsFile: file }, request), ProjectInstructionsError)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('Butler routes to its configured channel, supports an environment override and uses a dedicated port and state file', () => {
  const previous = process.env.BUTLER_SLACK_CHANNEL_ID
  try {
    delete process.env.BUTLER_SLACK_CHANNEL_ID
    assert.equal(loadProjects().find(project => project.name === 'butler').channelId, 'C0CLTFN8K6K')
    process.env.BUTLER_SLACK_CHANNEL_ID = ''
    assert.equal(loadProjects().filter(project => project.channelId).some(project => project.name === 'butler'), false)
    process.env.BUTLER_SLACK_CHANNEL_ID = 'C_BUTLER'
    const projects = loadProjects().filter(project => project.channelId)
    const butler = projects.find(project => project.name === 'butler')
    assert.equal(butler.channelId, 'C_BUTLER')
    assert.equal(butler.directory, '/home/pm/workspace')
    assert.equal(butler.instructionsFile, '/home/pm/workspace/butler/instructions.md')
    assert.equal(butler.skillsPath, '/home/pm/workspace/butler/skills')
    assert.equal(new Set(projects.map(project => project.port)).size, projects.length)
    assert.equal(new Set(projects.map(project => project.stateFile.href)).size, projects.length)
  } finally {
    if (previous === undefined) delete process.env.BUTLER_SLACK_CHANNEL_ID
    else process.env.BUTLER_SLACK_CHANNEL_ID = previous
  }
})
