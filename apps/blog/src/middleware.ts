import { defineMiddleware } from 'astro:middleware'
import { SECURITY_HEADERS } from '@repo/config'
import { serveWithEdgeCache } from '@repo/config/edge-cache'
import { getLegacyPostRedirectPath } from '@repo/data/blog/post-path'
import {
  API_CATALOG_PATH,
  API_DOCS_PATH,
  DISCOVERY_LINK_HEADER,
  OPENAPI_PATH,
} from './lib/agent-discovery-headers'
import { loadPostPageForRequest, POST_PAGE_CACHE_CONTROL } from './lib/post-render-r2'
import { renderPostMarkdown } from './lib/post-markdown'

const BLOG_ORIGIN = 'https://pinkbinder.blog'

const BLOG_INDEX_FACET_QUERY_KEYS = [
  'q',
  'tag',
  'filter',
  'type',
  'generation',
  'list',
  'illustrator',
  'expansion',
  'pokemon',
  'themes',
] as const

/** Fresh 5 min matches the blog API surfaces; 1 h SWR tail absorbs publish repushes. */
const HTML_EDGE_CACHE_POLICY = { freshFor: 300, staleFor: 3600 }

const MARKDOWN_HOME = `# Cute Pokémon Collector Guide

Pink Binder is a Pokémon card blog focused on cute cards, memorable artwork, binder ideas, set previews, and practical collector guides.

Every post URL also serves full-text Markdown when requested with an \`Accept: text/markdown\` header.

## Explore Pink Binder
- [Browse the blog](${BLOG_ORIGIN}/)
- [LLM content guide (llms.txt)](${BLOG_ORIGIN}/llms.txt)
- [Published posts](${BLOG_ORIGIN}/sitemap.xml)
- [RSS feed](${BLOG_ORIGIN}/rss.xml)
- [API catalog](${BLOG_ORIGIN}${API_CATALOG_PATH})
- [API documentation](${BLOG_ORIGIN}${API_DOCS_PATH})
- [OpenAPI specification](${BLOG_ORIGIN}${OPENAPI_PATH})
`

function acceptsMarkdown(request: Request): boolean {
  return (request.headers.get('accept') ?? '').split(',').some((range) => {
    const [mediaType, ...parameters] = range.trim().toLowerCase().split(';')
    if (mediaType !== 'text/markdown') return false
    return !parameters.some(
      (parameter) => parameter.trim() === 'q=0' || parameter.trim() === 'q=0.0'
    )
  })
}

function discoveryHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers)
  result.set('Link', DISCOVERY_LINK_HEADER)
  return result
}

/**
 * Edge middleware: legacy post redirects, facet-query normalization on `/`,
 * markdown content negotiation for agents, and security + discovery headers
 * on every response.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)
  const { pathname } = url

  // Legacy `/posts/<slug>` single-segment redirects (unchanged behavior).
  if (pathname.startsWith('/posts/')) {
    const segments = pathname.slice('/posts/'.length).split('/').filter(Boolean)
    const redirectPath = getLegacyPostRedirectPath(segments)
    if (redirectPath) {
      url.pathname = redirectPath
      return Response.redirect(url.toString(), 301)
    }
  }

  if (pathname === '/') {
    if (acceptsMarkdown(context.request)) {
      const headers = discoveryHeaders({
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept',
        'X-Markdown-Tokens': String(Math.ceil(MARKDOWN_HOME.length / 4)),
      })
      applySecurity(headers)
      return new Response(MARKDOWN_HOME, { headers })
    }
  }

  // Agent-facing Markdown for articles: the artifact JSON the prebuilt HTML
  // renders from maps cleanly to Markdown, so agents referencing a post get
  // the full text without an HTML-to-text pass. Falls through to HTML when
  // the slug is unknown or the post has no artifact body (authored MDX).
  if (acceptsMarkdown(context.request) && pathname.startsWith('/posts/')) {
    const segments = pathname.slice('/posts/'.length).split('/').filter(Boolean)
    const loaded = await loadPostPageForRequest(segments, context.locals)
    if (loaded.status === 'ok') {
      const body = renderPostMarkdown({
        post: loaded.post,
        head: loaded.head,
        blogUrl: BLOG_ORIGIN,
      })
      const headers = discoveryHeaders({
        'Cache-Control': POST_PAGE_CACHE_CONTROL,
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept',
        'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
      })
      applySecurity(headers)
      return new Response(body, { headers })
    }
  }

  // Public HTML changes only when R2 content is republished, and no blog
  // route is personalized, so query-less GETs of the home and post pages
  // serve through the shared edge cache. Facet and arbitrary query strings
  // bypass it: facet pages render filtered grids and would otherwise fork
  // unbounded cache entries.
  const cacheableHtml =
    context.request.method === 'GET' &&
    url.search === '' &&
    (pathname === '/' || pathname.startsWith('/posts/'))

  // Home pages have no page-level policy; post pages set their own longer
  // one (published articles are immutable, purged on data publish). The
  // fill happens inside produce so the stored cache copy carries the same
  // header the live response does.
  const produce = async (): Promise<Response> => {
    const pageResponse = await next()
    if (pageResponse.ok && !pageResponse.headers.has('Cache-Control')) {
      pageResponse.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
    }
    return pageResponse
  }

  const response = cacheableHtml
    ? await serveWithEdgeCache(context.request, context.locals, produce, HTML_EDGE_CACHE_POLICY)
    : await next()

  // Facet-query index pages stay crawlable but unindexed (unchanged behavior).
  if (pathname === '/') {
    const hasFacetQuery = [...BLOG_INDEX_FACET_QUERY_KEYS, 'collection'].some((key) =>
      Boolean(url.searchParams.get(key)?.trim())
    )
    if (hasFacetQuery) {
      response.headers.set('X-Robots-Tag', 'noindex, follow')
    }
  }

  const headers = discoveryHeaders(response.headers)
  applySecurity(headers)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
})

function applySecurity(headers: Headers): void {
  for (const header of SECURITY_HEADERS) {
    headers.set(header.key, header.value)
  }
}
