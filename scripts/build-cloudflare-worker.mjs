import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

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

function collectFiles(directory) {
  const files = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath))
    } else {
      files.push(entryPath)
    }
  }

  return files
}

function readBlogManifestData() {
  const appPath = resolve(repositoryRoot, 'apps', 'blog')
  const dotNextPath = resolve(
    appPath,
    '.open-next',
    'server-functions',
    'default',
    'apps',
    'blog',
    '.next'
  )
  const manifestLoaderPath = resolve(
    appPath,
    '.open-next',
    'server-functions',
    'default',
    'node_modules',
    'next',
    'dist',
    'server',
    'load-manifest.external.js'
  )

  if (!existsSync(dotNextPath) || !existsSync(manifestLoaderPath)) {
    throw new Error('OpenNext did not generate the expected blog manifest files.')
  }

  const manifestData = {}
  const manifestFiles = collectFiles(dotNextPath).filter((file) => {
    const name = file.slice(file.lastIndexOf('/') + 1)
    return (
      file.endsWith('.json') &&
      (name.endsWith('-manifest.json') ||
        name === 'required-server-files.json' ||
        name === 'prefetch-hints.json')
    )
  })

  for (const file of manifestFiles) {
    const key = relative(dotNextPath, file).split(sep).join('/')
    manifestData[key] = JSON.parse(readFileSync(file, 'utf8'))
  }

  const rscManifestData = {}
  const rscManifestFiles = collectFiles(dotNextPath).filter((file) =>
    file.endsWith('_client-reference-manifest.js')
  )

  for (const file of rscManifestFiles) {
    const key = relative(dotNextPath, file).split(sep).join('/')
    const source = readFileSync(file, 'utf8')
    const context = {}
    context.globalThis = context
    runInNewContext(source, context, { filename: file })
    const manifest = context.__RSC_MANIFEST
    if (!manifest || typeof manifest !== 'object') {
      throw new Error(`Could not evaluate the blog RSC manifest: ${file}`)
    }

    rscManifestData[key] = manifest
  }

  return { manifestLoaderPath, manifestData, rscManifestData }
}

function patchBlogNextManifestLoader() {
  const { manifestLoaderPath, manifestData, rscManifestData } = readBlogManifestData()
  const source = readFileSync(manifestLoaderPath, 'utf8')

  if (source.includes('Patched blog manifest loader')) {
    console.log('The traced blog manifest loader is already patched.')
    return
  }

  const replacement = `/* Patched blog manifest loader */
"use strict";
const manifestData = ${JSON.stringify(manifestData)};
const rscManifestData = ${JSON.stringify(rscManifestData)};
const sharedCache = new Map();

function normalizeManifestPath(path) {
  return String(path).replaceAll("\\\\", "/");
}

function findManifest(path) {
  const normalizedPath = normalizeManifestPath(path);
  for (const [suffix, manifest] of Object.entries(manifestData)) {
    if (normalizedPath.endsWith(".next/" + suffix) || normalizedPath.endsWith("/" + suffix)) {
      return { found: true, manifest };
    }
  }
  return { found: false, manifest: undefined };
}

function loadManifest(path, shouldCache = true, cache = sharedCache, skipParse = false, handleMissing) {
  const cacheKey = normalizeManifestPath(path);
  const cached = shouldCache && cache.get(cacheKey);
  if (cached) return cached;
  if (cacheKey.endsWith(".next/BUILD_ID")) return process.env.NEXT_BUILD_ID;

  const result = findManifest(cacheKey);
  if (!result.found) {
    if (handleMissing) {
      const emptyManifest = {};
      if (shouldCache) cache.set(cacheKey, emptyManifest);
      return emptyManifest;
    }
    throw new Error("Unexpected loadManifest(" + path + ") call!");
  }

  if (shouldCache) cache.set(cacheKey, result.manifest);
  return result.manifest;
}

function evalManifest(path, shouldCache = true, cache = sharedCache, handleMissing) {
  const cacheKey = normalizeManifestPath(path);
  const cached = shouldCache && cache.get(cacheKey);
  if (cached) return cached;

  for (const [suffix, manifest] of Object.entries(rscManifestData)) {
    if (cacheKey.endsWith(".next/" + suffix) || cacheKey.endsWith("/" + suffix)) {
      const result = { __RSC_MANIFEST: manifest };
      if (shouldCache) cache.set(cacheKey, result);
      return result;
    }
  }

  if (handleMissing) {
    const emptyManifest = { __RSC_MANIFEST: {} };
    if (shouldCache) cache.set(cacheKey, emptyManifest);
    return emptyManifest;
  }
  throw new Error("Unexpected evalManifest(" + path + ") call!");
}

function loadManifestFromRelativePath({ projectDir, distDir, manifest, shouldCache, cache, skipParse, handleMissing, useEval }) {
  const path = [projectDir, distDir, manifest].filter(Boolean).join("/");
  return useEval
    ? evalManifest(path, shouldCache, cache, handleMissing)
    : loadManifest(path, shouldCache, cache, skipParse, handleMissing);
}

function clearManifestCache(path, cache = sharedCache) {
  return cache.delete(path);
}

module.exports = { clearManifestCache, evalManifest, loadManifest, loadManifestFromRelativePath };
`

  writeFileSync(manifestLoaderPath, replacement)
  console.log('Patched the traced blog manifest loader with bundled Next manifests.')
}

runBun(['install', '--frozen-lockfile'])
runBun(['x', 'opennextjs-cloudflare', 'build'], resolve(repositoryRoot, 'apps', app))

if (app === 'blog') {
  patchBlogInstrumentationLoader()
  patchBlogNextServerBuildId()
  patchBlogNextManifestLoader()
  patchBlogNextServerImport()
}
