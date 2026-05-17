import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ENV_FILES = ['.env', '.env.local']

/**
 * Parse a single env value (dotenv-style): supports quoted strings and strips
 * trailing inline comments on unquoted values (`KEY=value # comment`).
 */
export function parseEnvValue(raw) {
  let value = raw.trim()

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  const commentIndex = value.search(/\s+#/)
  if (commentIndex !== -1) {
    value = value.slice(0, commentIndex).trimEnd()
  }

  return value
}

/**
 * Walk up from `startDir` to find the monorepo root (pnpm-workspace.yaml).
 */
export function findMonorepoRoot(startDir = process.cwd()) {
  let current = startDir

  while (true) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
      return current
    }

    const parent = dirname(current)
    if (parent === current) {
      return startDir
    }

    current = parent
  }
}

/**
 * Parse and merge root `.env` / `.env.local` into `process.env`.
 * Does not override variables that are already set.
 */
export function loadMonorepoEnv(options = {}) {
  const root = options.root ?? findMonorepoRoot(options.startDir)
  const files = options.files ?? ENV_FILES

  for (const file of files) {
    const path = join(root, file)
    if (!existsSync(path)) {
      continue
    }

    const content = readFileSync(path, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = parseEnvValue(trimmed.slice(separatorIndex + 1))

      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }

  return root
}
