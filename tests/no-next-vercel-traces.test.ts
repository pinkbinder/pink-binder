import { execFileSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const repoRoot = resolve(import.meta.dirname, '..')

/**
 * The monorepo migrated off Next.js and Vercel entirely (Astro for
 * blog/landing/store, TanStack Start for admin, Cloudflare Workers for
 * deploys). These tests keep that migration from silently regressing.
 *
 * Reintroducing the framework is easy to do by accident: a helper that "just
 * needs" a Next package, or a dependency that pulls the framework in
 * transitively. Deleting the dependency is only durable if adding one back
 * fails CI.
 */

const WORKSPACE_ROOTS = ['apps', 'packages']

async function workspaceManifests(): Promise<string[]> {
  const manifests: string[] = []
  for (const root of WORKSPACE_ROOTS) {
    const entries = await readdir(resolve(repoRoot, root), { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      manifests.push(resolve(repoRoot, root, entry.name, 'package.json'))
    }
  }
  manifests.push(resolve(repoRoot, 'package.json'))
  return manifests
}

/** Names that mean the Next.js framework or a Next-only companion. */
const FORBIDDEN_DEPENDENCIES = new Set([
  'next',
  'next-themes',
  'eslint-config-next',
  'opennextjs-cloudflare',
  '@opennextjs/cloudflare',
])

describe('no Next.js or Vercel deployment dependencies', () => {
  test('no workspace manifest declares a Next.js or Vercel dependency', async () => {
    const offenders: string[] = []

    for (const manifestPath of await workspaceManifests()) {
      let manifest: {
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
        peerDependencies?: Record<string, string>
      }
      try {
        manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
      } catch {
        continue
      }
      const declared = [
        ...Object.keys(manifest.dependencies ?? {}),
        ...Object.keys(manifest.devDependencies ?? {}),
        ...Object.keys(manifest.peerDependencies ?? {}),
      ]
      for (const name of declared) {
        if (FORBIDDEN_DEPENDENCIES.has(name) || name.startsWith('@next/') || name.startsWith('@vercel/')) {
          offenders.push(`${manifestPath.replace(repoRoot + '/', '')}: ${name}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  test('no tracked source imports the Next.js framework', () => {
    // Anchored to an import/require statement, because two things here are
    // legitimate and must not trip the check:
    //   - `next` as a plain identifier (nextFrame, nextOffset)
    //   - negative assertions that a file does *not* contain a Next import
    // Only real module specifiers count.
    const patterns = [
      "^[[:space:]]*import[[:space:]].*from[[:space:]]*['\"]next(/|['\"])",
      "^[[:space:]]*import[[:space:]]*['\"]next/",
      "require\\(['\"]next/",
    ]
    let matches: string[] = []
    for (const pattern of patterns) {
      try {
        matches.push(
          ...execFileSync('git', ['grep', '-nE', pattern, '--', '.'], {
            cwd: repoRoot,
            encoding: 'utf8',
          })
            .split('\n')
            .filter(Boolean)
        )
      } catch {
        // git grep exits 1 when nothing matches, which is the passing case.
      }
    }

    // Vendored third-party skills cite Next.js as a generic example; they are
    // not this repository's source.
    const relevant = matches.filter((line) => !line.startsWith('.agents/'))
    expect(relevant).toEqual([])
  })

  test('no tracked source reads a Vercel deployment environment variable', () => {
    let matches: string[] = []
    try {
      matches = execFileSync(
        'git',
        ['grep', '-nE', 'VERCEL_ENV|VERCEL_GIT_COMMIT_SHA|VERCEL_URL', '--', 'apps', 'packages', 'scripts', 'tests'],
        { cwd: repoRoot, encoding: 'utf8' }
      )
        .split('\n')
        .filter(Boolean)
    } catch {
      matches = []
    }
    expect(matches).toEqual([])
  })
})
