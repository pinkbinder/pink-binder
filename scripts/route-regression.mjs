#!/usr/bin/env node
// M5.1 cross-app route regression matrix (#232).
//
// Serves as the automated half of the regression matrix: every critical
// route is fetched from locally served production builds and checked for
// status, cache/security headers, canonical content markers, and HTML
// sanity (single h1, lang attribute, viewport, image alt coverage).
// Visual/keyboard/a11y coverage is documented in
// docs/baselines/M5-REGRESSION-MATRIX.md alongside this output.
//
// Usage: bun run regression:routes -- --base landing=http://localhost:3000 ...

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const repositoryRoot = resolve(import.meta.dirname, '..')
const defaultOutput = resolve(repositoryRoot, 'docs/baselines/m5-route-regression.json')

const ROUTES = [
  {
    id: 'landing-home',
    app: 'landing',
    path: '/',
    status: 200,
    markers: ['The Pink Binder', '<h1'],
    heading: true,
  },
  {
    id: 'landing-sitemap',
    app: 'landing',
    path: '/sitemap.xml',
    status: 200,
    markers: ['<urlset'],
    // Prerendered static asset: served by the Workers asset layer, so
    // middleware security headers do not apply (and are not meaningful on
    // XML). Only dynamic document routes assert security headers below.
  },
  {
    id: 'landing-404',
    app: 'landing',
    path: '/definitely-not-a-page',
    status: 404,
  },
  {
    id: 'blog-index',
    app: 'blog',
    path: '/',
    status: 200,
    markers: ['Cute Pokémon Collector Guide'],
    heading: true,
    edgeCache: true,
  },
  {
    id: 'blog-post',
    app: 'blog',
    path: '/posts/expansion/pitch-black/overview',
    status: 200,
    markers: ['Pitch Black'],
    heading: true,
    edgeCache: true,
  },
  {
    id: 'blog-legacy-slug-redirect',
    app: 'blog',
    path: '/posts/expansion--pitch-black',
    status: 301,
    location: '/posts/expansion/pitch-black/overview',
  },
  {
    id: 'blog-posts-grid-api',
    app: 'blog',
    path: '/api/posts-grid?limit=9',
    status: 200,
    markers: ['posts'],
  },
  {
    id: 'blog-rss',
    app: 'blog',
    path: '/rss.xml',
    status: 200,
    markers: ['<rss'],
  },
  {
    id: 'blog-sitemap',
    app: 'blog',
    path: '/sitemap.xml',
    status: 200,
    markers: ['<urlset'],
  },
  {
    // Unknown flat slugs redirect into the species namespace by design
    // (legacy `/posts/<slug>` behavior preserved from the Next.js era);
    // the species URL itself 404s. Follow-up: consider a direct 404 when
    // the slug cannot exist.
    id: 'blog-unknown-flat-slug-redirect',
    app: 'blog',
    path: '/posts/definitely-not-a-post',
    status: 301,
    location: '/posts/species/definitely-not-a-post',
  },
  {
    id: 'store-home',
    app: 'store',
    path: '/',
    status: [200, 500], // 500 without a reachable Medusa backend (environment-gated)
    markers: null, // asserted only on 200
  },
  {
    id: 'admin-dashboard',
    app: 'admin',
    path: '/',
    status: 200,
    markers: ['Pink Binder'],
    heading: true,
  },
  {
    id: 'admin-404',
    app: 'admin',
    path: '/definitely-not-a-route',
    status: 404,
  },
]

const SECURITY_HEADER_EXPECTATIONS = [
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
]

function usage() {
  return `Usage: bun run regression:routes -- --base app=url [--base app=url ...] [--output path]

  --base app=url    Base URL for an app (repeatable). Defaults to
                    localhost ports 3000-3003 for landing/store/blog/admin.
  --output path     JSON results path (default: docs/baselines/m5-route-regression.json)`
}

function parseArgs(argv) {
  const bases = new Map()
  let output = defaultOutput
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--help') return { help: true }
    const eq = argv[i]?.indexOf('=')
    if (argv[i]?.startsWith('--base') && eq > 0) {
      bases.set(argv[i].slice(6, eq), argv[i].slice(eq + 1).replace(/\/$/, ''))
    } else if (argv[i] === '--output') {
      output = resolve(process.cwd(), argv[++i])
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`)
    }
  }
  for (const fallback of [
    ['landing', 'http://localhost:3000'],
    ['store', 'http://localhost:3001'],
    ['blog', 'http://localhost:3002'],
    ['admin', 'http://localhost:3003'],
  ]) {
    if (!bases.has(fallback[0])) bases.set(fallback[0], fallback[1])
  }
  return { bases, output }
}

const counts = (html, regex) => (html.match(regex) ?? []).length

async function checkRoute(route, base) {
  const result = { id: route.id, app: route.app, path: route.path, base, checks: [] }
  const check = (name, pass, detail = '') => {
    result.checks.push({ name, pass, detail })
    return pass
  }

  const response = await fetch(base + route.path, { redirect: 'manual' })
  const allowedStatuses = Array.isArray(route.status) ? route.status : [route.status]
  check(
    'status',
    allowedStatuses.includes(response.status),
    `expected ${route.status}, got ${response.status}`
  )

  if (route.location) {
    const location = response.headers.get('location') ?? ''
    check('redirect-location', location.endsWith(route.location), location || '(none)')
  }

  if (
    allowedStatuses.includes(response.status) &&
    response.status >= 200 &&
    response.status < 300
  ) {
    const html = await response.text()

    if (route.markers) {
      for (const marker of route.markers) {
        check(`marker:${marker.slice(0, 32)}`, html.includes(marker))
      }
    }

    if (route.edgeCache) {
      const cacheState = response.headers.get('x-cache')
      check(
        'edge-cache:x-cache',
        cacheState === 'HIT' || cacheState === 'MISS' || cacheState === 'STALE',
        cacheState ?? '(none)'
      )
    }

    if (route.heading) {
      for (const header of SECURITY_HEADER_EXPECTATIONS) {
        check(
          `header:${header}`,
          response.headers.has(header),
          response.headers.get(header) ?? '(none)'
        )
      }
      check('html:lang', /<html[^>]*\blang=/.test(html))
      check('html:viewport', html.includes('name="viewport"'))
      check('html:title', /<title>\s*\S+/.test(html))
      const h1s = counts(html, /<h1[\s>]/g)
      check('html:single-h1', h1s === 1, `${h1s} h1 elements`)
      const imgs = counts(html, /<img\b/gi)
      const alts = counts(html, /<img\b[^>]*\balt=/gi)
      check('img:alt-coverage', imgs === 0 || alts === imgs, `${alts}/${imgs} images have alt`)
    }
  }

  return result
}

const options = parseArgs(process.argv.slice(2))
if (options.help) {
  console.log(usage())
  process.exit(0)
}

const startedAt = new Date().toISOString()
const results = []
let failures = 0
for (const route of ROUTES) {
  const base = options.bases.get(route.app)
  if (!base) throw new Error(`No --base provided for app "${route.app}"`)
  try {
    const result = await checkRoute(route, base)
    const failed = result.checks.filter((c) => !c.pass)
    failures += failed.length
    console.log(
      `${failed.length === 0 ? 'PASS' : 'FAIL'}  ${route.id} (${route.app} ${route.path})` +
        failed.map((c) => `\n      ✗ ${c.name}: ${c.detail}`).join('')
    )
    results.push(result)
  } catch (error) {
    failures += 1
    console.log(`FAIL  ${route.id} — ${error.message}`)
    results.push({ id: route.id, app: route.app, path: route.path, base, error: error.message })
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: startedAt,
  manifest: 'scripts/route-regression.mjs',
  totals: { routes: ROUTES.length, failures },
  results,
}
await mkdir(dirname(options.output), { recursive: true })
await writeFile(options.output, JSON.stringify(report, null, 2) + '\n')
console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} failure(s)`} — wrote ${options.output}`)
process.exit(failures === 0 ? 0 : 1)
