import fs from 'node:fs'

const args = process.argv.slice(2)

function argument(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const baseUrl = new URL(
  argument('--base-url', process.env.BLOG_AUDIT_BASE_URL ?? 'http://127.0.0.1:3212')
)
const maxPosts = Math.max(0, Number.parseInt(argument('--max-posts', '0'), 10) || 0)
const concurrency = Math.max(1, Number.parseInt(argument('--concurrency', '16'), 10) || 16)
const skipHomepage = args.includes('--skip-homepage')
const allowedStatusCodes = new Set(
  argument('--allow-status', '')
    .split(',')
    .map((status) => Number.parseInt(status.trim(), 10))
    .filter((status) => Number.isInteger(status))
)
const failures = []
const checks = []
const warnings = []
const REQUEST_HEADERS = {
  Accept: '*/*',
  'User-Agent':
    'Mozilla/5.0 (compatible; PinkBinderProductionMonitor/1.0; +https://github.com/PinkBinder/pink-binder)',
}

function localUrl(pathname) {
  return new URL(pathname, baseUrl).toString()
}

async function fetchChecked(pathname, options = {}) {
  let response
  let lastError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch(localUrl(pathname), {
        headers: REQUEST_HEADERS,
        redirect: options.redirect ?? 'follow',
        signal: AbortSignal.timeout(options.timeout ?? 30_000),
      })
      if (![500, 502, 503, 504].includes(response.status) || attempt === 1) break
      await response.body?.cancel()
    } catch (error) {
      lastError = error
      if (attempt === 1) throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)))
  }
  if (!response) throw lastError ?? new Error('Request failed without a response')
  if (allowedStatusCodes.has(response.status)) {
    await response.body?.cancel()
    warnings.push(`${pathname}: HTTP ${response.status} accepted by --allow-status`)
    return { response, body: '', skipped: true }
  }
  if (options.status ? response.status !== options.status : !response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  if (options.contentType) {
    const actual = response.headers.get('content-type') ?? ''
    if (!actual.includes(options.contentType)) {
      throw new Error(
        `content-type ${JSON.stringify(actual)} does not include ${options.contentType}`
      )
    }
  }
  if (options.headers) {
    for (const [name, expected] of Object.entries(options.headers)) {
      const actual = response.headers.get(name) ?? ''
      const expectedValues = Array.isArray(expected) ? expected : [expected]
      for (const value of expectedValues) {
        if (!actual.includes(value)) {
          throw new Error(`header ${name} ${JSON.stringify(actual)} does not include ${value}`)
        }
      }
    }
  }
  const body = options.body === false ? '' : await response.text()
  if (options.includes && !body.includes(options.includes)) {
    throw new Error(`response does not contain ${JSON.stringify(options.includes)}`)
  }
  checks.push(pathname)
  return { response, body }
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'))
}

function rssItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1])
}

function rssValue(item, tag) {
  return item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]+)</${tag}>`))?.[1]
}

async function checkRss(pathname, expectedPath) {
  const result = await fetchChecked(pathname, {
    contentType: 'application/rss+xml',
    includes: '<media:content',
  })
  if (result.skipped) return
  const { body } = result
  if (!body.startsWith('<?xml') || !body.includes('<rss version="2.0"')) {
    throw new Error('invalid RSS 2.0 envelope')
  }
  const items = rssItems(body)
  if (items.length === 0) throw new Error('feed has no items')
  const links = items.map((item) => rssValue(item, 'link')).filter(Boolean)
  const media = items.map((item) => item.match(/<media:content url="([^"]+)"/)?.[1]).filter(Boolean)
  if (new Set(links).size !== links.length) throw new Error('feed has duplicate item links')
  if (new Set(media).size !== media.length) throw new Error('feed has duplicate media URLs')
  if (expectedPath && links.some((link) => !expectedPath.test(new URL(link).pathname))) {
    throw new Error(`feed contains a link outside ${expectedPath}`)
  }
}

async function runPool(items, task) {
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      await task(items[index], index)
    }
  })
  await Promise.all(workers)
}

function sampledUrls(urls) {
  if (maxPosts === 0 || urls.length <= maxPosts) return urls
  if (maxPosts === 1) return [urls[Math.floor(urls.length / 2)]]
  return Array.from({ length: maxPosts }, (_, index) => {
    const position = Math.round((index * (urls.length - 1)) / (maxPosts - 1))
    return urls[position]
  })
}

async function safe(label, task) {
  try {
    await task()
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function main() {
  let sitemapBody = ''
  let sitemapSkipped = false
  if (!skipHomepage) {
    await safe('homepage', async () => {
      const result = await fetchChecked('/', {
        contentType: 'text/html',
        includes: 'Pink Binder',
      })
      if (result.skipped) return
      const { body } = result
      if (!body.includes('property="og:title"') || !body.includes('name="twitter:card"')) {
        throw new Error('missing social metadata')
      }
      if (!body.includes('aria-live="polite"') || !body.includes('blog-grid-result-count')) {
        throw new Error('missing accessible async-results status or result count')
      }
    })
  }
  await safe('robots', () =>
    fetchChecked('/robots.txt', { contentType: 'text/plain', includes: 'Sitemap:' })
  )
  await safe('sitemap', async () => {
    const result = await fetchChecked('/sitemap.xml', {
      contentType: 'application/xml',
      includes: '<urlset',
    })
    if (result.skipped) {
      sitemapSkipped = true
      return
    }
    sitemapBody = result.body
  })
  await safe('grid API', () =>
    fetchChecked('/api/posts-grid?offset=0&limit=1', {
      contentType: 'application/json',
      includes: '"posts"',
    })
  )

  const feeds = [
    ['/rss.xml'],
    ['/rss/species.xml', /^\/posts\/species\/[^/]+$/],
    [
      '/rss/illustrator.xml',
      /^\/posts\/illustrator\/[^/]+\/(?:overview|cutest|collect|popular|expensive)$/,
    ],
    ['/rss/expansion.xml', /^\/posts\/expansion\/[^/]+\/overview$/],
    [
      '/rss/roundup.xml',
      /^\/posts\/(?:themes|type|generation|illustrator)\/[^/]+\/(?:cutest|collect|popular|expensive)$/,
    ],
  ]
  for (const [pathname, segment] of feeds) {
    await safe(pathname, () => checkRss(pathname, segment))
  }

  const urls = sitemapSkipped ? [] : sitemapUrls(sitemapBody)
  if (!sitemapSkipped && urls.length === 0) failures.push('sitemap: no URLs found')
  if (!sitemapSkipped && new Set(urls).size !== urls.length)
    failures.push('sitemap: duplicate URLs found')
  const postUrls = urls.filter((url) => new URL(url).pathname.startsWith('/posts/'))
  const selected = sampledUrls(postUrls)

  await runPool(selected, async (canonicalUrl) => {
    const pathname = new URL(canonicalUrl).pathname
    await safe(pathname, async () => {
      const { body } = await fetchChecked(pathname, {
        contentType: 'text/html',
        includes: '<article',
        timeout: 60_000,
      })
      if (!body.includes(`rel="canonical" href="${canonicalUrl}"`)) {
        throw new Error(`missing canonical ${canonicalUrl}`)
      }
      if (!body.includes('BlogPosting') || !body.includes('BreadcrumbList')) {
        throw new Error('missing BlogPosting or BreadcrumbList structured data')
      }
    })
  })

  const gallerySamples = [
    ['species', 'mudkip'],
    ['illustrator', '5ban-graphics'],
    ['expansion', 'base-set'],
  ]
  for (const [kind, slug] of gallerySamples) {
    await safe(`R2 gallery API ${kind}`, () =>
      fetchChecked(`/api/card-gallery?kind=${kind}&slug=${slug}`, {
        contentType: 'application/json',
        headers: {
          'cache-control': ['max-age=300', 's-maxage=86400', 'stale-while-revalidate=604800'],
          'x-content-type-options': 'nosniff',
        },
        includes: '"cards"',
      })
    )
  }

  const summary = [
    `## Blog route audit`,
    `- Base URL: ${baseUrl.origin}`,
    `- Sitemap posts: ${postUrls.length}`,
    `- Posts crawled: ${selected.length}`,
    `- Homepage check: ${skipHomepage ? 'skipped' : 'enabled'}`,
    `- Checks passed: ${checks.length}`,
    `- Warnings: ${warnings.length}`,
    `- Failures: ${failures.length}`,
  ]
  if (warnings.length) summary.push('', ...warnings.map((warning) => `- ⚠️ ${warning}`))
  if (failures.length) {
    const displayedFailures = failures.slice(0, 100)
    summary.push('', ...displayedFailures.map((failure) => `- ❌ ${failure}`))
    if (failures.length > displayedFailures.length) {
      summary.push(`- … ${failures.length - displayedFailures.length} more failures omitted`)
    }
  }
  console.log(summary.join('\n'))
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`)
  }
  if (failures.length) process.exitCode = 1
}

await main()
