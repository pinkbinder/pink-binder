import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')
const ignoredDirectories = new Set(['.git', '.next', '.turbo', 'node_modules'])

async function findTurboConfigs(directory: string): Promise<string[]> {
  const paths: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      paths.push(...(await findTurboConfigs(resolve(directory, entry.name))))
    } else if (entry.isFile() && entry.name === 'turbo.json') {
      paths.push(resolve(directory, entry.name))
    }
  }
  return paths
}

describe('Turbo configuration', () => {
  test('Next build outputs exclude development and framework caches', async () => {
    const configPaths = await findTurboConfigs(repoRoot)
    expect(configPaths.length).toBeGreaterThan(0)

    for (const configPath of configPaths) {
      const config = JSON.parse(await readFile(configPath, 'utf8')) as {
        tasks?: Record<string, { outputs?: string[] }>
      }
      for (const task of Object.values(config.tasks ?? {})) {
        if (!task.outputs?.includes('.next/**')) continue
        expect(task.outputs).toContain('!.next/cache/**')
        expect(task.outputs).toContain('!.next/dev/**')
      }
    }
  })
})
