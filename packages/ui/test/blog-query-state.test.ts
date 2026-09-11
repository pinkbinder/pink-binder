import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, mock } from 'bun:test'
import type { BlogGridFacets } from '@repo/data/client'
import { blogGridQueryKey } from '../src/lib/blog-grid-query'
import { blogGridQueryString, resolveBlogGridQuery } from '../src/lib/blog-query-state'
import { loadBlogFilterSearchParams } from '../src/lib/blog-query-state-server'

const facets: BlogGridFacets = {
  types: ['Electric', 'Normal'],
  generations: ['Gen I'],
  lists: ['Pokemon Species Guides'],
  illustrators: ['Mitsuhiro Arita'],
  expansions: [{ slug: 'base-set', label: 'Base Set' }],
  pokemon: [{ slug: 'pikachu', label: 'Pikachu' }],
  themes: ['Cute & Cozy'],
  tags: [
    { value: 'pikachu', label: 'Pikachu' },
    { value: 'cute & cozy', label: 'Cute & Cozy' },
  ],
}

describe('blog URL query state', () => {
  it('parses bounded values and rejects overlong input', async () => {
    const parsed = await loadBlogFilterSearchParams({
      type: ' Electric ',
      tag: 'x'.repeat(121),
    })

    expect(parsed.type).toBe('Electric')
    expect(parsed.tag).toBeNull()
  })

  it('validates facets and canonicalizes legacy aliases', () => {
    expect(
      resolveBlogGridQuery(
        { type: 'Unknown', filter: 'pikachu', collection: 'Cute & Cozy' },
        facets
      )
    ).toEqual({
      q: null,
      type: null,
      generation: null,
      list: null,
      illustrator: null,
      expansion: null,
      pokemon: 'pikachu',
      themes: 'Cute & Cozy',
      tag: null,
      filter: null,
    })
  })

  it('passes the free-text search term through and bounds its length', () => {
    expect(resolveBlogGridQuery({ q: '  cute pikachu  ' }, facets)).toMatchObject({
      q: 'cute pikachu',
    })
    expect(resolveBlogGridQuery({ q: 'x'.repeat(200) }, facets)).toMatchObject({
      q: 'x'.repeat(120),
    })
    expect(resolveBlogGridQuery({ q: '   ' }, facets)).toMatchObject({ q: null })
  })

  it('parses the q parameter from the URL', async () => {
    const parsed = await loadBlogFilterSearchParams({ q: 'cute pikachu' })
    expect(parsed.q).toBe('cute pikachu')
  })

  it('includes q first in the canonical query string', () => {
    expect(blogGridQueryString({ q: 'pikachu', type: 'Electric' })).toBe('q=pikachu&type=Electric')
    expect(blogGridQueryKey({ q: 'pikachu', type: 'Electric' })).toEqual([
      'blog-grid',
      'q=pikachu&type=Electric',
    ])
  })

  it('uses stable canonical query keys regardless of object insertion order', () => {
    const first = { type: 'Electric', pokemon: 'pikachu' }
    const second = { pokemon: 'pikachu', type: 'Electric' }

    expect(blogGridQueryString(first)).toBe('type=Electric&pokemon=pikachu')
    expect(blogGridQueryString(second)).toBe(blogGridQueryString(first))
    expect(blogGridQueryKey(second)).toEqual(blogGridQueryKey(first))
  })

  it('deduplicates fresh requests and refetches after explicit invalidation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 5 * 60_000, retry: false } },
    })
    const fetcher = mock().mockResolvedValue({ posts: [], total: 0, nextOffset: 0 })
    const queryKey = blogGridQueryKey({ type: 'Electric' })

    await queryClient.fetchQuery({ queryKey, queryFn: fetcher })
    await queryClient.fetchQuery({ queryKey, queryFn: fetcher })
    expect(fetcher).toHaveBeenCalledTimes(1)

    await queryClient.invalidateQueries({ queryKey })
    await queryClient.fetchQuery({ queryKey, queryFn: fetcher })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
