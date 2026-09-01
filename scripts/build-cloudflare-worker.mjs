import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const app = process.argv[2]
const supportedApps = new Set(['admin', 'blog', 'landing', 'store'])

if (!supportedApps.has(app)) {
  console.error(`Usage: bun run build:cloudflare -- <${[...supportedApps].join('|')}>`)
  process.exit(1)
}

function runBun(args, cwd = repositoryRoot) {
  const result = spawnSync('bun', args, {
    cwd,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function patchBlogInstrumentationLoader() {
  const appPath = resolve(repositoryRoot, 'apps', 'blog')
  const instrumentationFiles = [
    'instrumentation.js',
    'instrumentation.mjs',
    'instrumentation.ts',
    'instrumentation.tsx',
  ]

  if (instrumentationFiles.some((file) => existsSync(resolve(appPath, file)))) {
    throw new Error('The blog has an instrumentation hook; refusing to disable its runtime loader.')
  }

  const serverHandlerPath = resolve(
    appPath,
    '.open-next',
    'server-functions',
    'default',
    'apps',
    'blog',
    'handler.mjs'
  )
  if (!existsSync(serverHandlerPath)) {
    throw new Error(
      `OpenNext did not generate the expected blog server handler: ${serverHandlerPath}`
    )
  }

  const source = readFileSync(serverHandlerPath, 'utf8')
  const loaderPattern =
    /async\s+loadInstrumentationModule\s*\(\s*\)\s*\{[\s\S]*?getInstrumentationModule[\s\S]*?return\s+this\.instrumentation\s*;?\s*\}/g
  const matches = [...source.matchAll(loaderPattern)]

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one unpatched Next instrumentation loader, found ${matches.length}.`
    )
  }

  const match = matches[0]
  const replacement =
    'async loadInstrumentationModule() { this.instrumentation = null; return this.instrumentation; }'
  const patchedSource =
    source.slice(0, match.index) + replacement + source.slice(match.index + match[0].length)

  writeFileSync(serverHandlerPath, patchedSource)
  console.log('Patched the blog worker instrumentation loader for an instrumentation-free app.')
}

runBun(['install', '--frozen-lockfile'])
runBun(['x', 'opennextjs-cloudflare', 'build'], resolve(repositoryRoot, 'apps', app))

if (app === 'blog') {
  patchBlogInstrumentationLoader()
}
