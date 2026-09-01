import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')
const appWatchDirectories: Record<string, string[]> = {
  admin: ['app'],
  blog: ['app', 'lib', 'content', 'public'],
  landing: ['app', 'lib', 'public'],
  store: ['app'],
}

function getWatchDirectoryExpression(config: string): string {
  const match = config.match(/"watch_dir"\s*:\s*(\[[\s\S]*?\]|"[^"]+")/)
  if (!match) throw new Error('Missing Wrangler build.watch_dir')
  return match[1]
}

describe('Cloudflare build configuration', () => {
  test('watches source directories instead of generated Worker output', async () => {
    for (const [app, directories] of Object.entries(appWatchDirectories)) {
      const config = await readFile(resolve(repoRoot, 'apps', app, 'wrangler.jsonc'), 'utf8')
      const expression = getWatchDirectoryExpression(config)

      expect(expression.startsWith('[')).toBe(true)
      expect(expression).not.toContain(`apps/${app}`)
      for (const directory of directories) expect(expression).toContain(`"${directory}"`)
    }
  })

  test('uses the standard OpenNext build without generated-file rewrites', async () => {
    const script = await readFile(resolve(repoRoot, 'scripts/build-cloudflare-worker.mjs'), 'utf8')

    expect(script).toContain("opennextjs-cloudflare', 'build")
    expect(script).not.toContain('patchBlog')
    expect(script).not.toContain('writeFileSync')
  })
})
