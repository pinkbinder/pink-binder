'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TCG_CARD_DATA_ATTRIBUTION, TCG_CARD_IMAGE_ATTRIBUTION } from '@repo/data/client'
import type { PokemonTcgCard } from '@repo/data/client'
import { Button } from '../button'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'

/** ~3 rows on md (4 columns). */
const INITIAL_VISIBLE = 12
const LOAD_MORE_COUNT = 24

interface PokemonTcgCardGallerySource {
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
  const [visibleCount, setVisibleCount] = useState(() => Math.min(cards.length, INITIAL_VISIBLE))
  const galleryQuery = useQuery({
    queryKey: ['card-gallery', source?.kind ?? null, source?.slug ?? null],
    enabled: false,
    queryFn: async ({ signal }) => {
      if (!source) return cards
      const response = await fetch(
        `/api/card-gallery?kind=${encodeURIComponent(source.kind)}&slug=${encodeURIComponent(source.slug)}`,
        { signal }
      )
      if (!response.ok) throw new Error(`Card gallery request failed (${response.status})`)
      const manifest = (await response.json()) as {
        version?: unknown
        kind?: unknown
        slug?: unknown
        cards?: unknown
      }
      if (
        manifest.version !== 1 ||
        manifest.slug !== source.slug ||
        (source.kind !== 'expansion' && manifest.kind !== source.kind) ||
        !Array.isArray(manifest.cards)
      ) {
        throw new Error('Invalid card gallery manifest')
      }
      return manifest.cards as PokemonTcgCard[]
    },
    staleTime: 24 * 60 * 60 * 1_000,
    gcTime: 30 * 60 * 1_000,
  })
  const allCards = galleryQuery.data ?? cards
  const visibleCards = allCards.slice(0, visibleCount)
  const availableCount = galleryQuery.data?.length ?? totalCount
  const isLoading = galleryQuery.isFetching
  const loadError = galleryQuery.error
  const hiddenCount = Math.max(0, availableCount - visibleCards.length)
  const primarySource = TCG_CARD_DATA_ATTRIBUTION[0]!
  const backupSource = TCG_CARD_DATA_ATTRIBUTION[1]!
  const introLine =
    subtitle ?? `Recent cards featuring ${displayName} from the Trading Card Game, newest first.`

  async function loadMore() {
    if (!source || isLoading || hiddenCount === 0) return
    const manifestCards = galleryQuery.data ?? (await galleryQuery.refetch()).data
    if (!manifestCards) return
    setVisibleCount((current) => Math.min(current + LOAD_MORE_COUNT, manifestCards.length))
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
        Showing {visibleCards.length} of {availableCount} cards · card data from{' '}
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
