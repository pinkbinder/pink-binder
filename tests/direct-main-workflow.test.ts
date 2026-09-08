import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repositoryRoot = resolve(import.meta.dirname, '..')
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8')

describe('direct-to-main workflow contract', () => {
  test('configures Code Foundry and automated pull requests for main', () => {
    expect(read('.github/code-foundry.yml')).toContain('git_workflow: direct')
    expect(read('.github/workflows/draft-pr.yml')).toContain('base: main')
    expect(existsSync(resolve(repositoryRoot, '.github/workflows/release-pr.yml'))).toBe(false)
  })

  test('targets validation and dependency updates at main only', () => {
    for (const path of [
      '.github/workflows/ci.yml',
      '.github/workflows/opencode-security.yml',
      '.github/workflows/validation.yml',
    ]) {
      const workflow = read(path)
      expect(workflow).toContain('branches: [main]')
      expect(workflow).not.toContain('branches: [main, staging]')
    }

    const dependabot = read('.github/dependabot.yml')
    expect(dependabot).toContain('target-branch: main')
    expect(dependabot).not.toContain('target-branch: staging')
  })

  test('keeps contributor and agent guidance aligned with the topology', () => {
    for (const path of ['AGENTS.md', '.github/CONTRIBUTING.md']) {
      const guidance = read(path)
      const normalized = guidance.toLowerCase()
      expect(normalized).toContain('branch from `main`')
      expect(normalized).toContain('target pull requests at `main`')
      expect(normalized).not.toContain('branch from `staging`')
      expect(normalized).not.toContain('target pull requests at `staging`')
    }

    const security = read('.github/SECURITY.md')
    expect(security).toContain('The latest commit on `main` receives security patches.')
    expect(security).not.toContain('| `staging`')
  })
})
