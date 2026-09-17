import { describe, expect, it } from 'bun:test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { MOCKED_MODULE_SPECS } from './module-mock-scope'

const SRC_DIR = new URL('../src', import.meta.url).pathname
const TEST_DIR = new URL('.', import.meta.url).pathname

function* testFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* testFiles(path)
    else if (entry.name.endsWith('.test.ts')) yield path
  }
}

function resolveSpec(fromFile: string, spec: string): string {
  if (!spec.startsWith('.')) return spec
  const base = resolve(dirname(fromFile), spec)
  for (const candidate of [base, `${base}.ts`, `${base}/index.ts`]) {
    if (existsSync(candidate)) return candidate
  }
  return base
}

const MOCKED_SPECS_RESOLVED = new Set(
  MOCKED_MODULE_SPECS.map((spec) =>
    spec.startsWith('.') ? resolveSpec(join(TEST_DIR, 'module-mock-scope.ts'), spec) : spec
  )
)

describe('module-mock-scope', () => {
  it('every mock.module specifier is re-registered by restoreModuleMocks', () => {
    const offenders: string[] = []
    for (const file of testFiles(SRC_DIR)) {
      const source = readFileSync(file, 'utf8')
      const mocked = new Set(
        [...source.matchAll(/mock\.module\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
      )
      if (mocked.size === 0) continue
      const restored = new Set(
        [...source.matchAll(/restoreModuleMocks\(\s*import\.meta\s*,([^)]*)\)/g)].flatMap((m) =>
          [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((s) => s[1])
        )
      )
      for (const spec of mocked) {
        if (!restored.has(spec)) offenders.push(`${file}: ${spec}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('MOCKED_MODULE_SPECS captures every module the suite restores', () => {
    const missing: string[] = []
    for (const file of testFiles(SRC_DIR)) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/restoreModuleMocks\(\s*import\.meta\s*,([^)]*)\)/g)) {
        for (const spec of [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((s) => s[1])) {
          const resolved = spec.startsWith('.') ? resolveSpec(file, spec) : spec
          // 'fs' and 'node:fs' are interchangeable aliases for the builtin.
          const aliases =
            spec === 'fs' || spec === 'node:fs'
              ? [resolved, spec === 'fs' ? 'node:fs' : 'fs']
              : [resolved]
          if (!aliases.some((a) => MOCKED_SPECS_RESOLVED.has(a))) {
            missing.push(`${file}: ${spec}`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })
})
