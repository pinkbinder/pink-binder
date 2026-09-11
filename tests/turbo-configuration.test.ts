import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')
const ignoredDirectories = new Set(['.git', '.turbo', 'node_modules'])

async function findTurboConfigs(directory: string): Promise<string[]> {
  const paths: string[] = []
  const entries = await readdir(directory, { withFileTypes: true })
  const nestedDirectories = entries.filter(
    (entry) => entry.isDirectory() && !ignoredDirectories.has(entry.name)
  )

  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'turbo.json') {
      paths.push(resolve(directory, entry.name))
    }
  }

  const nestedPaths = await Promise.all(
    nestedDirectories.map((entry) => findTurboConfigs(resolve(directory, entry.name)))
  )
  return paths.concat(...nestedPaths)
}

describe('Turbo configuration', () => {
  test('no task declares retired Next.js build outputs', async () => {
    const configPaths = await findTurboConfigs(repoRoot)
    expect(configPaths.length).toBeGreaterThan(0)

    for (const configPath of configPaths) {
      const config = JSON.parse(await readFile(configPath, 'utf8')) as {
        tasks?: Record<string, { outputs?: string[] }>
      }
      for (const [taskName, task] of Object.entries(config.tasks ?? {})) {
        // Next.js is gone; `.next` outputs would mean a build that no longer
        // exists. Vite emits dist/** and Astro emits .astro/**.
        expect(
          (task.outputs ?? []).filter((output) => output.includes('.next')),
          `${configPath} task ${taskName} declares Next.js outputs`
        ).toEqual([])
      }
    }
  }, 15_000)
})
