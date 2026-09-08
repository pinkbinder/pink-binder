import type { InfiniteData } from '@tanstack/react-query'
import type { BlogGridQuery, EnrichedPostForGrid } from '@repo/data/client'
import { blogGridQueryString } from './blog-query-state'

export const BLOG_GRID_STALE_TIME_MS = 5 * 60 * 1_000
export const BLOG_GRID_GC_TIME_MS = 30 * 60 * 1_000
export const BLOG_GRID_INITIAL_PAGE_SIZE = 9
export const BLOG_GRID_NEXT_PAGE_SIZE = 24

export interface BlogGridPage {
  posts: EnrichedPostForGrid[]
  total: number
  nextOffset: number
}

export function blogGridQueryKey(query: BlogGridQuery) {
  return ['blog-grid', blogGridQueryString(query)] as const
}

export function blogGridInitialData(
  posts: EnrichedPostForGrid[],
  total: number
): InfiniteData<BlogGridPage, number> {
  return {
    pages: [{ posts, total, nextOffset: posts.length }],
    pageParams: [0],
  }
}

export async function fetchBlogGridPage(
  query: BlogGridQuery,
  offset: number,
  signal?: AbortSignal
): Promise<BlogGridPage> {
  const params = new URLSearchParams(blogGridQueryString(query))
  params.set('offset', String(offset))
  params.set('limit', String(offset === 0 ? BLOG_GRID_INITIAL_PAGE_SIZE : BLOG_GRID_NEXT_PAGE_SIZE))
  const response = await fetch(`/api/posts-grid?${params.toString()}`, { signal })
  if (!response.ok) throw new Error(`Blog grid request failed (${response.status})`)
  return (await response.json()) as BlogGridPage
}
