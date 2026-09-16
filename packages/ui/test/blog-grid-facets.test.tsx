import { createSignal } from 'solid-js'
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, mock } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { BlogGrid } from '../src/components/blog/blog-grid'
import type { BlogGridFacets, EnrichedPostForGrid } from '@repo/data/client'

const EMPTY: BlogGridFacets = {
  types: [],
  generations: [],
  lists: [],
  illustrators: [],
  expansions: [],
  pokemon: [],
  themes: [],
  tags: [],
}

const pikachuPost: EnrichedPostForGrid = {
  slug: 'pikachu',
  title: 'Pikachu binder guide',
  description: 'Build a bright Electric-type binder page.',
  date: '2026-01-01',
  image: '/pikachu.png',
  tags: ['pikachu'],
  speciesFilterTags: ['pikachu'],
  featuredSpeciesFilterTags: ['pikachu'],
  expansionFilterTags: ['base-set'],
  categories: ['Electric Type', 'Cute & Cozy'],
  displayCategories: ['Electric Type', 'Cute & Cozy'],
}

describe('BlogGrid facets reactivity', () => {
  // Facets hydrate client-side after mount (EMPTY_FACETS -> fetched data);
  // destructuring the prop would freeze the empty state forever.
  it('keeps the search box mounted while facets load, then fills its options', async () => {
    const queryClient = new QueryClient()
    const [facets, setFacets] = createSignal<BlogGridFacets>(EMPTY)
    const [pending, setPending] = createSignal(true)
    render(() => (
      <QueryClientProvider client={queryClient}>
        <BlogGrid posts={[]} total={0} facets={facets()} facetsPending={pending()} />
      </QueryClientProvider>
    ))

    // The search box renders before the tag catalog arrives.
    const combobox = screen.getByRole('combobox', { name: 'Catalog search' })
    expect(screen.queryByText(/Search the entire catalog above/)).not.toBeNull()

    fireEvent.click(combobox)
    expect(screen.queryByText('Loading tag catalog…')).not.toBeNull()
    expect(screen.queryByText('No results')).toBeNull()

    setFacets({ ...EMPTY, tags: [{ value: 'pikachu', label: 'Pikachu' }] })
    setPending(false)
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.queryByText('Loading tag catalog…')).toBeNull()
    expect(screen.queryByText('Pikachu')).not.toBeNull()
  })

  // A filter change swaps the infinite query key; without placeholderData the
  // data goes undefined -> the whole grid unmounts into the empty state.
  it('keeps rendered posts mounted while a filtered query refetches', async () => {
    window.history.replaceState(null, '', '/')
    window.zaraz = { track: () => {}, ecommerce: () => {} } as unknown as typeof window.zaraz
    globalThis.fetch = mock().mockImplementation(
      () => new Promise<Response>(() => {})
    ) as unknown as typeof fetch
    const queryClient = new QueryClient()
    render(() => (
      <QueryClientProvider client={queryClient}>
        <BlogGrid posts={[pikachuPost]} total={1} facets={EMPTY} />
      </QueryClientProvider>
    ))
    expect(screen.queryByText('Pikachu binder guide')).not.toBeNull()

    window.history.pushState(null, '', '/?q=pikachu')
    window.dispatchEvent(new Event('pushstate'))
    await new Promise((r) => setTimeout(r, 0))

    expect(screen.queryByText('No posts found')).toBeNull()
    expect(screen.queryByText('Pikachu binder guide')).not.toBeNull()
  })
})
