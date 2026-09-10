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

function findAsyncMethodRanges(source, methodName) {
  const methodPattern = new RegExp(`async\\s+${methodName}\\s*\\([^)]*\\)\\s*\\{`, 'g')
  const ranges = []

  for (const match of source.matchAll(methodPattern)) {
    const bodyStart = match.index + match[0].length - 1
    let depth = 0
    let quote = null
    let escaped = false

    for (let index = bodyStart; index < source.length; index += 1) {
      const character = source[index]

      if (quote) {
        if (escaped) {
          escaped = false
        } else if (character === '\\') {
          escaped = true
        } else if (character === quote) {
          quote = null
        }
        continue
      }

      if (character === '"' || character === "'" || character === '`') {
        quote = character
      } else if (character === '{') {
        depth += 1
      } else if (character === '}' && --depth === 0) {
        ranges.push({ start: match.index, end: index + 1 })
        break
      }
    }
  }

  return ranges
}

function patchBlogComposableCacheHandlers(source) {
  const methodRanges = findAsyncMethodRanges(source, 'loadCustomCacheHandlers')
  const openNextRanges = methodRanges.filter(({ start, end }) => {
    const method = source.slice(start, end)
    return method.includes('require_composable_cache().default')
  })

  if (openNextRanges.length === 0) {
    throw new Error(
      'Expected OpenNext composable cache handler methods in the generated blog server handler.'
    )
  }

  const replacement = `async loadCustomCacheHandlers() {
  const handlersSymbol = Symbol.for("@next/cache-handlers");
  const handlersMapSymbol = Symbol.for("@next/cache-handlers-map");
  const handlersSetSymbol = Symbol.for("@next/cache-handlers-set");
  globalThis[handlersMapSymbol] = new Map();
  globalThis[handlersMapSymbol].set("default", require_composable_cache().default);
  globalThis[handlersMapSymbol].set("remote", require_composable_cache().default);
  globalThis[handlersSetSymbol] = new Set(globalThis[handlersMapSymbol].values());
}`

  const patchedSource = [...openNextRanges]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (currentSource, { start, end }) =>
        currentSource.slice(0, start) + replacement + currentSource.slice(end),
      source
    )

  const remainingBrokenRanges = findAsyncMethodRanges(
    patchedSource,
    'loadCustomCacheHandlers'
  ).filter(({ start, end }) => {
    const method = patchedSource.slice(start, end)
    return method.includes('initializeCacheHandlers') || method.includes('Object.entries')
  })

  if (remainingBrokenRanges.length > 0) {
    throw new Error(
      'The generated blog handler still contains the broken OpenNext cache handler patch.'
    )
  }

  return { source: patchedSource, count: openNextRanges.length }
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
    /async\s+loadInstrumentationModule\s*\(\s*\)\s*\{\s*if\s*\(\s*!this\.serverOptions\.dev\)[\s\S]*?return\s+this\.instrumentation\s*;?\s*\}/g
  const instrumentationHookPattern =
    /async\s+runInstrumentationHookIfAvailable\s*\(\s*\)\s*\{\s*await\s*\(0,\s*_instrumentationglobalsexternal\.ensureInstrumentationRegistered\)\(this\.dir,\s*this\.nextConfig\.distDir\)\s*;?\s*\}/g
  const directInstrumentationPattern =
    /let\{ensureInstrumentationRegistered:\w+\}=await Promise\.resolve\(\)\.then\([^;]+\);\s*await\s+\w+\([^)]*\);?/g
  const loaderMatches = [...source.matchAll(loaderPattern)]
  const instrumentationHookMatches = [...source.matchAll(instrumentationHookPattern)]
  const directInstrumentationMatches = [...source.matchAll(directInstrumentationPattern)]

  if (loaderMatches.length !== 1 || instrumentationHookMatches.length !== 1) {
    throw new Error(
      `Expected one Next instrumentation loader and hook, found ${loaderMatches.length} loaders and ${instrumentationHookMatches.length} hooks.`
    )
  }

  if (directInstrumentationMatches.length === 0) {
    throw new Error(
      'Expected direct Next instrumentation registrations in the generated blog handler.'
    )
  }

  const loaderMatch = loaderMatches[0]
  const hookMatch = instrumentationHookMatches[0]
  const replacements = [
    {
      match: loaderMatch,
      replacement:
        'async loadInstrumentationModule() { this.instrumentation = null; return this.instrumentation; }',
    },
    {
      match: hookMatch,
      replacement: 'async runInstrumentationHookIfAvailable() {}',
    },
    ...directInstrumentationMatches.map((match) => ({
      match,
      replacement: '/* Blog has no instrumentation hook. */',
    })),
  ].sort((left, right) => right.match.index - left.match.index)
  const patchedSource = replacements.reduce(
    (currentSource, { match, replacement }) =>
      currentSource.slice(0, match.index) +
      replacement +
      currentSource.slice(match.index + match[0].length),
    source
  )

  const cachePatch = patchBlogComposableCacheHandlers(patchedSource)
  writeFileSync(serverHandlerPath, cachePatch.source)
  console.log(
    `Patched the instrumentation-free blog loader, ${directInstrumentationMatches.length} direct registrations, and ${cachePatch.count} OpenNext cache handler methods for workerd compatibility.`
  )
}

runBun(['install', '--frozen-lockfile'])

const appPath = resolve(repositoryRoot, 'apps', app)
if (app === 'landing') {
  runBun(['run', 'build:cloudflare'], appPath)
  process.exit(0)
}

runBun(['x', 'opennextjs-cloudflare', 'build'], appPath)

if (app === 'blog') {
  patchBlogInstrumentationLoader()
}
