import type { ReactNode } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { BlogGridFacets, EnrichedPostForGrid } from '@repo/data/client'
import { BlogGrid, BlogGridSkeleton } from '../src/components/blog/blog-grid'

const navigation = {
  query: '',
  push: mock(),
}

mock.module('next/navigation', () => {
  let cachedQuery = ''
  let cachedParams = new URLSearchParams()

  return {
    usePathname: () => '/',
    useRouter: () => ({ push: navigation.push }),
    useSearchParams: () => {
      if (cachedQuery !== navigation.query) {
        cachedQuery = navigation.query
        cachedParams = new URLSearchParams(cachedQuery)
      }
      return cachedParams
    },
  }
})

mock.module('next/link', () => ({
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
  }: {
    options: Array<{ value: string; label: string }>
    value: string | null
    onValueChange: (value: string | null) => void
    label: string
  }) => (
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
  ),
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
  navigation.push.mockReset()
  intersectionCallback = undefined

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

describe('BlogGrid', () => {
  it('renders post metadata and synchronizes interactive facet controls to the URL', async () => {
    const user = userEvent.setup()
    render(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    expect(screen.getByText('Pikachu binder guide')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pikachu binder guide' })).toHaveAttribute(
      'href',
      '/posts/species/pikachu'
    )

    await user.click(screen.getByRole('button', { name: /Electric/ }))
    expect(navigation.push).toHaveBeenLastCalledWith('/?type=Electric', { scroll: false })

    await user.selectOptions(screen.getByLabelText('Filter by pokémon species'), 'pikachu')
    expect(navigation.push).toHaveBeenLastCalledWith('/?type=Electric&pokemon=pikachu', {
      scroll: false,
    })

    await user.click(await screen.findByRole('button', { name: 'Clear all' }))
    expect(navigation.push).toHaveBeenLastCalledWith('/', { scroll: false })
  })

  it('loads and deduplicates the next page when the sentinel intersects', async () => {
    const fetchMock = mock().mockResolvedValue({
      ok: true,
      json: async () => ({ posts: [pikachuPost, eeveePost], total: 2, nextOffset: 2 }),
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    render(<BlogGrid posts={[pikachuPost]} facets={facets} total={2} />)
    await waitFor(() => expect(intersectionCallback).toBeTypeOf('function'))

    await act(async () => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(await screen.findByText('Eevee binder guide')).toBeInTheDocument()
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

    render(<BlogGrid posts={[pikachuPost]} facets={facets} total={1} />)

    expect(await screen.findByRole('heading', { name: 'Posts could not load' })).toBeInTheDocument()
    expect(screen.getByText('Please try the catalog again.')).toBeInTheDocument()
  })

  it('renders a stable accessible loading skeleton', () => {
    render(<BlogGridSkeleton />)
    expect(screen.getByLabelText('Loading blog posts')).toHaveAttribute('aria-busy', 'true')
  })
})
