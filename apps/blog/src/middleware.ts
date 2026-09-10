import { defineMiddleware } from 'astro:middleware'
import { SECURITY_HEADERS } from '@repo/config'
import { getLegacyPostRedirectPath } from '@repo/data/blog/post-path'
import {
  API_CATALOG_PATH,
  API_DOCS_PATH,
  DISCOVERY_LINK_HEADER,
  OPENAPI_PATH,
} from './lib/agent-discovery-headers'

const BLOG_INDEX_FACET_QUERY_KEYS = [
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

const MARKDOWN_HOME = `# Cute Pokémon Collector Guide

Pink Binder is a Pokémon card blog focused on cute cards, memorable artwork, binder ideas, set previews, and practical collector guides.

## Explore Pink Binder
- [Browse the blog](https://pinkbinder.blog/)
- [Published posts](https://pinkbinder.blog/sitemap.xml)
- [RSS feed](https://pinkbinder.blog/rss.xml)
- [API catalog](https://pinkbinder.blog${API_CATALOG_PATH})
- [API documentation](https://pinkbinder.blog${API_DOCS_PATH})
- [OpenAPI specification](https://pinkbinder.blog${OPENAPI_PATH})
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

  const response = await next()

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
