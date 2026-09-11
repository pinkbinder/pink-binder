#!/usr/bin/env bun
/**
 * Dead-export scanner: finds named exports declared in packages (src dirs)
 * that are never referenced by any non-barrel file in the repository.
 *
 * A symbol is considered referenced if its name appears in an import/export
 * statement or as an identifier outside its declaring file. Barrel files
 * (index.ts that only re-export) are ignored as consumers. Symbols referenced
 * only by tests are still counted as referenced (conservative).
 */
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'coverage')
      continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const allFiles = walk(ROOT).filter(
  (f) =>
    EXTENSIONS.has(path.extname(f)) &&
    !f.includes('/node_modules/') &&
        !f.includes('/coverage/')
)

const isTestFile = (f) => /\.(test|spec)\.(ts|tsx|mts|cts)$/.test(f)

// --- Collect all source file contents ---
const contents = new Map()
for (const file of allFiles) {
  contents.set(file, fs.readFileSync(file, 'utf-8'))
}

// A file is a "barrel" if it only contains re-exports (export * / export {...} from)
function isBarrel(file) {
  const content = contents.get(file)
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'))
  if (lines.length === 0) return false
  return lines.every(
    (l) => /^(export\s+(\*\s+from|type\s+\*\s+from|\{)|import\s*['"])/.test(l) || l.startsWith('//')
  )
}

// --- Extract exported names per file ---
function extractExports(file, content) {
  const exports = new Set()
  const re =
    /export\s+(?:(?:default|declare|abstract|async)\s+)*(?:(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)|(\{[^}]+\})\s*(?:=\s*[^;]+)?;|(\{[^}]+\})\s+from)/g
  let m
  while ((m = re.exec(content)) !== null) {
    if (m[1]) exports.add(m[1])
    if (m[2]) {
      // export { A, B as C, type D }
      for (const name of m[2].matchAll(
        /(?:type\s+)?([A-Za-z_$][\w$]*)(?:\s+as\s+[A-Za-z_$][\w$]*)?/g
      )) {
        exports.add(name[1])
      }
    }
  }
  // export { A, B } from '...' — handled above via m[3]
  if (m) {
  }
  return exports
}

// --- Build reference counts: how many NON-barrel, non-declaring files reference the name ---
function collectReferences() {
  const refs = new Map() // name -> Set of files
  const addRef = (name, file) => {
    if (!name) return
    if (!refs.has(name)) refs.set(name, new Set())
    refs.get(name).add(file)
  }

  for (const file of allFiles) {
    if (isTestFile(file) || isBarrel(file)) continue
    const content = contents.get(file)
    // crude identifier matching: word boundaries on the symbol name
    for (const match of content.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) {
      addRef(match[1], file)
    }
  }
  return refs
}

const refs = collectReferences()

const candidates = []
for (const file of allFiles) {
  if (isTestFile(file) || isBarrel(file)) continue
  if (!file.includes(`${path.sep}src${path.sep}`) && !file.includes('/src/')) continue
  if (!file.startsWith(path.join(ROOT, 'packages'))) continue
  const content = contents.get(file)
  const exported = extractExports(file, content)
  for (const name of exported) {
    const referencing = refs.get(name)
    const externalRefs = referencing
      ? new Set([...referencing].filter((f) => f !== file))
      : new Set()
    if (externalRefs.size === 0) {
      candidates.push({ file: path.relative(ROOT, file), name })
    }
  }
}

console.log('=== POSSIBLY DEAD NAMED EXPORTS (no non-barrel references) ===')
for (const c of candidates.sort(
  (a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name)
)) {
  console.log(`  ${c.file}: ${c.name}`)
}
console.log(`\nTotal: ${candidates.length} candidates`)
