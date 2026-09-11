#!/usr/bin/env bun
/**
 * Dead-module scanner: finds source modules under packages (in src dirs) that
 * are never referenced by any import specifier in the repository (excluding
 * the module's own file, its sibling index barrels, and test files).
 *
 * Uses path-suffix matching on import specifiers so it works without full
 * module resolution: `import { x } from '../../lib/utils'` matches
 * `packages/ui/src/lib/utils.ts` when the specifier ends with `lib/utils`.
 */
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'coverage') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const allFiles = walk(ROOT).filter(
  (f) =>
    EXTENSIONS.has(path.extname(f)) && !f.includes('/node_modules/') && !f.includes('/coverage/')
)

const isTestFile = (f) => /\.(test|spec)\.(ts|tsx|mts|cts)$/.test(f)

// Build import specifier set from every non-test source file
const importSpecifiers = new Set()
for (const file of allFiles) {
  if (isTestFile(file)) continue
  const content = fs.readFileSync(file, 'utf-8')
  const re = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s+)?['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(content)) !== null) {
    const spec = m[1]
    if (spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('@repo/')) {
      importSpecifiers.add(spec)
    }
  }
}

const candidates = allFiles.filter(
  (f) =>
    f.startsWith(path.join(ROOT, 'packages')) &&
    f.includes('/src/') &&
    !isTestFile(f) &&
    !f.endsWith('/index.ts')
)

const dead = []
for (const file of candidates) {
  const rel = path.relative(ROOT, file).replace(/\.(ts|tsx|mts|cts)$/, '')
  const base = path.basename(rel)

  // Strip index-style suffixes from specifiers for matching
  const specifiersToMatch = [...importSpecifiers]
  const matched = specifiersToMatch.filter((spec) => {
    const normalized = spec.replace(/^@repo\/[^/]+\//, 'packages/')
    const clean = normalized.replace(/\.(ts|tsx|mts|cts)$/, '')
    if (clean === rel) return true
    if (clean.endsWith('/' + base)) return true
    if (clean.endsWith(rel)) return true
    return false
  })

  if (matched.length === 0) {
    dead.push({ file: rel, base })
  }
}

console.log('=== NEVER-IMPORTED MODULES (potential dead files) ===')
for (const d of dead.sort()) {
  console.log(`  ${d.file}`)
}
console.log(`\nTotal: ${dead.length} candidates`)
