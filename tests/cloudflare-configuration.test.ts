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

  test('uses the OpenNext build with a frozen install and runtime compatibility patches', async () => {
    const script = await readFile(resolve(repoRoot, 'scripts/build-cloudflare-worker.mjs'), 'utf8')

    expect(script).toContain("opennextjs-cloudflare', 'build")
    expect(script).toContain("install', '--frozen-lockfile")
    expect(script).toContain('patchBlogInstrumentationLoader')
    expect(script).toContain('directInstrumentationPattern')
    expect(script).toContain('patchBlogComposableCacheHandlers')
    expect(script).toContain('writeFileSync(serverHandlerPath')
  })

  test('provides the image binding required by the OpenNext Worker wrapper', async () => {
    const config = await readFile(resolve(repoRoot, 'apps/blog/wrangler.jsonc'), 'utf8')

    expect(config).toMatch(/"images"\s*:\s*\{[\s\S]*?"binding"\s*:\s*"IMAGES"/)
  })

  test('keeps the blog edge middleware on Web APIs to avoid bundling next/server', async () => {
    const middleware = await readFile(resolve(repoRoot, 'apps/blog/middleware.ts'), 'utf8')

    expect(middleware).not.toContain("from 'next/server'")
    expect(middleware).toContain("response.headers.set('x-middleware-next', '1')")
    expect(middleware).toContain("'Content-Type': 'text/markdown; charset=utf-8'")
    expect(middleware).toContain("runtime: 'experimental-edge'")
  })
})
