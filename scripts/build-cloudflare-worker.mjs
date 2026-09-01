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
  const instrumentationHookPattern =
    /async\s+runInstrumentationHookIfAvailable\s*\(\s*\)\s*\{\s*await\s*\(0,\s*_instrumentationglobalsexternal\.ensureInstrumentationRegistered\)\(this\.dir,\s*this\.nextConfig\.distDir\)\s*;?\s*\}/g
  const loaderMatches = [...source.matchAll(loaderPattern)]
  const instrumentationHookMatches = [...source.matchAll(instrumentationHookPattern)]

  if (loaderMatches.length !== 1 || instrumentationHookMatches.length !== 1) {
    throw new Error(
      `Expected one Next instrumentation loader and hook, found ${loaderMatches.length} loaders and ${instrumentationHookMatches.length} hooks.`
    )
  }

  const loaderMatch = loaderMatches[0]
  const hookMatch = instrumentationHookMatches[0]
  const loaderReplacement =
    'async loadInstrumentationModule() { this.instrumentation = null; return this.instrumentation; }'
  const hookReplacement = 'async runInstrumentationHookIfAvailable() {}'
  const replacements = [
    { match: loaderMatch, replacement: loaderReplacement },
    { match: hookMatch, replacement: hookReplacement },
  ].sort((left, right) => right.match.index - left.match.index)
  const patchedSource = replacements.reduce(
    (currentSource, { match, replacement }) =>
      currentSource.slice(0, match.index) +
      replacement +
      currentSource.slice(match.index + match[0].length),
    source
  )

  writeFileSync(serverHandlerPath, patchedSource)
  console.log('Patched the blog worker instrumentation loader for an instrumentation-free app.')
}

function patchBlogNextServerImport() {
  const appPath = resolve(repositoryRoot, 'apps', 'blog')
  const serverHandlerPath = resolve(
    appPath,
    '.open-next',
    'server-functions',
    'default',
    'apps',
    'blog',
    'handler.mjs'
  )
  const nextServerPath = resolve(
    appPath,
    '.open-next',
    'server-functions',
    'default',
    'node_modules',
    'next',
    'dist',
    'server',
    'next-server.js'
  )

  if (!existsSync(serverHandlerPath) || !existsSync(nextServerPath)) {
    throw new Error('OpenNext did not generate the expected blog Next server files.')
  }

  const source = readFileSync(serverHandlerPath, 'utf8')
  if (source.includes('var require_next_server=')) {
    console.log('OpenNext generated a self-contained Next server import; no import patch needed.')
    return
  }

  const unresolvedImport = 'var import_next_server=__toESM(require_next_server(),1);'
  const matches = source.split(unresolvedImport).length - 1
  if (matches !== 1) {
    throw new Error(`Expected one unresolved Next server import, found ${matches}.`)
  }

  const replacement =
    'import nextServerModule from "../../node_modules/next/dist/server/next-server.js";var import_next_server=__toESM(nextServerModule,1);'
  writeFileSync(serverHandlerPath, source.replace(unresolvedImport, replacement))
  console.log('Patched the blog worker to import the traced Next server module explicitly.')
}

function patchBlogNextServerBuildId() {
  const appPath = resolve(repositoryRoot, 'apps', 'blog')
  const nextServerPath = resolve(
    appPath,
    '.open-next',
    'server-functions',
    'default',
    'node_modules',
    'next',
    'dist',
    'server',
    'next-server.js'
  )
  const source = readFileSync(nextServerPath, 'utf8')
  const buildIdPattern = /getBuildId\(\)\{[\s\S]*?\}getEnabledDirectories/
  const matches = source.match(buildIdPattern)

  if (!matches || matches.length !== 1) {
    throw new Error(`Expected one Next server getBuildId method, found ${matches?.length ?? 0}.`)
  }

  const replacement = 'getBuildId(){return process.env.NEXT_BUILD_ID}getEnabledDirectories'
  writeFileSync(nextServerPath, source.replace(buildIdPattern, replacement))
  console.log('Patched the traced Next server to use the OpenNext build ID at runtime.')
}

runBun(['install', '--frozen-lockfile'])
runBun(['x', 'opennextjs-cloudflare', 'build'], resolve(repositoryRoot, 'apps', app))

if (app === 'blog') {
  patchBlogInstrumentationLoader()
  patchBlogNextServerBuildId()
  patchBlogNextServerImport()
}
