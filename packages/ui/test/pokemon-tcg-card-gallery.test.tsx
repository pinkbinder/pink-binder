import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, mock } from 'bun:test'
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

const allCards = Array.from({ length: 40 }, (_, index) => card(index + 1))

afterEach(() => {
  cleanup()
})

describe('PokemonTcgCardGallery', () => {
  it('renders the intro and the initially visible cards', () => {
    render(
      <PokemonTcgCardGallery cards={allCards} displayName="Pikachu" totalCount={allCards.length} />
    )
    expect(
      screen.getByText('Recent cards featuring Pikachu from the Trading Card Game, newest first.')
    ).toBeDefined()
    expect(screen.getByText('Card 1')).toBeDefined()
    expect(screen.getByText('Card 12')).toBeDefined()
  })

  it('keeps the remaining cards inside a collapsed details section', () => {
    const { container } = render(
      <PokemonTcgCardGallery cards={allCards} displayName="Pikachu" totalCount={allCards.length} />
    )
    const details = container.querySelector('details')
    expect(details).not.toBeNull()
    expect(details!.hasAttribute('open')).toBe(false)
    expect(screen.getByText('Show more (28 remaining)')).toBeDefined()
    expect(details!.textContent).toContain('Card 13')
    expect(details!.textContent).toContain('Card 40')
  })

  it('renders the attribution line with the total count', () => {
    render(
      <PokemonTcgCardGallery cards={allCards} displayName="Pikachu" totalCount={allCards.length} />
    )
    expect(screen.getByText(/Showing 40 of 40 cards/)).toBeDefined()
  })

  it('renders no details section when every card is initially visible', () => {
    render(<PokemonTcgCardGallery cards={allCards.slice(0, 8)} displayName="Pikachu" />)
    expect(screen.queryByText(/Show more/)).toBeNull()
    expect(screen.queryByText('Card 9')).toBeNull()
  })
})
