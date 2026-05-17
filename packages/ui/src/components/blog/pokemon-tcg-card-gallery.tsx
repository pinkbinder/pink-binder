'use client'

import { useState } from 'react'
import type { PokemonTcgCard } from '@repo/data/client'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'

/** ~3 rows on md (4 columns). */
const INITIAL_VISIBLE = 12

export function PokemonTcgCardGallery({
  cards,
  displayName,
}: {
  cards: PokemonTcgCard[]
  displayName: string
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleCards = showAll ? cards : cards.slice(0, INITIAL_VISIBLE)
  const hiddenCount = cards.length - INITIAL_VISIBLE

  return (
    <>
      <p className="text-muted-foreground mt-2 text-sm">
        Recent cards featuring {displayName} from the Trading Card Game, newest first.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visibleCards.map((card) => (
          <PokemonTcgCardTile key={card.id} card={card} />
        ))}
      </div>
      {!showAll && hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="bg-background hover:bg-muted mt-4 w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Show remaining ({hiddenCount})
        </button>
      ) : null}
      <p className="text-muted-foreground mt-4 text-xs">
        Showing {visibleCards.length} of {cards.length} loaded cards · data from{' '}
        <a
          href="https://pokemontcg.io"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          pokemontcg.io
        </a>{' '}
        · images via{' '}
        <a
          href="https://scrydex.com"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Scrydex
        </a>{' '}
        when the official CDN is unavailable
      </p>
    </>
  )
}
