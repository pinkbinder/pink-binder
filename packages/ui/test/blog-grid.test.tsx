import { createSignal, type JSX } from 'solid-js'
import { render, screen, waitFor } from '@solidjs/testing-library'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { BlogGridFacets, EnrichedPostForGrid } from '@repo/data/client'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { BlogGrid, BlogGridSkeleton } from '../src/components/blog/blog-grid'

/** Real zaraz-events helpers run; their delivery target is stubbed here. */
const zarazTrackMock =
  mock<(eventName: string, eventProperties?: Record<string, unknown>) => void>()

mock.module('../src/components/compat-link', () => ({
  default: (props: {
    children?: JSX.Element
    href: string
    class?: string
    onClick?: () => void
  }) => (
    <a href={props.href} class={props.class} onClick={props.onClick}>
      {props.children}
    </a>
  ),
}))

mock.module('../src/components/post-card', () => ({
  PostCard: (props: { post: { title: string } }) => <div>{props.post.title}</div>,
}))

mock.module('../src/components/roundup-post-card', () => ({
  RoundupPostCard: (props: { title: string }) => <div>{props.title}</div>,
}))

mock.module('../src/components/pokemon-type-logo', () => ({
  PokemonTypeLogo: (props: { color: string }) => <span data-color={props.color}>type</span>,
}))

mock.module('../src/components/searchable-select', () => ({
  SearchableSelect: (props: {
    options: Array<{ value: string; label: string }>
    value: string | null
    onValueChange: (value: string | null) => void
    label: string
    freeText?: {
      labelFor: (search: string) => string
      onAction: (search: string) => void
    }
  }) => {
    const [search, setSearch] = createSignal('')
    return (
      <div>
        <select
          aria-label={props.label}
          value={props.value ?? ''}
          onChange={(event) => props.onValueChange(event.target.value || null)}
        >
          <option value="">All</option>
          {props.options.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
        {props.freeText ? (
          <div>
            <input
              aria-label={`Search ${props.label} options`}
              value={search()}
              onInput={(event) => setSearch(event.target.value)}
            />
            {search().trim() ? (
              <button type="button" onClick={() => props.freeText!.onAction(search().trim())}>
                {props.freeText!.labelFor(search().trim())}
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
let pushStateSpy: ReturnType<typeof mock>

beforeEach(() => {
  zarazTrackMock.mockReset()
  window.zaraz = { track: zarazTrackMock, ecommerce: mock() }
  intersectionCallback = undefined
  globalThis.fetch = mock().mockResolvedValue({
    ok: true,
    json: async () => ({ posts: [pikachuPost], total: 1, nextOffset: 1 }),
  }) as unknown as typeof fetch

  window.history.replaceState(null, '', '/')
  pushStateSpy = mock(window.history.pushState.bind(window.history))
  window.history.pushState = pushStateSpy as unknown as typeof window.history.pushState

  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds = [0]

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      // Only the load-more sentinel observer uses a rootMargin; other
      // components (lazy images) construct their own observers.
      if (options?.rootMargin === '480px') {
        intersectionCallback = callback
      }
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

function renderBlogGrid(ui: () => JSX.Element, searchParams = '') {
  window.history.replaceState(null, '', searchParams ? `/?${searchParams}` : '/')
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
  })
  return render(ui, {
    wrapper: (props: { children?: JSX.Element }) => (
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    ),
  })
}

describe('BlogGrid', () => {
  it('renders post metadata and synchronizes interactive facet controls to the URL', async () => {
    const user = userEvent.setup()
    renderBlogGrid(() => <BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    expect(screen.getByText('Pikachu binder guide')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Pikachu binder guide' })?.getAttribute('href')).toBe(
      '/posts/species/pikachu'
    )

    await user.click(screen.getByRole('button', { name: /Electric/ }))
    expect(window.location.search).toBe('?type=Electric')
    expect(pushStateSpy).toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText('Filter by pokémon species'), 'pikachu')
    expect(window.location.search).toBe('?type=Electric&pokemon=pikachu')

    await user.click(await screen.findByRole('button', { name: 'Clear all' }))
    expect(window.location.search).toBe('')
  })

  it('commits search terms to the URL and reports them as search events', async () => {
    const user = userEvent.setup()
    renderBlogGrid(() => <BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    // The merged catalog select doubles as the text search: type a phrase and
    // commit the free-text action ("Search collector guides for …").
    await user.type(screen.getByLabelText('Search Catalog search options'), 'pika')
    await user.click(screen.getByText('Search collector guides for "pika"'))
    await waitFor(
      () => expect(zarazTrackMock).toHaveBeenCalledWith('search', { search_term: 'pika' }),
      { timeout: 3000 }
    )
    expect(window.location.search).toBe('?q=pika')
  })

  it('reports filter changes as apply and clear filter events', async () => {
    const user = userEvent.setup()
    renderBlogGrid(() => <BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

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
    renderBlogGrid(() => <BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

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

    renderBlogGrid(() => <BlogGrid posts={[pikachuPost]} facets={facets} total={2} />)
    await waitFor(() => expect(intersectionCallback).toBeTypeOf('function'))

    intersectionCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )

    expect(await screen.findByText('Eevee binder guide')).not.toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts-grid?offset=1&limit=24',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(screen.getAllByText('Pikachu binder guide')).toHaveLength(1)
  })

  it('shows the recoverable error state when a filtered request fails', async () => {
    globalThis.fetch = mock().mockResolvedValue({
      ok: false,
      status: 503,
    }) as unknown as typeof fetch

    renderBlogGrid(
      () => <BlogGrid posts={[pikachuPost]} facets={facets} total={1} />,
      'type=Electric'
    )

    expect(await screen.findByRole('heading', { name: 'Posts could not load' })).not.toBeNull()
    expect(screen.getByText('Please try the catalog again.')).not.toBeNull()
  })

  it('hydrates a server-filtered URL without repeating its initial request', () => {
    const fetchMock = mock()
    globalThis.fetch = fetchMock as unknown as typeof fetch

    renderBlogGrid(
      () => (
        <BlogGrid
          posts={[pikachuPost]}
          facets={facets}
          total={1}
          initialQuery={{ type: 'Electric' }}
        />
      ),
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
      () => <BlogGrid posts={[pikachuPost]} facets={facets} total={1} initialQuery={{}} />,
      'type=Unknown'
    )

    expect(screen.getByText('Pikachu binder guide')).not.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders a stable accessible loading skeleton', () => {
    render(() => <BlogGridSkeleton />)
    expect(screen.getByLabelText('Loading blog posts')?.getAttribute('aria-busy')).toBe('true')
  })
})
