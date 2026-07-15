'use client'

import { useState } from 'react'
import { TCG_CARD_DATA_ATTRIBUTION, TCG_CARD_IMAGE_ATTRIBUTION } from '@repo/data/client'
import type { PokemonTcgCard } from '@repo/data/client'
import { Button } from '../button'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'

/** ~3 rows on md (4 columns). */
const INITIAL_VISIBLE = 12
const LOAD_MORE_COUNT = 24

export interface PokemonTcgCardGallerySource {
  kind: 'species' | 'illustrator' | 'expansion'
  slug: string
}

export function PokemonTcgCardGallery({
  cards,
  displayName,
  subtitle,
  totalCount = cards.length,
  source,
}: {
  cards: PokemonTcgCard[]
  displayName: string
  /** Overrides the default species intro line. */
  subtitle?: string
  totalCount?: number
  source?: PokemonTcgCardGallerySource
}) {
  const [visibleCards, setVisibleCards] = useState(() => cards.slice(0, INITIAL_VISIBLE))
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const hiddenCount = Math.max(0, totalCount - visibleCards.length)
  const primarySource = TCG_CARD_DATA_ATTRIBUTION[0]!
  const backupSource = TCG_CARD_DATA_ATTRIBUTION[1]!
  const introLine =
    subtitle ?? `Recent cards featuring ${displayName} from the Trading Card Game, newest first.`

  async function loadMore() {
    if (!source || isLoading || hiddenCount === 0) return
    setIsLoading(true)
    setLoadError(false)

    try {
      const params = new URLSearchParams({
        kind: source.kind,
        slug: source.slug,
        offset: String(visibleCards.length),
        limit: String(LOAD_MORE_COUNT),
      })
      const response = await fetch(`/api/card-gallery?${params.toString()}`)
      if (!response.ok) throw new Error(`Card gallery request failed (${response.status})`)
      const page = (await response.json()) as { cards: PokemonTcgCard[]; total: number }
      setVisibleCards((current) => {
        const byId = new Map(current.map((card) => [card.id, card]))
        for (const card of page.cards) byId.set(card.id, card)
        return [...byId.values()]
      })
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <p className="text-muted-foreground mt-2 text-sm">{introLine}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visibleCards.map((card) => (
          <PokemonTcgCardTile key={card.id} card={card} />
        ))}
      </div>
      {source && hiddenCount > 0 ? (
        <Button
          variant="outline"
          onClick={() => void loadMore()}
          disabled={isLoading}
          className="mt-4 w-full rounded-xl py-2.5"
        >
          {isLoading ? 'Loading cards…' : `Show more (${hiddenCount} remaining)`}
        </Button>
      ) : null}
      {loadError ? (
        <p className="text-destructive mt-2 text-center text-sm" role="status">
          Those cards did not load. Try again.
        </p>
      ) : null}
      <p className="text-muted-foreground mt-4 text-xs">
        Showing {visibleCards.length} of {totalCount} cards · card data from{' '}
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
