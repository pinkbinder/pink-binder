import React from 'react'
import type { ReactElement, ReactNode } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { BlogGridFacets, EnrichedPostForGrid } from '@repo/data/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { BlogGrid, BlogGridSkeleton } from '../src/components/blog/blog-grid'

const navigation = {
  query: '',
  update: mock<(event: UrlUpdateEvent) => void>(),
}

/** Real zaraz-events helpers run; their delivery target is stubbed here. */
const zarazTrackMock =
  mock<(eventName: string, eventProperties?: Record<string, unknown>) => void>()

mock.module('../src/components/compat-link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

mock.module('../src/components/post-card', () => ({
  PostCard: ({ post }: { post: { title: string } }) => <div>{post.title}</div>,
}))

mock.module('../src/components/roundup-post-card', () => ({
  RoundupPostCard: ({ title }: { title: string }) => <div>{title}</div>,
}))

mock.module('../src/components/pokemon-type-logo', () => ({
  PokemonTypeLogo: ({ color }: { color: string }) => <span data-color={color}>type</span>,
}))

mock.module('../src/components/searchable-select', () => ({
  SearchableSelect: ({
    options,
    value,
    onValueChange,
    label,
    freeText,
  }: {
    options: Array<{ value: string; label: string }>
    value: string | null
    onValueChange: (value: string | null) => void
    label: string
    freeText?: {
      labelFor: (search: string) => string
      onAction: (search: string) => void
    }
  }) => {
    const [search, setSearch] = React.useState('')
    return (
      <div>
        <select
          aria-label={label}
          value={value ?? ''}
          onChange={(event) => onValueChange(event.target.value || null)}
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {freeText ? (
          <div>
            <input
              aria-label={`Search ${label} options`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search.trim() ? (
              <button type="button" onClick={() => freeText.onAction(search.trim())}>
                {freeText.labelFor(search.trim())}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  },
}))

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

const eeveePost: EnrichedPostForGrid = {
  ...pikachuPost,
  slug: 'eevee',
  title: 'Eevee binder guide',
  image: '/eevee.png',
  tags: ['eevee'],
  speciesFilterTags: ['eevee'],
  featuredSpeciesFilterTags: ['eevee'],
  categories: ['Normal Type', 'Cute & Cozy'],
  displayCategories: ['Normal Type', 'Cute & Cozy'],
  isMythical: true,
}

const facets: BlogGridFacets = {
  types: ['Electric', 'Normal'],
  generations: ['Gen I'],
  lists: ['Pokemon Species Guides'],
  illustrators: ['Mitsuhiro Arita'],
  expansions: [{ slug: 'base-set', label: 'Base Set' }],
  pokemon: [
    { slug: 'pikachu', label: 'Pikachu' },
    { slug: 'eevee', label: 'Eevee' },
  ],
  themes: ['Cute & Cozy'],
  tags: [
    { value: 'pikachu', label: 'Pikachu' },
    { value: 'cute & cozy', label: 'Cute & Cozy' },
  ],
}

let intersectionCallback: IntersectionObserverCallback | undefined

beforeEach(() => {
  navigation.query = ''
  navigation.update.mockReset()
  zarazTrackMock.mockReset()
  window.zaraz = { track: zarazTrackMock, ecommerce: mock() }
  intersectionCallback = undefined
  globalThis.fetch = mock().mockResolvedValue({
    ok: true,
    json: async () => ({ posts: [pikachuPost], total: 1, nextOffset: 1 }),
  }) as unknown as typeof fetch

  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds = [0]

    constructor(callback: IntersectionObserverCallback) {
      intersectionCallback = callback
    }

    disconnect() {}
    observe() {}
    takeRecords() {
      return []
    }
    unobserve() {}
  }

  globalThis.IntersectionObserver = IntersectionObserverMock
})

function renderBlogGrid(ui: ReactElement, searchParams = navigation.query) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
  })
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={navigation.update} hasMemory>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NuqsTestingAdapter>
    ),
  })
}

describe('BlogGrid', () => {
  it('renders post metadata and synchronizes interactive facet controls to the URL', async () => {
    const user = userEvent.setup()
    renderBlogGrid(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    expect(screen.getByText('Pikachu binder guide')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Pikachu binder guide' })?.getAttribute('href')).toBe(
      '/posts/species/pikachu'
    )

    await user.click(screen.getByRole('button', { name: /Electric/ }))
    expect(navigation.update.mock.calls.at(-1)?.[0].queryString).toBe('?type=Electric')
    expect(navigation.update.mock.calls.at(-1)?.[0].options.history).toBe('push')
    expect(navigation.update.mock.calls.at(-1)?.[0].options.shallow).toBe(true)

    await user.selectOptions(screen.getByLabelText('Filter by pokémon species'), 'pikachu')
    expect(navigation.update.mock.calls.at(-1)?.[0].queryString).toBe(
      '?type=Electric&pokemon=pikachu'
    )

    await user.click(await screen.findByRole('button', { name: 'Clear all' }))
    expect(navigation.update.mock.calls.at(-1)?.[0].queryString).toBe('')
  })

  it('commits search terms to the URL and reports them as search events', async () => {
    const user = userEvent.setup()
    renderBlogGrid(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    // The merged catalog select doubles as the text search: type a phrase and
    // commit the free-text action ("Search collector guides for …").
    await user.type(screen.getByLabelText('Search Catalog search options'), 'pika')
    await user.click(screen.getByText('Search collector guides for "pika"'))
    await waitFor(
      () => expect(zarazTrackMock).toHaveBeenCalledWith('search', { search_term: 'pika' }),
      { timeout: 3000 }
    )
    expect(navigation.update.mock.calls.at(-1)?.[0].queryString).toBe('?q=pika')
  })

  it('reports filter changes as apply and clear filter events', async () => {
    const user = userEvent.setup()
    renderBlogGrid(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    await user.click(screen.getByRole('button', { name: /Electric/ }))
    expect(zarazTrackMock).toHaveBeenCalledWith('filter', {
      filter_group: 'type',
      filter_value: 'Electric',
      filter_action: 'apply',
    })

    await user.click(await screen.findByRole('button', { name: 'Clear all' }))
    expect(zarazTrackMock).toHaveBeenCalledWith('filter', {
      filter_group: 'type',
      filter_action: 'clear',
    })
    expect(zarazTrackMock.mock.calls.filter(([eventName]) => eventName === 'filter')).toHaveLength(
      2
    )
  })

  it('does not report catalog tag selections as search events', async () => {
    const user = userEvent.setup()
    renderBlogGrid(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    // 'pikachu' promotes from the tag catalog to the Pokémon species facet.
    await user.selectOptions(screen.getByLabelText('Catalog search'), 'pikachu')
    expect(zarazTrackMock.mock.calls.filter(([eventName]) => eventName === 'search')).toHaveLength(
      0
    )
    expect(zarazTrackMock).toHaveBeenCalledWith('filter', {
      filter_group: 'pokemon',
      filter_value: 'pikachu',
      filter_action: 'apply',
    })
  })

  it('loads and deduplicates the next page when the sentinel intersects', async () => {
    const fetchMock = mock().mockResolvedValue({
      ok: true,
      json: async () => ({ posts: [pikachuPost, eeveePost], total: 2, nextOffset: 2 }),
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    renderBlogGrid(<BlogGrid posts={[pikachuPost]} facets={facets} total={2} />)
    await waitFor(() => expect(intersectionCallback).toBeTypeOf('function'))

    await act(async () => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(await screen.findByText('Eevee binder guide')).not.toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts-grid?offset=1&limit=24',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(screen.getAllByText('Pikachu binder guide')).toHaveLength(1)
  })

  it('shows the recoverable error state when a filtered request fails', async () => {
    navigation.query = 'type=Electric'
    globalThis.fetch = mock().mockResolvedValue({
      ok: false,
      status: 503,
    }) as unknown as typeof fetch

    renderBlogGrid(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    expect(await screen.findByRole('heading', { name: 'Posts could not load' })).not.toBeNull()
    expect(screen.getByText('Please try the catalog again.')).not.toBeNull()
  })

  it('hydrates a server-filtered URL without repeating its initial request', () => {
    const fetchMock = mock()
    globalThis.fetch = fetchMock as unknown as typeof fetch

    renderBlogGrid(
      <BlogGrid
        posts={[pikachuPost]}
        facets={facets}
        total={1}
        initialQuery={{ type: 'Electric' }}
      />,
      'type=Electric'
    )

    expect(screen.getByText('Pikachu binder guide')).not.toBeNull()
    expect(
      screen
        .getAllByRole('button', { name: /Electric/ })
        .some((button) => button.getAttribute('aria-pressed') === 'true')
    ).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects invalid URL facets and keeps the canonical server result', () => {
    const fetchMock = mock()
    globalThis.fetch = fetchMock as unknown as typeof fetch

    renderBlogGrid(
      <BlogGrid posts={[pikachuPost]} facets={facets} total={1} initialQuery={{}} />,
      'type=Unknown'
    )

    expect(screen.getByText('Pikachu binder guide')).not.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders a stable accessible loading skeleton', () => {
    render(<BlogGridSkeleton />)
    expect(screen.getByLabelText('Loading blog posts')?.getAttribute('aria-busy')).toBe('true')
  })
})
