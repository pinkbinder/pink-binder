#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const repositoryRoot = resolve(import.meta.dirname, '..')
const defaultManifestPath = resolve(repositoryRoot, 'docs/baselines/m0-routes.json')
const defaultChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const metricIds = [
  'largest-contentful-paint',
  'interaction-to-next-paint',
  'cumulative-layout-shift',
  'server-response-time',
  'total-blocking-time',
  'interactive',
  'speed-index',
  'total-byte-weight',
]

function usage() {
  return `Usage: bun run benchmark:routes -- --base app=url [--base app=url ...] [options]

Required:
  --base app=url          Base URL for every app referenced by the route manifest.

Options:
  --manifest path         Route manifest (default: docs/baselines/m0-routes.json)
  --output path           Write the aggregate JSON report to this path.
  --runs number           Cold Lighthouse runs per route/profile (default: 3)
  --chrome-path path      Chrome executable (default: macOS Google Chrome path)
  --route id              Limit to one route id; may be repeated.
  --help                  Print this help.

Each Lighthouse run uses a fresh storage reset. The report records the resolved
fixture, profile, tool versions, raw samples, medians, byte totals, and request
counts. It does not silently turn an unreachable route into a zero-value sample.`
}

function parseArgs(argv) {
  const options = { bases: new Map(), routeIds: [], runs: 3, manifestPath: defaultManifestPath }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help') return { help: true }
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Expected a value after ${argument}`)
    if (argument === '--base') {
      const separator = value.indexOf('=')
      if (separator <= 0) throw new Error(`Expected app=url for ${argument}`)
      options.bases.set(value.slice(0, separator), value.slice(separator + 1).replace(/\/$/, ''))
    } else if (argument === '--manifest') {
      options.manifestPath = resolve(process.cwd(), value)
    } else if (argument === '--output') {
      options.outputPath = resolve(process.cwd(), value)
    } else if (argument === '--runs') {
      options.runs = Number.parseInt(value, 10)
      if (!Number.isInteger(options.runs) || options.runs < 1) {
        throw new Error('--runs must be a positive integer')
      }
    } else if (argument === '--chrome-path') {
      options.chromePath = value
    } else if (argument === '--route') {
      options.routeIds.push(value)
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
    index += 1
  }
  return options
}

function median(values) {
  const numeric = values.filter(Number.isFinite).sort((left, right) => left - right)
  if (numeric.length === 0) return null
  const middle = Math.floor(numeric.length / 2)
  return numeric.length % 2 === 0 ? (numeric[middle - 1] + numeric[middle]) / 2 : numeric[middle]
}

function standardDeviation(values) {
  const numeric = values.filter(Number.isFinite)
  if (numeric.length < 2) return null
  const average = numeric.reduce((sum, value) => sum + value, 0) / numeric.length
  return Math.sqrt(numeric.reduce((sum, value) => sum + (value - average) ** 2, 0) / numeric.length)
}

function numericAudit(audits, id) {
  const value = audits[id]?.numericValue
  return Number.isFinite(value) ? value : null
}

function networkSummary(audits) {
  const items = audits['network-requests']?.details?.items ?? []
  const bytesFor = (resourceType) =>
    items
      .filter((item) => item.resourceType === resourceType)
      .reduce((sum, item) => sum + (Number(item.transferSize) || 0), 0)
  return {
    requestCount: items.length,
    transferBytes: items.reduce((sum, item) => sum + (Number(item.transferSize) || 0), 0),
    javascriptBytes: bytesFor('Script'),
    cssBytes: bytesFor('Stylesheet'),
    imageBytes: bytesFor('Image'),
    mediaBytes: bytesFor('Media'),
  }
}

function chromeVersion(chromePath) {
  try {
    return execFileSync(chromePath, ['--version'], { encoding: 'utf8' }).trim()
  } catch {
    return 'unavailable'
  }
}

function gitRevision() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }).trim()
  } catch {
    return 'unavailable'
  }
}

async function runAudit({ chromePort, url, profile }) {
  const result = await lighthouse(
    url,
    {
      port: chromePort,
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'seo'],
      disableStorageReset: false,
      maxWaitForLoad: 45_000,
      formFactor: profile.formFactor,
    },
    profile.formFactor === 'desktop' ? desktopConfig : undefined
  )
  if (!result) throw new Error(`Lighthouse returned no result for ${url}`)
  const { audits, categories, finalUrl } = result.lhr
  return {
    finalUrl,
    scores: Object.fromEntries(
      Object.entries(categories).map(([name, category]) => [name, category.score])
    ),
    metrics: Object.fromEntries(metricIds.map((id) => [id, numericAudit(audits, id)])),
    network: networkSummary(audits),
  }
}

async function runApiAudit(url) {
  const startedAt = performance.now()
  const response = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
  const headersAt = performance.now()
  const body = await response.arrayBuffer()
  const completedAt = performance.now()
  if (!response.ok) throw new Error(`API fixture returned ${response.status} for ${url}`)

  return {
    finalUrl: response.url,
    scores: { performance: null, accessibility: null, seo: null },
    metrics: Object.fromEntries(
      metricIds.map((id) => [id, id === 'server-response-time' ? headersAt - startedAt : null])
    ),
    network: {
      requestCount: 1,
      transferBytes: body.byteLength,
      javascriptBytes: 0,
      cssBytes: 0,
      imageBytes: 0,
      mediaBytes: 0,
      responseDurationMs: completedAt - startedAt,
    },
    response: {
      status: response.status,
      cacheControl: response.headers.get('cache-control'),
      contentType: response.headers.get('content-type'),
      etag: response.headers.get('etag'),
    },
  }
}

function summarize(samples) {
  const metricKeys = Object.keys(samples[0]?.metrics ?? {})
  const networkKeys = Object.keys(samples[0]?.network ?? {})
  const scoreKeys = Object.keys(samples[0]?.scores ?? {})
  return {
    scores: Object.fromEntries(
      scoreKeys.map((key) => [key, median(samples.map((sample) => sample.scores[key]))])
    ),
    metrics: Object.fromEntries(
      metricKeys.map((key) => {
        const values = samples.map((sample) => sample.metrics[key])
        return [key, { median: median(values), standardDeviation: standardDeviation(values) }]
      })
    ),
    network: Object.fromEntries(
      networkKeys.map((key) => [key, median(samples.map((sample) => sample.network[key]))])
    ),
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    console.log(usage())
    return
  }
  const manifest = JSON.parse(await readFile(options.manifestPath, 'utf8'))
  const routes = manifest.routes.filter(
    (route) => options.routeIds.length === 0 || options.routeIds.includes(route.id)
  )
  if (routes.length === 0) throw new Error('No routes matched the requested route ids')

  const missingBases = [...new Set(routes.map((route) => route.app))].filter(
    (app) => !options.bases.has(app)
  )
  if (missingBases.length > 0) throw new Error(`Missing --base for: ${missingBases.join(', ')}`)

  const chromePath = options.chromePath ?? process.env.CHROME_PATH ?? defaultChromePath
  const chrome = await launch({
    chromePath,
    chromeFlags: [
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-sync',
    ],
  })

  const entries = []
  try {
    for (const route of routes) {
      const url = new URL(route.path, `${options.bases.get(route.app)}/`).toString()
      for (const profileName of route.profiles) {
        const profile = manifest.profiles[profileName]
        if (!profile) throw new Error(`Route ${route.id} references unknown profile ${profileName}`)
        const samples = []
        for (let run = 1; run <= options.runs; run += 1) {
          console.log(`[${route.id}/${profileName}] run ${run}/${options.runs}`)
          samples.push(
            route.kind === 'api'
              ? await runApiAudit(url)
              : await runAudit({ chromePort: chrome.port, url, profile })
          )
        }
        entries.push({
          routeId: route.id,
          app: route.app,
          path: route.path,
          priority: route.priority,
          fixture: route.fixture,
          kind: route.kind ?? 'document',
          profile: profileName,
          cacheState: profile.cacheState,
          network: profile.network,
          samples,
          summary: summarize(samples),
        })
      }
    }
  } finally {
    await chrome.kill()
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceRevision: gitRevision(),
    manifest: options.manifestPath.replace(`${repositoryRoot}/`, ''),
    runsPerRouteProfile: options.runs,
    tools: {
      node: process.version,
      lighthouse: (await import('lighthouse/package.json', { with: { type: 'json' } })).default
        .version,
      chrome: chromeVersion(chromePath),
    },
    entries,
  }
  const serialized = `${JSON.stringify(report, null, 2)}\n`
  if (options.outputPath) {
    await mkdir(dirname(options.outputPath), { recursive: true })
    await writeFile(options.outputPath, serialized)
    console.log(`Wrote ${options.outputPath}`)
  } else {
    process.stdout.write(serialized)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
})
