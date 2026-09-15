import { TCG_CARD_DATA_ATTRIBUTION, TCG_CARD_IMAGE_ATTRIBUTION } from '@repo/data/client'
import type { PokemonTcgCard } from '@repo/data/client'
import { PokemonTcgCardTile } from './pokemon-tcg-card-tile'

/** ~3 rows on md (4 columns). */
const INITIAL_VISIBLE = 12

export function PokemonTcgCardGallery({
  cards,
  displayName,
  subtitle,
  totalCount = cards.length,
}: {
  cards: PokemonTcgCard[]
  displayName: string
  /** Overrides the default species intro line. */
  subtitle?: string
  totalCount?: number
}) {
  const visibleCards = cards.slice(0, INITIAL_VISIBLE)
  const hiddenCards = cards.slice(INITIAL_VISIBLE)
  const primarySource = TCG_CARD_DATA_ATTRIBUTION[0]!
  const backupSource = TCG_CARD_DATA_ATTRIBUTION[1]!
  const introLine =
    subtitle ?? `Recent cards featuring ${displayName} from the Trading Card Game, newest first.`

  return (
    <>
      <p class="text-muted-foreground mt-2 text-sm">{introLine}</p>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visibleCards.map((card) => (
          <PokemonTcgCardTile card={card} />
        ))}
      </div>
      {hiddenCards.length > 0 ? (
        <details class="group mt-4">
          <summary class="border-border bg-background hover:bg-accent/50 focus-visible:ring-ring mt-0 flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden [&::-webkit-details-marker]:hidden">
            <span class="group-open:hidden">Show more ({hiddenCards.length} remaining)</span>
            <span class="hidden group-open:inline">Show less</span>
          </summary>
          <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {hiddenCards.map((card) => (
              <PokemonTcgCardTile card={card} />
            ))}
          </div>
        </details>
      ) : null}
      <p class="text-muted-foreground mt-4 text-xs">
        Showing {cards.length} of {totalCount} cards · card data from{' '}
        <a
          href={primarySource.href}
          target="_blank"
          rel="noreferrer"
          class="underline underline-offset-2"
        >
          {primarySource.label}
        </a>{' '}
        with{' '}
        <a
          href={backupSource.href}
          target="_blank"
          rel="noreferrer"
          class="underline underline-offset-2"
        >
          {backupSource.label}
        </a>{' '}
        as backup · images via {TCG_CARD_IMAGE_ATTRIBUTION.label} when needed
      </p>
    </>
  )
}
