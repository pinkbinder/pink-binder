import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repositoryRoot = resolve(import.meta.dirname, '..')

/**
 * UX performance standards §1 (docs/UX_PERFORMANCE_STANDARDS.md): hydrated
 * Solid surfaces must read props through the reactive proxy — never
 * destructure them at the component signature or via `const {…} = props`.
 * Destructuring detaches values from the reactive graph and only bites at
 * runtime, so it is guarded mechanically here.
 *
 * Scope decisions (ADR 0005):
 * - `packages/ui/src/components/blog/**` and `roundup-post-card.tsx` are
 *   server-rendered content or leaf components invoked with fully static
 *   values; destructuring is the documented exception there.
 * - camelCase functions are data helpers, not components; only PascalCase
 *   component signatures are checked for destructured defaults.
 */
const HYDRATED_SOURCE_DIRS = [
  'apps/admin/src',
  'apps/store/src',
  'apps/blog/src',
  'packages/ui/src/components',
  'packages/ui/src/lib',
]

/** Destructure-with-defaults in these paths is the documented exception. */
const SIGNATURE_DEFAULTS_ALLOWLIST = [
  'packages/ui/src/components/blog/',
  'packages/ui/src/components/roundup-post-card.tsx',
  // Blog content component rendered through the prebuilt post pipeline.
  'packages/ui/src/lib/blog-inline-text.tsx',
]

/** `const { a, b } = props` anywhere in a component body. */
const PROXY_DESTRUCTURE = /const\s*\{[^}]*\}\s*=\s*props\b/
/**
 * Component signature destructuring with a default value
 * (`function X({ a = 1 }: Props)`) — the React idiom this repo migrated off.
 */
const SIGNATURE_DEFAULTS = /function\s+([A-Za-z0-9]+)\s*\(\s*\{[^}]*=[^}]*\}/s

function listSourceFiles(dir) {
  const entries = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      entries.push(...listSourceFiles(path))
    } else if (/\.(tsx|ts)$/.test(path) && !/\.test\.(tsx|ts)$/.test(path)) {
      entries.push(path)
    }
  }
  return entries
}

describe('solid hygiene (hydrated surfaces)', () => {
  const files = HYDRATED_SOURCE_DIRS.flatMap((dir) => listSourceFiles(resolve(repositoryRoot, dir)))

  test('scope found hydrated sources to guard', () => {
    expect(files.length).toBeGreaterThan(40)
  })

  test('components never destructure the props proxy', () => {
    const violations = []
    for (const file of files) {
      if (PROXY_DESTRUCTURE.test(readFileSync(file, 'utf8'))) {
        violations.push(relative(repositoryRoot, file))
      }
    }
    expect(violations).toEqual([])
  })

  test('components never destructure props with default values', () => {
    const violations = []
    for (const file of files) {
      const relativePath = relative(repositoryRoot, file)
      if (SIGNATURE_DEFAULTS_ALLOWLIST.some((prefix) => relativePath.startsWith(prefix))) continue
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(new RegExp(SIGNATURE_DEFAULTS.source, 'gs'))) {
        const [, name] = match
        // PascalCase names follow the repo's component convention.
        if (name && /^[A-Z]/.test(name)) {
          violations.push(`${relativePath} (${name})`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})
