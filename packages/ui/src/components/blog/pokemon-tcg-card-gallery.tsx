'use client'

import { useState } from 'react'
import { TCG_CARD_DATA_ATTRIBUTION, TCG_CARD_IMAGE_ATTRIBUTION } from '@repo/marketplaces/config'
import type { PokemonTcgCard } from '@repo/data/client'
import { Button } from '../button'
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
  const primarySource = TCG_CARD_DATA_ATTRIBUTION[0]!
  const backupSource = TCG_CARD_DATA_ATTRIBUTION[1]!

  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground">
        Recent cards featuring {displayName} from the Trading Card Game, newest first.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visibleCards.map((card) => (
          <PokemonTcgCardTile key={card.id} card={card} />
        ))}
      </div>
      {!showAll && hiddenCount > 0 ? (
        <Button
          variant="outline"
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-xl py-2.5"
        >
          Show remaining ({hiddenCount})
        </Button>
      ) : null}
      <p className="mt-4 text-xs text-muted-foreground">
        Showing {visibleCards.length} of {cards.length} loaded cards · card data from{' '}
        <a
          href={primarySource.href}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {primarySource.label}
        </a>{' '}
        with{' '}
        <a
          href={backupSource.href}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {backupSource.label}
        </a>{' '}
        as backup · images via {TCG_CARD_IMAGE_ATTRIBUTION.label} when needed
      </p>
    </>
  )
}
