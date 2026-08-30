import fs from 'node:fs'
import path from 'node:path'

/** Returns true when a file exists (thin wrapper around `fs.existsSync` for testability). */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

/**
 * Safely reads and parses a JSON file. Returns `null` when the file is
 * missing, unreadable, or contains malformed JSON.
 */
export function readJsonFile<T>(filePath: string): T | null {
  if (!fileExists(filePath)) {
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return null
  }
}

/**
 * Writes `data` as pretty-printed JSON only when the on-disk content differs
 * (or when `force` is true). Returns `'written'` vs `'skipped'` so callers
 * can aggregate change counts without re-reading.
 */
export function writeJsonIfChanged(
  filePath: string,
  data: unknown,
  force = false
): 'written' | 'skipped' {
  const next = `${JSON.stringify(data, null, 2)}\n`
  if (fileExists(filePath) && !force) {
    const existing = fs.readFileSync(filePath, 'utf-8')
    if (existing === next) {
      return 'skipped'
    }
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, next)
  return 'written'
}
