import type { APIRoute } from 'astro'
import { BLOG_INDEX_INITIAL_COUNT } from '@repo/data/client'
import type { BlogGridQuery } from '@repo/data/client'
import { filterBlogGridPostsCached, getBlogGridDataset } from '../../lib/blog-grid-data'

export const prerender = false

const MAX_PAGE_SIZE = 48

function boundedInteger(value: string | null, fallback: number, maximum: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, maximum)) : fallback
}

function readQuery(searchParams: URLSearchParams): BlogGridQuery {
  const value = (key: string) => searchParams.get(key)?.trim() || null
  return {
    type: value('type'),
    generation: value('generation'),
    list: value('list'),
    illustrator: value('illustrator'),
    expansion: value('expansion'),
    pokemon: value('pokemon'),
    themes: value('themes') ?? value('collection'),
    tag: value('tag'),
    filter: value('filter'),
    q: value('q')?.slice(0, 120) ?? null,
  }
}

const CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800',
  'X-Content-Type-Options': 'nosniff',
}

/**
 * Canonical URL order — identical to `blogGridQueryString` on the client.
 * The CDN keys its cache on the full URL, so a reordered or alias-spelled
 * query (`?collection=` for `themes`, `?tag=` before `?q=`) would mint a
 * second entry for the same filtered result. Redirecting once to the
 * canonical form keeps one cache slot per semantic query; the client already
 * emits this order, so in-app requests never pay the redirect.
 */
const CANONICAL_PARAM_ORDER = [
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
  'offset',
  'limit',
] as const

function canonicalSearch(searchParams: URLSearchParams): string {
  const canonical = new URLSearchParams()
  if (searchParams.has('facets')) canonical.set('facets', '1')
  for (const key of CANONICAL_PARAM_ORDER) {
    let value = searchParams.get(key)?.trim()
    if (key === 'themes' && !value) value = searchParams.get('collection')?.trim()
    if (key === 'q' && value) value = value.slice(0, 120)
    // ?limit=999 and ?limit=48 resolve to the same page — collapse them.
    if (key === 'offset' && value) value = String(boundedInteger(value, 0, Number.MAX_SAFE_INTEGER))
    if (key === 'limit' && value)
      value = String(boundedInteger(value, BLOG_INDEX_INITIAL_COUNT, MAX_PAGE_SIZE))
    if (value) canonical.set(key, value)
  }
  const query = canonical.toString()
  return query ? `?${query}` : ''
}

/** Small, CDN-cacheable pages of cards; filtering stays on the server. */
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url)
  const canonical = canonicalSearch(url.searchParams)
  if (url.search !== canonical) {
    return Response.redirect(new URL(`${url.pathname}${canonical}`, url.origin), 308)
  }
  const { searchParams } = url
  const dataset = await getBlogGridDataset(new Date(), locals)

  // Facet options for the grid filter dropdowns. Served separately from the
  // index page so ~230 KB of facet JSON is fetched on demand (CDN-cached)
  // instead of serialized into every page. The body is serialized once per
  // index generation in the dataset, not once per request.
  if (searchParams.has('facets')) {
    return new Response(dataset.facetsJson, {
      headers: { ...CACHE_HEADERS, 'content-type': 'application/json' },
    })
  }

  const offset = boundedInteger(searchParams.get('offset'), 0, Number.MAX_SAFE_INTEGER)
  const limit = boundedInteger(searchParams.get('limit'), BLOG_INDEX_INITIAL_COUNT, MAX_PAGE_SIZE)
  const matchingPosts = filterBlogGridPostsCached(dataset, readQuery(searchParams))

  return Response.json(
    {
      posts: matchingPosts.slice(offset, offset + limit),
      total: matchingPosts.length,
      nextOffset: Math.min(offset + limit, matchingPosts.length),
    },
    { headers: CACHE_HEADERS }
  )
}
