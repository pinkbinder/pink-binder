import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repositoryRoot = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'docs/baselines/m0-routes.json'), 'utf8')
) as {
  profiles: Record<string, unknown>
  routes: Array<{ app: string; id: string; path: string; priority: string; profiles: string[] }>
}

describe('M0 baseline route manifest', () => {
  test('covers every deployed app with a stable, prioritized route', () => {
    expect(new Set(manifest.routes.map((route) => route.app))).toEqual(
      new Set(['admin', 'blog', 'landing', 'store'])
    )
    expect(manifest.routes.every((route) => route.id && route.path && route.priority)).toBe(true)
  })

  test('uses only documented device and cache profiles', () => {
    expect(manifest.routes.every((route) => route.profiles.length > 0)).toBe(true)
    expect(
      manifest.routes.flatMap((route) => route.profiles).every((name) => name in manifest.profiles)
    ).toBe(true)
  })
})
