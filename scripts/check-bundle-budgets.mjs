#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join, resolve } from 'node:path'
import process from 'node:process'

const repositoryRoot = resolve(import.meta.dirname, '..')
const assetsDir = resolve(repositoryRoot, 'apps/admin/dist/client/assets')

/**
 * Bundle budgets for the admin console (UX performance standards §2/§6).
 * Numbers are gzip-compressed byte ceilings with ~20% headroom over the
 * measured baseline at adoption; route chunks must stay split so navigation
 * keeps its per-route loading (autoCodeSplitting).
 *
 * Budgets are assertions, not vibes: a breach fails the script and the
 * change that grew the bundle must either justify a budget update in the PR
 * description or shrink.
 */
const BUDGETS = [
  {
    // `sideEffects` metadata on @repo packages lets rolldown tree-shake the
    // workspace barrels, so the app entry merged into the vendor chunk — the
    // two are now one `index-*.js` asset (~48 KB gz, down from ~86 KB split).
    id: 'admin entry+vendor chunk (index-*.js)',
    pattern: /^index-.*\.js$/,
    maxGzipBytes: 55_000,
  },
  {
    id: 'stylesheet (styles-*.css)',
    pattern: /^styles-.*\.css$/,
    maxGzipBytes: 15_000,
  },
]

/** Every route keeps its own chunk, and none of them balloons silently. */
const ROUTE_CHUNK_BUDGETS = [
  { id: 'orders route chunk', pattern: /^orders-.*\.js$/, maxGzipBytes: 12_000 },
  { id: 'inventory route chunk', pattern: /^inventory-.*\.js$/, maxGzipBytes: 12_000 },
  { id: 'content route chunk', pattern: /^content-.*\.js$/, maxGzipBytes: 12_000 },
  { id: 'ads route chunk', pattern: /^ads-.*\.js$/, maxGzipBytes: 12_000 },
]

const TOTAL_JS_GZIP_BUDGET = 140_000

function gzipSize(filePath) {
  return gzipSync(readFileSync(filePath)).length
}

function ensureBuild() {
  try {
    if (statSync(assetsDir).isDirectory()) return
  } catch {
    // dist missing — build below.
  }
  process.stdout.write(
    'admin client build missing; running `bun run build --filter=@repo/admin`…\n'
  )
  const result = spawnSync('bun', ['run', 'build', '--filter=@repo/admin'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.stderr.write('bundle budget check could not build the admin app.\n')
    process.exit(result.status ?? 1)
  }
}

function clientAssets() {
  return readdirSync(assetsDir)
    .filter((name) => /\.(js|css)$/.test(name))
    .map((name) => ({ name, path: join(assetsDir, name) }))
}

function check(budget, assets, failures) {
  const matches = assets.filter((asset) => budget.pattern.test(asset.name))
  if (matches.length === 0) {
    failures.push(
      `${budget.id}: expected at least one matching asset — did route splitting regress?`
    )
    return
  }
  const largest = matches
    .map((asset) => ({ name: asset.name, bytes: gzipSize(asset.path) }))
    .sort((a, b) => b.bytes - a.bytes)[0]
  const line = `${budget.id}: ${largest.bytes.toLocaleString()} gz bytes (budget ${budget.maxGzipBytes.toLocaleString()})`
  if (largest.bytes > budget.maxGzipBytes) {
    failures.push(`OVER BUDGET — ${line}`)
  } else {
    process.stdout.write(`ok — ${line}\n`)
  }
}

ensureBuild()
const assets = clientAssets()
const failures = []

for (const budget of BUDGETS) check(budget, assets, failures)
for (const budget of ROUTE_CHUNK_BUDGETS) check(budget, assets, failures)

const totalJsGz = assets
  .filter((asset) => asset.name.endsWith('.js'))
  .reduce((sum, asset) => sum + gzipSize(asset.path), 0)
const totalLine = `total client JS: ${totalJsGz.toLocaleString()} gz bytes (budget ${TOTAL_JS_GZIP_BUDGET.toLocaleString()})`
if (totalJsGz > TOTAL_JS_GZIP_BUDGET) failures.push(`OVER BUDGET — ${totalLine}`)
else process.stdout.write(`ok — ${totalLine}\n`)

if (failures.length > 0) {
  process.stderr.write(`\n${failures.length} bundle budget breach(es):\n`)
  for (const failure of failures) process.stderr.write(`  ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nAll bundle budgets pass.\n')
