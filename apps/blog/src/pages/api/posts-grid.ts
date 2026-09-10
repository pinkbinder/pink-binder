import type { APIRoute } from 'astro'
import { BLOG_INDEX_INITIAL_COUNT } from '@repo/data/client'
import type { BlogGridQuery } from '@repo/data/client'
import {
  buildBlogGridFacets,
  filterBlogGridPosts,
  getPublishedBlogGridPostsForRequest,
} from '../../lib/blog-grid-data'

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
  }
}

const CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800',
  'X-Content-Type-Options': 'nosniff',
}

/** Small, CDN-cacheable pages of cards; filtering stays on the server. */
export const GET: APIRoute = async ({ request, locals }) => {
  const { searchParams } = new URL(request.url)
  const posts = await getPublishedBlogGridPostsForRequest(new Date(), locals)

  // Facet options for the grid filter dropdowns. Served separately from the
  // index page so ~230 KB of facet JSON is fetched on demand (CDN-cached)
  // instead of serialized into every page.
  if (searchParams.has('facets')) {
    return Response.json({ facets: buildBlogGridFacets(posts) }, { headers: CACHE_HEADERS })
  }

  const offset = boundedInteger(searchParams.get('offset'), 0, Number.MAX_SAFE_INTEGER)
  const limit = boundedInteger(searchParams.get('limit'), BLOG_INDEX_INITIAL_COUNT, MAX_PAGE_SIZE)
  const matchingPosts = filterBlogGridPosts(posts, readQuery(searchParams))

  return Response.json(
    {
      posts: matchingPosts.slice(offset, offset + limit),
      total: matchingPosts.length,
      nextOffset: Math.min(offset + limit, matchingPosts.length),
    },
    { headers: CACHE_HEADERS }
  )
}
