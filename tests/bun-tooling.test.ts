import { readdir, readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')
const sourceRoots = ['apps', 'packages', 'scripts']
const textExtensions = new Set(['.js', '.jsx', '.md', '.mdx', '.mjs', '.ts', '.tsx'])
const ignoredDirectories = new Set(['cache', 'node_modules'])
const legacyPackageManager = ['pn', 'pm'].join('')

async function findTextFiles(directory: string): Promise<string[]> {
  const paths: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      paths.push(...(await findTextFiles(resolve(directory, entry.name))))
    } else if (
      entry.isFile() &&
      entry.name !== 'CHANGELOG.md' &&
      textExtensions.has(extname(entry.name))
    ) {
      paths.push(resolve(directory, entry.name))
    }
  }
  return paths
}

describe('Bun tooling', () => {
  test('active source and operator docs do not advertise the legacy package manager', async () => {
    const files = [resolve(repoRoot, 'README.md')]
    for (const sourceRoot of sourceRoots) {
      files.push(...(await findTextFiles(resolve(repoRoot, sourceRoot))))
    }

    const offenders: string[] = []
    for (const file of files) {
      if ((await readFile(file, 'utf8')).toLowerCase().includes(legacyPackageManager)) {
        offenders.push(file.slice(repoRoot.length + 1))
      }
    }

    expect(offenders).toEqual([])
  })
})
