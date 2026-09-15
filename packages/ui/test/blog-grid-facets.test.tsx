import { createSignal } from 'solid-js'
import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { BlogGrid } from '../src/components/blog/blog-grid'
import type { BlogGridFacets } from '@repo/data/client'

const EMPTY: BlogGridFacets = {
  types: [], generations: [], lists: [], illustrators: [],
  expansions: [], pokemon: [], themes: [], tags: [],
}

describe('BlogGrid facets reactivity', () => {
  // Facets hydrate client-side after mount (EMPTY_FACETS -> fetched data);
  // destructuring the prop would freeze the empty state forever.
  it('shows the search box when facets arrive after mount', async () => {
    const queryClient = new QueryClient()
    const [facets, setFacets] = createSignal<BlogGridFacets>(EMPTY)
    render(() => (
      <QueryClientProvider client={queryClient}>
        <BlogGrid posts={[]} total={0} facets={facets()} />
      </QueryClientProvider>
    ))
    expect(screen.queryByText(/Search the entire catalog above/)).toBeNull()
    setFacets({ ...EMPTY, tags: [{ value: 'pikachu', label: 'Pikachu' }] })
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText(/Search the entire catalog above/)).not.toBeNull()
  })
})
