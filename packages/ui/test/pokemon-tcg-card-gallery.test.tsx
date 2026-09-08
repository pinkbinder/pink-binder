import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import type { PokemonTcgCard } from '@repo/data/client'
import { PokemonTcgCardGallery } from '../src/components/blog/pokemon-tcg-card-gallery'

mock.module('../src/components/blog/pokemon-tcg-card-tile', () => ({
  PokemonTcgCardTile: ({ card }: { card: PokemonTcgCard }) => <div>{card.name}</div>,
}))

function card(index: number): PokemonTcgCard {
  return {
    id: `card-${index}`,
    name: `Card ${index}`,
    imageSmall: `/card-${index}.png`,
    imageLarge: `/card-${index}-large.png`,
    rarity: null,
    setName: 'Test Set',
    setSeries: 'Test Series',
    number: String(index),
    artist: null,
  }
}

const initialCards = Array.from({ length: 12 }, (_, index) => card(index + 1))
const manifestCards = Array.from({ length: 40 }, (_, index) => card(index + 1))

function renderGallery(
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
) {
  return render(
    <PokemonTcgCardGallery
      cards={initialCards}
      displayName="Pikachu"
      totalCount={manifestCards.length}
      source={{ kind: 'species', slug: 'pikachu' }}
    />,
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    }
  )
}

beforeEach(() => {
  globalThis.fetch = mock().mockResolvedValue({
    ok: true,
    json: async () => ({
      version: 1,
      kind: 'species',
      slug: 'pikachu',
      cards: manifestCards,
    }),
  }) as unknown as typeof fetch
})

afterEach(() => cleanup())

describe('PokemonTcgCardGallery', () => {
  it('loads the manifest on demand and reveals the next bounded page', async () => {
    const user = userEvent.setup()
    renderGallery()

    expect(screen.getByText(/Showing\s+12\s+of\s+40\s+cards/)).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Show more (28 remaining)' }))

    expect(await screen.findByText('Card 36')).not.toBeNull()
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/card-gallery?kind=species&slug=pikachu',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(screen.getByText(/Showing\s+36\s+of\s+40\s+cards/)).not.toBeNull()
  })

  it('reuses a fresh manifest across remounts with the same query client', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const first = renderGallery(queryClient)
    await user.click(screen.getByRole('button', { name: 'Show more (28 remaining)' }))
    expect(await screen.findByText('Card 36')).not.toBeNull()
    first.unmount()

    renderGallery(queryClient)
    await user.click(screen.getByRole('button', { name: 'Show more (28 remaining)' }))
    expect(await screen.findByText('Card 36')).not.toBeNull()
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('keeps initial cards visible and offers a recoverable error state', async () => {
    const user = userEvent.setup()
    globalThis.fetch = mock().mockResolvedValue({
      ok: false,
      status: 503,
    }) as unknown as typeof fetch
    renderGallery()

    await user.click(screen.getByRole('button', { name: 'Show more (28 remaining)' }))

    expect((await screen.findByRole('status')).textContent).toContain('Those cards did not load')
    expect(screen.getByText('Card 1')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Show more (28 remaining)' })).not.toBeNull()
  })
})
